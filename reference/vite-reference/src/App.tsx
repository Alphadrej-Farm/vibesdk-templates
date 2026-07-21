import { Cloud } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <section className="w-full max-w-xl space-y-6 rounded-lg border bg-card p-8 text-center text-card-foreground shadow-sm">
        <Cloud className="mx-auto size-10 text-primary" aria-hidden="true" />
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Build your app</h1>
          <p className="text-muted-foreground">
            Replace this lean scaffold with the generated product experience.
          </p>
        </div>
        <Button asChild>
          <a href="/api/health">Check the Worker</a>
        </Button>
      </section>
    </main>
  )
}
