// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Vercel 不在 Lovable 运行环境内，需要显式启用 Nitro 部署插件。
  // 否则只会产出 dist/client 和 dist/server，Vercel 没有可服务的输出，访问会 404。
  nitro: {
    preset: "vercel",
    // Nitro emits the Build Output API config. Put this before its filesystem
    // route: top-level vercel.json redirects do not reach these static files.
    vercel: {
      config: {
        routes: [{
          src: "^/tts(?:/(.*))?$",
          has: [{ type: "host", value: "thumem.top" }],
          status: 307,
          headers: { Location: "https://www.thumem.top/tts/$1" },
        }],
      },
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
