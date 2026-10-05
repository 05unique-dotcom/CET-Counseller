/**
 * Fetches admission content (colleges, cutoffs, CAP rounds, categories)
 * from Sanity and renders it as context text for the counsellor.
 *
 * Returns null when Sanity is unreachable or has no content yet, so the
 * caller can fall back to the built-in sample data.
 */
import { sanityClient } from "@/sanity/client";

type SanityCutoff = {
  category?: string;
  round1?: number;
  round2?: number;
  round3?: number;
};

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
  keyPoints?: string[];
};

type SanityCategory = {
  name?: string;
  code?: string;
  requiredDocuments?: string[] | string;
  reservationRules?: string[] | string;
};

function asList(value: string[] | string | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export async function fetchSanityKnowledgeContext(): Promise<string | null> {
  try {
    const [colleges, capRounds, categories] = await Promise.all([
      sanityClient.fetch<SanityCollege[]>(
        `*[_type == "college"] | order(name asc) { name, shortName, location, collegeType, branches }`,
      ),
      sanityClient.fetch<SanityCapRound[]>(
        `*[_type == "capRound"] | order(roundNumber asc)`,
      ),
      sanityClient.fetch<SanityCategory[]>(`*[_type == "category"] | order(name asc)`),
    ]);

    if (!colleges.length && !capRounds.length && !categories.length) return null;

    const parts: string[] = [];

    if (colleges.length) {
      parts.push("## Colleges and cutoffs (official Maharashtra CET Cell 2026-27 data)");
      for (const c of colleges) {
        parts.push(
          `\n### ${c.name ?? "College"}${c.shortName ? ` (${c.shortName})` : ""} — ${c.location ?? ""}${c.collegeType ? `, ${c.collegeType}` : ""}`,
        );
        for (const b of c.branches ?? []) {
          parts.push(`- Branch: ${b.name ?? "?"}`);
          for (const cut of b.cutoffs ?? []) {
            const rounds = [
              cut.round1 != null ? `CAP R1: ${cut.round1}` : null,
              cut.round2 != null ? `CAP R2: ${cut.round2}` : null,
              cut.round3 != null ? `CAP R3: ${cut.round3}` : null,
            ]
              .filter(Boolean)
              .join(", ");
            if (rounds) parts.push(`  - ${cut.category}: ${rounds}`);
          }
        }
      }
    }

    if (capRounds.length) {
      parts.push("\n## CAP rounds");
      for (const r of capRounds) {
        const dates = [r.startDate, r.endDate].filter(Boolean).join(" to ");
        parts.push(
          `- ${r.title ?? r.name ?? `Round ${r.roundNumber ?? "?"}`}${dates ? ` (${dates})` : ""}: ${r.description ?? ""}`,
        );
        for (const p of r.keyPoints ?? []) parts.push(`  - ${p}`);
      }
    }

    if (categories.length) {
      parts.push("\n## Seat categories");
      for (const cat of categories) {
        parts.push(`- ${cat.name ?? cat.code ?? "Category"}:`);
        for (const d of asList(cat.requiredDocuments)) parts.push(`  - Document: ${d}`);
        for (const r of asList(cat.reservationRules)) parts.push(`  - Rule: ${r}`);
      }
    }

    return parts.join("\n");
  } catch {
    return null;
  }
}
