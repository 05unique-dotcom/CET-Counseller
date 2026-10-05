import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayResponseHeaders,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai-gateway.server";
import { buildKnowledgeContext } from "@/data/cet-knowledge";
import { fetchSanityKnowledgeContext } from "@/lib/sanity-knowledge.server";
import { createOpenAI } from "@ai-sdk/openai";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

type ChatRequestBody = { messages?: unknown };

function buildSystemPrompt(referenceContent: string, isOfficial: boolean) {
  return `You are "CET Counsellor", an expert admission guide for Maharashtra engineering aspirants (MHT-CET and JEE Main) going through the State CET Cell CAP process.

How to answer:
- Be warm, calm and practical. Many students and parents are anxious and are not fluent in technical jargon.
- Answer in the language the student writes in (English, Marathi, Hindi or Hinglish).
- Be specific about seat categories: OPEN, OBC, SC, ST, VJNT (NT-A/B/C/D), SBC, EWS, TFWS, PWD, Defence, Ex-servicemen, Orphan and minority seats. Always mention the certificates each category needs.
- When a student gives a percentile and a category, suggest realistic college/branch options in three tiers: ambitious, realistic and safe. Always tell them to fill a long option form.
- Explain CAP rounds, Freeze / Betterment / Not Accept, reporting deadlines and institute-level rounds clearly, step by step.
- Use short paragraphs, bullet lists and small markdown tables. Bold the key numbers.
- Never invent a cutoff you do not have. If a college or year is outside the reference data, say the number is indicative and tell them to check the official CET Cell cutoff PDF.
- Close sensitive advice with a brief reminder that official CET Cell notifications are the final authority.

Reference content (${isOfficial ? "official Maharashtra CET Cell 2026-27 data from the content store" : "indicative sample data, may not be the latest year"}):
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

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const initialRunId = getLovableAiGatewayRunId(request);
        const runIdFetch = createLovableAiGatewayRunIdFetch(initialRunId);
        const lovable = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey: key,
          headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
          fetch: runIdFetch.fetch,
        });

        const sanityContext = await fetchSanityKnowledgeContext();
        const systemPrompt = sanityContext
          ? buildSystemPrompt(sanityContext, true)
          : buildSystemPrompt(buildKnowledgeContext(), false);

        const result = streamText({
          model: lovable.responses("openai/gpt-6-astra"),
          system: systemPrompt,
          messages: await convertToModelMessages(messages as UIMessage[]),
          providerOptions: {
            openai: {
              forceReasoning: true,
              reasoningEffort: "low",
              reasoningSummary: "auto",
              store: false,
              include: ["reasoning.encrypted_content"],
            },
          },
        });

        return withLovableAiGatewayRunIdHeader(
          result.toUIMessageStreamResponse({
            originalMessages: messages as UIMessage[],
            headers: getLovableAiGatewayResponseHeaders(undefined, {
              ...(initialRunId ? { "X-Lovable-AIG-Run-ID": initialRunId } : {}),
            }),
          }),
          runIdFetch,
        );
      },
    },
  },
});
