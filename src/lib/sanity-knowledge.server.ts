/**
 * Fetches only the admission content relevant to the student's question
 * (matching colleges/branches/categories) from Sanity, keeping the AI prompt small (~500 tokens).
 *
 * Returns null when Sanity is unreachable or empty so the caller can fall back
 * to the built-in sample data.
 */
import { sanityClient } from "@/sanity/client";

type SanityCutoff = { category?: string; round1?: number; round2?: number; round3?: number };
type SanityBranch = { name?: string; cutoffs?: SanityCutoff[] };
type SanityCollege = {
  name?: string;
  shortName?: string;
  location?: string;
  collegeType?: string;
  branches?: SanityBranch[];
};
type SanityCapRound = {
  roundNumber?: number;
  title?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
};
type SanityCategory = {
  name?: string;
  code?: string;
  requiredDocuments?: string[] | string;
  reservationRules?: string[] | string;
};

const MAX_COLLEGES = 20;

const CATEGORY_ALIASES: Record<string, string[]> = {
  OPEN: ["open", "general"],
  OBC: ["obc"],
  SC: ["sc"],
  ST: ["st"],
  VJNT: ["vjnt", "nt1", "nt2", "nt3", "nt-a", "nt-b", "nt-c", "nt-d", "nt"],
  EWS: ["ews"],
  TFWS: ["tfws", "tuition fee waiver"],
  PWD: ["pwd", "disab", "handicap"],
  DEFENCE: ["defence", "defense", "def"],
  EXS: ["ex-servicemen", "ex servicemen", "exs", "esm"],
};

const BRANCH_ALIASES: Array<[RegExp, string[]]> = [
  [/\b(cs|cse|computer|comp)\b/, ["computer"]],
  [/\b(it|information technology)\b/, ["information technology"]],
  [/\b(ai|aids|ai ?& ?ds|artificial|data science)\b/, ["artificial", "data science"]],
  [/\b(ml|machine learning)\b/, ["machine learning"]],
  [/\b(cyber)\b/, ["cyber"]],
];

const STOPWORDS = new Set(
  "the and for with what which college colleges cutoff cutoffs round cap can get admission engineering institute of technology in my is a an to i me pune mumbai percentile percent marks category branch seat seats please tell about best list documents document required rules rule process procedure how when date dates explain freeze betterment".split(
    " ",
  ),
);

