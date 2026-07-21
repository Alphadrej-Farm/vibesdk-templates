# Usage

- Replace `src/App.tsx` with the product UI and extend semantic tokens in
  `src/index.css` and `tailwind.config.js`.
- `src/components/ui/button.tsx` is the only preinstalled shadcn primitive.
  `components.json` is configured for on-demand additions; install other
  primitives with `bunx shadcn@latest add <component>` before importing them.
- Add HTTP endpoints in `worker/userRoutes.ts`. Keep the Worker entrypoint intact.
- Add stateful methods to `worker/durableObject.ts`; the single
  `GlobalDurableObject` binding and migration are already configured.
- Call Worker APIs from the frontend with relative `/api/*` URLs.
- Add only the dependencies and routing library the generated product needs.
