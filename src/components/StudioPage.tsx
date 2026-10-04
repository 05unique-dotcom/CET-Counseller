import { Suspense, lazy, useEffect, useState } from "react";

// The Studio is browser-only. Keeping the import behind import.meta.env.SSR lets the
// server build drop it entirely — its modules break the live server if bundled there.
const StudioRoot = lazy<() => React.JSX.Element | null>(() =>
  import.meta.env.SSR
    ? Promise.resolve({ default: () => null })
    : import("@/sanity/StudioRoot"),
);

export function StudioPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="grid h-screen place-items-center text-sm text-muted-foreground">Loading Studio…</div>;
  }

  return (
    <div className="h-screen w-full">
      <Suspense
        fallback={
          <div className="grid h-screen place-items-center text-sm text-muted-foreground">Loading Studio…</div>
        }
      >
        <StudioRoot />
      </Suspense>
    </div>
  );
}
