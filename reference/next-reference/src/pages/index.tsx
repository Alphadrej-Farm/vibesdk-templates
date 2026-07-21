import { Cloud } from 'lucide-react'
import Head from 'next/head'

import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <>
      <Head>
        <title>Cloudflare App</title>
        <meta
          name="description"
          content="A Next.js application running on Cloudflare"
        />
      </Head>
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <section
          id="start"
          className="w-full max-w-xl space-y-6 rounded-lg border bg-card p-8 text-center text-card-foreground shadow-sm"
        >
          <Cloud className="mx-auto size-10 text-primary" aria-hidden="true" />
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Build your app</h1>
            <p className="text-muted-foreground">
              Replace this lean scaffold with the generated product experience.
            </p>
          </div>
          <Button asChild>
            <a href="#start">Ready for generation</a>
          </Button>
        </section>
      </main>
    </>
  )
}
