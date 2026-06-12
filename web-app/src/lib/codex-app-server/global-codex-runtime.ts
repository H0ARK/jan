import { invoke } from '@tauri-apps/api/core'
import { CodexAppServerClient } from './api'
import { TauriCodexProcessSpawner } from './tauri-process'
import type { CodexInitializeResult, CodexSessionOptions } from './types'

export const GLOBAL_CODEX_APP_SERVER_SESSION_ID = 'jan-global-codex-app-server'

type GlobalCodexRuntimeState = {
  client: CodexAppServerClient
  processSignature: string
  initPromise: Promise<CodexInitializeResult>
}

let globalRuntime: GlobalCodexRuntimeState | null = null
const threadRuntimeSignatures = new Map<string, string>()
let ensureChain: Promise<CodexAppServerClient> = Promise.resolve(
  null as unknown as CodexAppServerClient
)

export function buildCodexProcessSignature(options: CodexSessionOptions): string {
  // API keys and other env values change after bootstrap; they must not restart the process.
  return JSON.stringify({
    codexBinaryPath: options.codexBinaryPath,
    codexHome: options.codexHome,
    transport: options.transport,
    agentsMd: options.agentsMd,
    customAgents: options.customAgents,
  })
}

export function buildCodexRuntimeSignature(options: CodexSessionOptions): string {
  return JSON.stringify({
    cwd: options.cwd,
    model: options.model,
    modelProvider: options.modelProvider,
    approvalPolicy: options.approvalPolicy,
    sandbox: options.sandbox,
    configToml: options.configToml,
    mcpRefreshConfig: options.mcpRefreshConfig,
    subagentMaxThreads: options.subagentMaxThreads,
    subagentMaxDepth: options.subagentMaxDepth,
    permissionProfile: options.permissionProfile,
    addDirs: options.addDirs,
    advancedConfigSnippet: options.advancedConfigSnippet,
  })
}

export function getGlobalCodexClientOrNull(): CodexAppServerClient | null {
  return globalRuntime?.client ?? null
}

async function ensureGlobalCodexAppServerInternal(
  spawnOptions: CodexSessionOptions
): Promise<CodexAppServerClient> {
  const processSignature = buildCodexProcessSignature(spawnOptions)

  if (globalRuntime?.processSignature === processSignature) {
    await globalRuntime.initPromise
    return globalRuntime.client
  }

  if (globalRuntime) {
    await globalRuntime.client.shutdownCodex()
    globalRuntime = null
    threadRuntimeSignatures.clear()
  }

  const client = new CodexAppServerClient({
    spawner: new TauriCodexProcessSpawner({
      sessionIdFactory: () => GLOBAL_CODEX_APP_SERVER_SESSION_ID,
    }),
    options: spawnOptions,
  })

  const initPromise = client.startCodexSession()
  globalRuntime = {
    client,
    processSignature,
    initPromise,
  }

  await initPromise
  return client
}

export async function ensureGlobalCodexAppServer(
  spawnOptions: CodexSessionOptions
): Promise<CodexAppServerClient> {
  const next = ensureChain.then(
    () => ensureGlobalCodexAppServerInternal(spawnOptions),
    () => ensureGlobalCodexAppServerInternal(spawnOptions)
  )
  ensureChain = next.catch(
    () => null as unknown as CodexAppServerClient
  )
  return next
}

export async function applyCodexRuntimeOptions(
  client: CodexAppServerClient,
  threadId: string,
  options: CodexSessionOptions
): Promise<void> {
  const runtimeSignature = buildCodexRuntimeSignature(options)
  if (threadRuntimeSignatures.get(threadId) === runtimeSignature) return

  await writeCodexConfigToDisk(options)
  await client.refreshMcpServers().catch(() => {})
  await client.reloadUserConfig().catch(() => {})
  threadRuntimeSignatures.set(threadId, runtimeSignature)
}

export async function shutdownGlobalCodexAppServer(): Promise<void> {
  if (!globalRuntime) return
  await globalRuntime.client.shutdownCodex()
  globalRuntime = null
  threadRuntimeSignatures.clear()
}

export function clearGlobalCodexThreadBinding(threadId: string): void {
  threadRuntimeSignatures.delete(threadId)
  globalRuntime?.client.clearThreadBinding(threadId)
}

export function resetGlobalCodexRuntimeForTests(): void {
  globalRuntime = null
  threadRuntimeSignatures.clear()
  ensureChain = Promise.resolve(null as unknown as CodexAppServerClient)
}

async function writeCodexConfigToDisk(options: CodexSessionOptions) {
  if (!options.codexHome) return

  await invoke('write_codex_app_server_config', {
    codexHome: options.codexHome,
    configToml: options.configToml ?? '',
    agentsMd: options.agentsMd ?? null,
    customAgents: options.customAgents
      ? JSON.stringify(options.customAgents)
      : null,
  })
}