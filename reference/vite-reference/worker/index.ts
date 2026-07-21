import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

import type { Env } from './durableObject'
import { userRoutes } from './userRoutes'

export { GlobalDurableObject } from './durableObject'

const app = new Hono<{ Bindings: Env }>()

app.use('*', logger())
app.use(
  '/api/*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
)

app.get('/api/health', (context) =>
  context.json({
    success: true,
    data: { status: 'healthy', timestamp: new Date().toISOString() },
  }),
)

userRoutes(app)

app.notFound((context) =>
  context.json({ success: false, error: 'Not Found' }, 404),
)
app.onError((error, context) => {
  console.error(error)
  return context.json({ success: false, error: 'Internal Server Error' }, 500)
})

export default app
