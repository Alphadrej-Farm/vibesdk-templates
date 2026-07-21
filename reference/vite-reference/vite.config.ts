import { cloudflare } from '@cloudflare/vite-plugin'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import pino from 'pino'
import {
  defineConfig,
  loadEnv,
  type ConfigEnv,
  type Logger,
  type Plugin,
} from 'vite'

import lumavenoSourceAnchorBabelPlugin from './source-anchor-babel-plugin'

const logger = pino()

function emitLog(level: 'info' | 'warn' | 'error', message: string) {
  const cleanMessage = message.replace(/\u001b\[[0-9;]*m/g, '').trimEnd()
  logger[level](cleanMessage)
}

const customLogger: Logger = {
  info: (message) => emitLog('info', message),
  warn: (message) => emitLog('warn', message),
  warnOnce: (message) => emitLog('warn', message),
  error: (message) => emitLog('error', message),
  clearScreen: () => undefined,
  hasErrorLogged: () => false,
  hasWarned: false,
}

function reloadTriggerPlugin(): Plugin {
  return {
    name: 'reload-trigger',
    configureServer(server) {
      const triggerFile = path.resolve('.reload-trigger')
      server.watcher.add(triggerFile)
      server.watcher.on('change', (filePath) => {
        if (path.resolve(filePath) === triggerFile) {
          logger.info('Reload triggered via .reload-trigger')
          server.ws.send({ type: 'full-reload' })
        }
      })
    },
  }
}

export default ({ command, mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd())
  const projectRoot = process.cwd()

  return defineConfig({
    plugins: [
      react({
        babel: {
          plugins: [
            [
              lumavenoSourceAnchorBabelPlugin,
              {
                projectRoot,
                emitRuntimeAnchor: command === 'serve',
              },
            ],
          ],
        },
      }),
      cloudflare(),
      reloadTriggerPlugin(),
    ],
    build: {
      minify: true,
      sourcemap: false,
    },
    customLogger: env.VITE_LOGGER_TYPE === 'json' ? customLogger : undefined,
    css: {
      devSourcemap: true,
    },
    server: {
      allowedHosts: true,
      strictPort: true,
      watch: {
        awaitWriteFinish: {
          stabilityThreshold: 150,
          pollInterval: 50,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve('src'),
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
  })
}
