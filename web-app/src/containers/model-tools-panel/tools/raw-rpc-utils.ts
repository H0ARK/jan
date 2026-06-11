import type { RawRpcCatalogItem } from './RawRpcMethodCatalog'
import { CODEX_APP_SERVER_METHOD_FALLBACKS } from '@/lib/codex-app-server/method-aliases'

type RawRpcCatalogContext = {
  targetCodexThreadId: string
  codexPluginId: string
  codexProcessHandle: string
  codexConfigKeyPath: string
  codexMcpResourceUri: string
  codexMcpServerName: string
  codexMcpToolName: string
  codexRuntimePath: string
  codexTurnItemsLimit: string
  cwd: string
}

export function resolveCodexRawRpcMethod(method: string): string {
  return CODEX_APP_SERVER_METHOD_FALLBACKS[method] ?? method
}

export function buildCodexRawRpcCatalog({
  targetCodexThreadId,
  codexPluginId,
  codexProcessHandle,
  codexConfigKeyPath,
  codexMcpResourceUri,
  codexMcpServerName,
  codexMcpToolName,
  codexRuntimePath,
  codexTurnItemsLimit,
  cwd,
}: RawRpcCatalogContext): RawRpcCatalogItem[] {
  const threadId = targetCodexThreadId || '<threadId>'
  const pluginId = codexPluginId.trim() || '<pluginId>'
  const processHandle = codexProcessHandle.trim() || '<processHandle>'
  const mcpServer = codexMcpServerName.trim() || '<server>'
  const mcpTool = codexMcpToolName.trim() || '<toolName>'

  return [
    {
      group: 'Thread',
      method: 'thread/list',
      params: {},
      description: 'List stored Codex threads.',
    },
    {
      group: 'Thread',
      method: 'thread/read',
      params: { threadId },
      description: 'Read a Codex thread by id.',
    },
    {
      group: 'Thread',
      method: 'thread/turns/items/list',
      params: { threadId, limit: Number.parseInt(codexTurnItemsLimit, 10) || 50 },
      description: 'Read turn items for a Codex thread.',
    },
    {
      group: 'Config',
      method: 'config/read',
      params: {},
      description: 'Read current Codex app-server config.',
    },
    {
      group: 'Config',
      method: 'config/value/write',
      params: { keyPath: codexConfigKeyPath, value: '<value>' },
      description: 'Write a single Codex config value.',
    },
    {
      group: 'MCP',
      method: 'mcpServer/status/list',
      params: {},
      description: 'List MCP server runtime status.',
    },
    {
      group: 'MCP',
      method: 'mcpServer/resource/read',
      params: { server: mcpServer, uri: codexMcpResourceUri || '<uri>' },
      description: 'Read an MCP resource through Codex.',
    },
    {
      group: 'MCP',
      method: 'mcpServer/tool/call',
      params: { server: mcpServer, toolName: mcpTool, arguments: {} },
      description: 'Call an MCP tool through Codex.',
    },
    {
      group: 'Plugin',
      method: 'plugin/installed',
      params: { suggestions: [] },
      description: 'List installed Codex plugins.',
    },
    {
      group: 'Plugin',
      method: 'plugin/read',
      params: { plugin: pluginId, pluginId },
      description: 'Read plugin metadata.',
    },
    {
      group: 'Account',
      method: 'account/read',
      params: {},
      description: 'Read Codex account/auth state.',
    },
    {
      group: 'Runtime',
      method: 'process/kill',
      params: { processHandle },
      description: 'Kill a spawned app-server process.',
    },
    {
      group: 'Runtime',
      method: 'fs/readDirectory',
      params: { path: codexRuntimePath || cwd },
      description: 'Read a directory through Codex filesystem RPC.',
    },
  ]
}
