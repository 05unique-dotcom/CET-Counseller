import logo from "@/assets/cet-logo.png";
import { Button } from "@/components/ui/button";
import { capRounds, colleges, seatCategories } from "@/data/cet-knowledge";
import { createThread, useThreads } from "@/lib/threads";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, GraduationCap, ListChecks, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CET Counsellor | MHT-CET & JEE admission help for Maharashtra" },
      {
        name: "description",
        content:
          "An AI counsellor for Maharashtra engineering aspirants: CAP rounds, category-wise cutoffs and admission procedures for OPEN, OBC, SC, ST, VJNT, EWS, TFWS, PWD and Defence seats.",
      },
      { property: "og:title", content: "CET Counsellor | MHT-CET & JEE admission help" },
      {
        property: "og:description",
        content:
          "Ask about CAP rounds, college cutoffs and category documents for Maharashtra engineering admissions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const prompts = [
  "96.2 percentile, OBC — which Pune colleges for Computer Engineering?",
  "What is the difference between Freeze, Betterment and Not Accept?",
  "Documents needed for an EWS seat in CAP",
  "Can I use my JEE Main score for Maharashtra CAP?",
];

function Home() {
  const navigate = useNavigate();
  const { threads } = useThreads();

  const start = (text?: string) => {
    const thread = createThread();
    navigate({
      to: "/chat/$threadId",
      params: { threadId: thread.id },
      search: text ? { q: text } : undefined,
    });
  };

  return (
    <main className="min-h-screen surface-grid">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <img src={logo} alt="CET Counsellor" width={36} height={36} className="size-9" />
          <span className="font-display text-lg font-semibold">CET Counsellor</span>
        </div>
        {threads.length > 0 ? (
          <Link
            to="/chat/$threadId"
            params={{ threadId: threads[0]!.id }}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Recent chats
          </Link>
        ) : null}
      </header>

      <section className="mx-auto w-full max-w-3xl px-5 pb-14 pt-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <GraduationCap className="size-3.5" /> MHT-CET &amp; JEE • Maharashtra CAP
        </span>
        <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
          Your admission doubts, answered in plain language.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          Cutoffs, CAP rounds and category rules for OPEN, OBC, SC, ST, VJNT, EWS, TFWS, PWD,
          Defence and Ex-servicemen seats — ask in English, Marathi or Hinglish.
        </p>

        <Button size="lg" className="mt-7 gap-2" onClick={() => start()}>
          Start a chat <ArrowRight className="size-4" />
        </Button>

        <div className="mt-10 grid gap-2 text-left sm:grid-cols-2">
          {prompts.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => start(p)}
              className="rounded-xl border border-border bg-card p-4 text-sm transition-colors hover:border-accent hover:bg-secondary"
            >
              {p}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-4 px-5 pb-16 sm:grid-cols-3">
        <Stat icon={<ListChecks className="size-4" />} value={`${capRounds.length} stages`} label="CAP process explained step by step" />
        <Stat icon={<GraduationCap className="size-4" />} value={`${colleges.length} colleges`} label="Branch-wise closing percentiles in the knowledge base" />
        <Stat icon={<ShieldCheck className="size-4" />} value={`${seatCategories.length} categories`} label="Reservation rules and required certificates" />
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Guidance only. Official State CET Cell notifications are the final authority.
      </footer>
    </main>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-accent-foreground">
        <span className="rounded-md bg-accent/25 p-1.5">{icon}</span>
        <span className="font-display text-lg font-semibold">{value}</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
