import { DurableObject } from 'cloudflare:workers'

export interface Env {
  GlobalDurableObject: DurableObjectNamespace<GlobalDurableObject>
}

export class GlobalDurableObject extends DurableObject<Env> {
  async getValue(key: string): Promise<unknown> {
    return this.ctx.storage.get(key)
  }

  async putValue(key: string, value: unknown): Promise<void> {
    await this.ctx.storage.put(key, value)
  }
}
