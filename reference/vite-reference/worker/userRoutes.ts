import type { Hono } from 'hono'

import type { Env } from './durableObject'

export function userRoutes(_app: Hono<{ Bindings: Env }>) {}