function asList(value: string[] | string | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function analyze(question: string) {
  const q = ` ${question.toLowerCase()} `;
  const categories = Object.entries(CATEGORY_ALIASES)
    .filter(([, al]) => al.some((a) => new RegExp(`\\b${a.replace(/[-]/g, "[- ]?")}`).test(q)))
    .map(([c]) => c);
  const branches = BRANCH_ALIASES.filter(([re]) => re.test(q)).flatMap(([, k]) => k);
  const cities = ["pune", "mumbai"].filter((c) => q.includes(c));
  const pct = q.match(/\b(\d{2}(?:\.\d+)?)\s*(?:%|percentile|pct|percent)?/);
  const percentile = pct ? Number(pct[1]) : null;
  const words = (q.match(/[a-z]{2,}/g) ?? []).filter((w) => !STOPWORDS.has(w));
  const needsColleges =
    words.length > 0 || percentile != null || branches.length > 0 || cities.length > 0;
  return {
    categories,
    branches,
    cities,
    percentile: percentile && percentile >= 40 && percentile <= 100 ? percentile : null,
    words,
    needsColleges,
  };
}

function scoreCollege(c: SanityCollege, words: string[]): number {
  const hay = `${c.name ?? ""} ${c.shortName ?? ""}`.toLowerCase();
  const short = (c.shortName ?? "").toLowerCase();
  let s = 0;
  for (const w of words) {
    if (short && short === w) s += 10;
    else if (new RegExp(`\\b${w}`).test(hay)) s += w.length >= 4 ? 3 : 1;
  }
  return s;
}

export async function fetchSanityKnowledgeContext(question = ""): Promise<string | null> {
  try {
    const a = analyze(question);
    const [colleges, capRounds, categories] = await Promise.all([
      a.needsColleges
        ? sanityClient.fetch<SanityCollege[]>(
            `*[_type == "college"]{ name, shortName, location, collegeType, branches[]{ name, cutoffs[]{ category, round1, round2, round3 } } }`,
          )
        : Promise.resolve([] as SanityCollege[]),
      sanityClient.fetch<SanityCapRound[]>(
        `*[_type == "capRound"] | order(roundNumber asc){ roundNumber, title, name, startDate, endDate, description }`,
      ),
      sanityClient.fetch<SanityCategory[]>(`*[_type == "category"] | order(name asc)`),
    ]);

    if (!colleges.length && !capRounds.length && !categories.length) return null;

    // Narrow colleges by city, branch, name match, percentile
    let pool = colleges.filter(
      (c) => !a.cities.length || a.cities.some((x) => (c.location ?? "").toLowerCase().includes(x)),
    );
    const branchOk = (b: SanityBranch) =>
      !a.branches.length || a.branches.some((k) => (b.name ?? "").toLowerCase().includes(k));
    const catOk = (cut: SanityCutoff) =>
      !a.categories.length || a.categories.includes((cut.category ?? "").toUpperCase());

    pool = pool
      .map((c) => ({
        ...c,
        branches: (c.branches ?? [])
          .filter(branchOk)
          .map((b) => ({ ...b, cutoffs: (b.cutoffs ?? []).filter(catOk) }))
          .filter((b) => b.cutoffs.length),
      }))
      .filter((c) => c.branches.length);

    const named = pool
      .map((c) => ({ c, s: scoreCollege(c, a.words) }))
      .filter((x) => x.s >= 3)
      .sort((x, y) => y.s - x.s)
      .map((x) => x.c);

    let selected: SanityCollege[];
    if (named.length) {
      selected = named.slice(0, MAX_COLLEGES);
    } else if (a.percentile != null) {
      const p = a.percentile;
      const closest = (c: SanityCollege) => {
        let best = Infinity;
        for (const b of c.branches ?? [])
          for (const cut of b.cutoffs ?? []) {
            const v = cut.round1 ?? cut.round2 ?? cut.round3;
            if (v != null) best = Math.min(best, Math.abs(v - (p + 0.5)));
          }
        return best;
      };
      selected = pool
        .map((c) => ({ c, d: closest(c) }))
        .filter((x) => x.d <= 6)
        .sort((x, y) => x.d - y.d)
        .slice(0, MAX_COLLEGES)
        .map((x) => x.c);
    } else if (a.branches.length || a.cities.length) {
      const top = (c: SanityCollege) =>
        Math.max(0, ...(c.branches ?? []).flatMap((b) => (b.cutoffs ?? []).map((x) => x.round1 ?? 0)));
      selected = [...pool].sort((x, y) => top(y) - top(x)).slice(0, MAX_COLLEGES);
    } else {
      selected = [];
    }

    const parts: string[] = [];
    if (selected.length) {
      parts.push(`## Cutoffs (R1/R2/R3 %ile; '-' = no seat):`);
      for (const c of selected) {
        const branchParts = (c.branches ?? []).map((b) => {
          const cuts = (b.cutoffs ?? [])
            .map((x) => `${x.category} ${[x.round1, x.round2, x.round3].map((v) => (v == null ? "-" : v)).join("/")}`)
            .join("; ");
          return `${b.name}: [${cuts}]`;
        });
        parts.push(`- ${c.shortName ? `${c.shortName} (${c.name})` : c.name} [${c.location ?? ""}]: ${branchParts.join(" | ")}`);
      }
    } else if (colleges.length && a.needsColleges) {
      parts.push(`(No specific colleges matched; prompt student for college name, branch, percentile or category.)`);
    }

    // Attach CAP rounds only when the question touches rounds, schedules, or procedure
    const isRoundQuery = /\b(cap|round|date|schedule|freeze|betterment|acceptance|admission process|deadline)\b/i.test(question);
    if (capRounds.length && isRoundQuery) {
      parts.push("\n## CAP Rounds:");
      for (const r of capRounds) {
        const dates = [r.startDate, r.endDate].filter(Boolean).join(" to ");
        parts.push(`- ${r.title ?? `Round ${r.roundNumber}`}${dates ? ` (${dates})` : ""}: ${r.description ?? ""}`);
      }
    }

    // Attach category docs only when asked about categories, documents, or certificates
    const isDocQuery = /\b(doc|document|certificate|validity|ncl|non-creamy|creamy|reservation|eligib|proof)\b/i.test(question);
    if (categories.length && (isDocQuery || a.categories.length > 0)) {
      parts.push("\n## Category Documents & Rules:");
      const relevant = a.categories.length
        ? categories.filter((c) =>
            a.categories.some((k) => `${c.code ?? ""} ${c.name ?? ""}`.toUpperCase().includes(k)),
          )
        : categories;
      for (const cat of relevant) {
        const docs = asList(cat.requiredDocuments).join(", ");
        const rules = asList(cat.reservationRules).join("; ");
        parts.push(`- ${cat.name ?? cat.code}: ${docs ? `Docs: ${docs}` : ""}${rules ? ` | Rules: ${rules}` : ""}`);
      }
    }

    return parts.join("\n");
  } catch {
    return null;
  }
}
