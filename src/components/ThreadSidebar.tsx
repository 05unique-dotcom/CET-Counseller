import logo from "@/assets/cet-logo.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createThread, deleteThread, useThreads } from "@/lib/threads";
import { Link, useNavigate } from "@tanstack/react-router";
import { MessageSquarePlus, Trash2 } from "lucide-react";

export function ThreadSidebar({ activeId, onNavigate }: { activeId?: string; onNavigate?: () => void }) {
  const { threads, refresh } = useThreads();
  const navigate = useNavigate();

  const startNew = () => {
    const thread = createThread();
    onNavigate?.();
    navigate({ to: "/chat/$threadId", params: { threadId: thread.id } });
  };

  return (
    <aside className="flex h-full w-full flex-col gap-4 border-r border-border bg-card/70 p-4">
      <Link to="/" className="flex items-center gap-2" onClick={onNavigate}>
        <img src={logo} alt="" width={32} height={32} className="size-8" />
        <span className="font-display text-base font-semibold">CET Counsellor</span>
      </Link>

      <Button onClick={startNew} className="justify-start gap-2">
        <MessageSquarePlus className="size-4" />
        New chat
      </Button>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <p className="px-1 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Your chats
        </p>
        {threads.length === 0 ? (
          <p className="px-1 text-sm text-muted-foreground">No chats yet.</p>
        ) : (
          <ul className="space-y-1">
            {threads.map((thread) => (
              <li
                key={thread.id}
                className={cn(
                  "group flex items-center gap-1 rounded-lg px-1 transition-colors",
                  thread.id === activeId ? "bg-secondary" : "hover:bg-secondary/60",
                )}
              >
                <Link
                  to="/chat/$threadId"
                  params={{ threadId: thread.id }}
                  onClick={onNavigate}
                  className="flex-1 truncate py-2 text-sm"
                >
                  {thread.title}
                </Link>
                <button
                  type="button"
                  aria-label="Delete chat"
                  onClick={() => {
                    deleteThread(thread.id);
                    refresh();
                    if (thread.id === activeId) navigate({ to: "/" });
                  }}
                  className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Guidance only. Always confirm with official State CET Cell notifications.
      </p>
    </aside>
  );
}
