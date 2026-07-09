// Home page of the app.
// Currently a placeholder "building" screen shown while the app is generated.
// Replace this file with your actual app UI. Do not delete it to use some other file as homepage. Simply replace the entire contents of this file.

import { HAS_TEMPLATE_DEMO, TemplateDemo } from '@/components/TemplateDemo'
import { Toaster } from '@/components/ui/sonner'

export function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#08090a] text-[#f5f5f4] p-6 overflow-hidden relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-60"
        style={{
          background:
            'radial-gradient(60% 100% at 50% 0%, rgba(239, 255, 10, 0.07) 0%, rgba(239, 255, 10, 0) 100%)',
        }}
      />

      <header className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 select-none">
        <span className="inline-block w-2 h-2 rounded-full bg-[#efff0a]" />
        <span className="text-sm font-medium tracking-[0.18em] uppercase text-[#f5f5f4]/80">
          Lumaveno
        </span>
      </header>

      <div className="text-center space-y-8 relative z-10 w-full animate-fade-in">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-display font-semibold text-balance leading-tight">
            Building your app<span className="text-[#efff0a]">.</span>
          </h1>
          <p className="text-base md:text-lg text-[#f5f5f4]/60 max-w-md mx-auto text-pretty">
            The first version is being written right now. This preview updates
            on its own — no need to reload.
          </p>
        </div>

        {HAS_TEMPLATE_DEMO ? (
          <div className="max-w-5xl mx-auto text-left">
            <TemplateDemo />
          </div>
        ) : (
          <div className="mx-auto w-56 h-px bg-white/10 relative overflow-hidden rounded-full">
            <div
              className="absolute inset-y-0 w-20 bg-[#efff0a]"
              style={{ animation: 'placeholder-sweep 1.6s ease-in-out infinite' }}
            />
            <style>{`
              @keyframes placeholder-sweep {
                0% { left: -30%; }
                100% { left: 110%; }
              }
            `}</style>
          </div>
        )}
      </div>

      <footer className="absolute bottom-8 text-center text-sm text-[#f5f5f4]/40">
        <p>Powered by Lumaveno</p>
      </footer>

      <Toaster richColors closeButton />
    </div>
  )
}
