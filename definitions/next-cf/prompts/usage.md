# Usage

- Build pages in `src/pages/` and keep global semantic tokens in
  `src/styles/globals.css` and `tailwind.config.js`.
- `src/components/ui/button.tsx` is the only preinstalled shadcn primitive.
  `components.json` is configured for on-demand additions; install other
  primitives with `bunx shadcn@latest add <component>` before importing them.
- Add Pages Router API handlers under `src/pages/api/` only when needed.
- Keep `next.config.mjs`, `open-next.config.ts`, and `wrangler.jsonc` compatible
  with the OpenNext Cloudflare build.
- Add only dependencies used by the generated product.
