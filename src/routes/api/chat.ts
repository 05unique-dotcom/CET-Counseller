import { buildKnowledgeContext } from "@/data/cet-knowledge";
import { fetchSanityKnowledgeContext } from "@/lib/sanity-knowledge.server";
import { createOpenAI } from "@ai-sdk/openai";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

type ChatRequestBody = { messages?: unknown };

function buildSystemPrompt(referenceContent: string, isOfficial: boolean) {
  return `You are CET Counsellor for Maharashtra MHT-CET/JEE engineering admissions (State CET Cell CAP).
Rules:
- Match student language (English, Marathi, Hindi, Hinglish). Clear, concise, supportive.
- For percentile queries: give Ambitious, Realistic, and Safe college tiers; urge a wide option form.
- Explain Freeze/Betterment/CAP steps with brief bullets or small tables.
- Never invent cutoffs. If unlisted, cite reference data as official 2026-27 and advise checking the official CET Cell PDF.
- State CET Cell notifications are the final authority.

Reference Data (${isOfficial ? "Official 2026-27" : "Sample Backup"}):
${referenceContent}`;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const apiKey = process.env["GROQ_API_KEY"];
        if (!apiKey) {
          return new Response("The counsellor is not configured yet (missing Groq key).", {
            status: 500,
          });
        }

        const groq = createOpenAI({
          baseURL: "https://api.groq.com/openai/v1",
          apiKey,
        });

        const userTexts = (messages as UIMessage[])
          .filter((m) => m.role === "user")
          .slice(-2)
          .map((m) => (m.parts ?? []).map((p) => (p.type === "text" ? p.text : "")).join(" "))
          .join(" ");

        const sanityContext = await fetchSanityKnowledgeContext(userTexts);
        const systemPrompt = sanityContext
          ? buildSystemPrompt(sanityContext, true)
          : buildSystemPrompt(buildKnowledgeContext(), false);

        const result = streamText({
          model: groq("openai/gpt-oss-120b"),
          system: systemPrompt,
          messages: await convertToModelMessages(messages as UIMessage[]),
          maxOutputTokens: 2000,
          maxRetries: 0,
          abortSignal: request.signal,
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
          onError: (error) =>
            error instanceof Error ? error.message : "The counsellor could not answer right now.",
        });
      },
    },
  },
});
