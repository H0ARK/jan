import { useEffect } from 'react'
import { ensureGlobalCodexAppServer } from '@/lib/codex-app-server/global-codex-runtime'
import { buildGlobalCodexSpawnOptions } from '@/lib/codex-app-server/chat-backend'

/**
 * Starts the shared Codex app-server process once when the desktop app loads.
 * Chat threads reuse this process instead of spawning their own.
 */
export function CodexAppServerBootstrap() {
  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const spawnOptions = buildGlobalCodexSpawnOptions()
        if (cancelled) return
        await ensureGlobalCodexAppServer(spawnOptions)
      } catch (error) {
        console.error('Failed to start global Codex app-server:', error)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return null
}