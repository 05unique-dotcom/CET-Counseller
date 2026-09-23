import { Suspense, lazy, useEffect, useState } from "react";

const StudioRoot = lazy(() => import("@/sanity/StudioRoot"));

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
