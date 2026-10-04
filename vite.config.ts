// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

// The Sanity Studio is browser-only. If it lands in the server bundle, its modules
// generate random values at load time, which the live server rejects (500 on every page).
// Replace the Studio entry with an empty stub everywhere except the browser build.
const STUDIO_STUB_ID = "\0sanity-studio-server-stub";
function sanityStudioServerStub(): Plugin {
  return {
    name: "sanity-studio-server-stub",
    enforce: "pre",
    resolveId(source) {
      if (this.environment?.name === "client") return null;
      if (/(^|\/)sanity\/StudioRoot(\.tsx)?$/.test(source)) return STUDIO_STUB_ID;
      return null;
    },
    load(id) {
      if (id === STUDIO_STUB_ID) return "export default function StudioRoot() { return null; }";
      return null;
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [sanityStudioServerStub()],
  },
});
