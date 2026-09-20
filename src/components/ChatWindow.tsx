import logo from "@/assets/cet-logo.png";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { getThread, titleFromMessages, upsertThread } from "@/lib/threads";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const starters = [
  "I have 96.2 percentile in MHT-CET, OBC category. Which colleges can I get for Computer Engineering?",
  "Explain CAP Round 1 Freeze vs Betterment vs Not Accept.",
  "Which documents do I need for a TFWS seat?",
  "How is JEE Main used for Maharashtra CAP admissions?",
];

export function ChatWindow({ threadId }: { threadId: string }) {
  const initialMessages = useMemo<UIMessage[]>(
    () => getThread(threadId)?.messages ?? [],
    [threadId],
  );
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { messages, sendMessage, status, stop } = useChat({
    id: threadId,
    messages: initialMessages,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: (error) => toast.error(error.message || "Could not reach the counsellor."),
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (messages.length === 0) return;
    const existing = getThread(threadId);
    upsertThread({
      id: threadId,
      title: existing?.title && existing.title !== "New question" ? existing.title : titleFromMessages(messages),
      updatedAt: Date.now(),
      messages,
    });
  }, [messages, threadId]);

  useEffect(() => {
    if (!isLoading) textareaRef.current?.focus();
  }, [isLoading, threadId]);

  const send = (text: string) => {
    const value = text.trim();
    if (!value || isLoading) return;
    setInput("");
    void sendMessage({ text: value });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center gap-5 py-10 text-center">
              <img src={logo} alt="" width={64} height={64} className="size-16" />
              <div>
                <h2 className="text-2xl font-semibold">Ask me about your admission</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cutoffs, CAP rounds, category documents — in English, Marathi or Hinglish.
                </p>
              </div>
              <div className="grid w-full gap-2 sm:grid-cols-2">
                {starters.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-xl border border-border bg-card p-3 text-left text-sm transition-colors hover:border-accent hover:bg-secondary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <Message key={message.id} from={message.role} className="gap-1">
                  <MessageContent variant={message.role === "user" ? "contained" : "flat"}>
                    {message.parts.map((part, i) =>
                      part.type === "text" ? (
                        <MessageResponse key={i}>{part.text}</MessageResponse>
                      ) : null,
                    )}
                  </MessageContent>
                </Message>
              ))}
              {status === "submitted" ? <Shimmer>Thinking…</Shimmer> : null}
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border bg-background/80 px-4 py-3 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl">
          <PromptInput
            onSubmit={(_message, event) => {
              event.preventDefault();
              send(input);
            }}
          >
            <PromptInputTextarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. 93 percentile, SC category, Pune colleges for IT?"
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} disabled={!input.trim() && !isLoading} onStop={stop} />
            </PromptInputFooter>
          </PromptInput>
          <p className="pt-2 text-center text-[11px] text-muted-foreground">
            Cutoffs shown are indicative. Verify on the official State CET Cell portal.
          </p>
        </div>
      </div>
    </div>
  );
}
