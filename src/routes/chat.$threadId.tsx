import { ChatWindow } from "@/components/ChatWindow";
import { ThreadSidebar } from "@/components/ThreadSidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { createFileRoute } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/chat/$threadId")({
  head: () => ({
    meta: [
      { title: "Chat with CET Counsellor | MHT-CET & JEE admissions" },
      {
        name: "description",
        content:
          "Ask about MHT-CET and JEE CAP rounds, category-wise cutoffs and Maharashtra engineering college admissions.",
      },
      { property: "og:title", content: "Chat with CET Counsellor" },
      {
        property: "og:description",
        content: "Category-wise cutoffs, CAP round help and admission guidance for Maharashtra students.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { threadId } = Route.useParams();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <div className="hidden w-72 shrink-0 md:block">
        <ThreadSidebar activeId={threadId} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-border px-3 py-2 md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open chats">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Your chats</SheetTitle>
              <ThreadSidebar activeId={threadId} onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="font-display text-sm font-semibold">CET Counsellor</span>
        </header>

        <div className="min-h-0 flex-1">
          <ChatWindow key={threadId} threadId={threadId} />
        </div>
      </div>
    </div>
  );
}
