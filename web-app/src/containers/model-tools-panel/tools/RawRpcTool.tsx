import { Input } from '@/components/ui/input'

import {
  RawRpcMethodCatalog,
  type RawRpcCatalogItem,
} from './RawRpcMethodCatalog'

type RawRpcToolProps = {
  codexConfigKeyPath: string
  codexConfigValueJson: string
  codexMcpServerName: string
  codexMcpToolArguments: string
  codexMcpToolName: string
  codexPluginId: string
  codexProcessHandle: string
  codexRawRpcCatalog: RawRpcCatalogItem[]
  codexRawRpcCatalogFilter: string
  codexRawRpcMethod: string
  codexRawRpcParams: string
  codexRawRpcSnapshot: unknown
  codexTurnItemsLimit: string
  currentThreadIdForCaps: string
  filteredCodexRawRpcCatalog: RawRpcCatalogItem[]
  parseCodexRawRpcPresetJson: (value: string, fallback: unknown) => unknown
  rawRpcBusy: boolean
  runCodexRawRpc: () => Promise<void>
  setCodexRawRpcCatalogFilter: (value: string) => void
  setCodexRawRpcMethod: (value: string) => void
  setCodexRawRpcParams: (value: string) => void
  setCodexRawRpcPreset: (method: string, params: Record<string, unknown>) => void
  targetCodexThreadId: string
}

export function RawRpcTool({
  codexConfigKeyPath,
  codexConfigValueJson,
  codexMcpServerName,
  codexMcpToolArguments,
  codexMcpToolName,
  codexPluginId,
  codexProcessHandle,
  codexRawRpcCatalog,
  codexRawRpcCatalogFilter,
  codexRawRpcMethod,
  codexRawRpcParams,
  codexRawRpcSnapshot,
  codexTurnItemsLimit,
  currentThreadIdForCaps,
  filteredCodexRawRpcCatalog,
  parseCodexRawRpcPresetJson,
  rawRpcBusy,
  runCodexRawRpc,
  setCodexRawRpcCatalogFilter,
  setCodexRawRpcMethod,
  setCodexRawRpcParams,
  setCodexRawRpcPreset,
  targetCodexThreadId,
}: RawRpcToolProps) {
  return (
    <div className="mb-2 border rounded p-1 bg-background/50 text-[10px]">
      <div className="font-mono mb-1 flex items-center justify-between gap-2">
        <span>Raw app-server RPC</span>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={
            !currentThreadIdForCaps || rawRpcBusy || !codexRawRpcMethod.trim()
          }
          onClick={() => void runCodexRawRpc()}
        >
          {rawRpcBusy ? 'Calling' : 'Call'}
        </button>
      </div>
      <div className="mb-1 text-[10px] text-muted-foreground">
        Escape hatch for current or future Codex app-server methods that do not
        yet have dedicated UI controls.
      </div>
      <RawRpcMethodCatalog
        filter={codexRawRpcCatalogFilter}
        items={filteredCodexRawRpcCatalog}
        totalCount={codexRawRpcCatalog.length}
        onFilterChange={setCodexRawRpcCatalogFilter}
        onSelect={setCodexRawRpcPreset}
      />
      <div className="mb-1 flex flex-wrap gap-x-2 gap-y-1">
        <button
          type="button"
          className="text-[9px] underline"
          onClick={() => setCodexRawRpcPreset('thread/list', {})}
        >
          preset: thread/list
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!targetCodexThreadId}
          onClick={() =>
            setCodexRawRpcPreset('thread/read', {
              threadId: targetCodexThreadId,
            })
          }
        >
          preset: thread/read
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!targetCodexThreadId}
          onClick={() =>
            setCodexRawRpcPreset('thread/turns/items/list', {
              threadId: targetCodexThreadId,
              limit: Number.parseInt(codexTurnItemsLimit, 10) || 50,
            })
          }
        >
          preset: turn items
        </button>
        <button
          type="button"
          className="text-[9px] underline"
          onClick={() => setCodexRawRpcPreset('config/read', {})}
        >
          preset: config/read
        </button>
        <button
          type="button"
          className="text-[9px] underline"
          onClick={() =>
            setCodexRawRpcPreset('config/value/write', {
              keyPath: codexConfigKeyPath,
              value: parseCodexRawRpcPresetJson(
                codexConfigValueJson || 'null',
                null
              ),
            })
          }
        >
          preset: config write
        </button>
        <button
          type="button"
          className="text-[9px] underline"
          onClick={() => setCodexRawRpcPreset('mcpServer/status/list', {})}
        >
          preset: MCP status
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!codexMcpServerName.trim() || !codexMcpToolName.trim()}
          onClick={() =>
            setCodexRawRpcPreset('mcpServer/tool/call', {
              server: codexMcpServerName.trim(),
              toolName: codexMcpToolName.trim(),
              arguments: parseCodexRawRpcPresetJson(
                codexMcpToolArguments || '{}',
                {}
              ),
            })
          }
        >
          preset: MCP tool
        </button>
        <button
          type="button"
          className="text-[9px] underline"
          onClick={() =>
            setCodexRawRpcPreset('plugin/installed', { suggestions: [] })
          }
        >
          preset: plugins
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!codexPluginId.trim()}
          onClick={() =>
            setCodexRawRpcPreset('plugin/read', {
              plugin: codexPluginId.trim(),
              pluginId: codexPluginId.trim(),
            })
          }
        >
          preset: plugin/read
        </button>
        <button
          type="button"
          className="text-[9px] underline"
          onClick={() => setCodexRawRpcPreset('account/read', {})}
        >
          preset: account/read
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!codexProcessHandle.trim()}
          onClick={() =>
            setCodexRawRpcPreset('process/kill', {
              processHandle: codexProcessHandle.trim(),
            })
          }
        >
          preset: process/kill
        </button>
      </div>
      <Input
        className="mb-1 h-6 px-2 text-[10px]"
        placeholder="method, e.g. model/list"
        value={codexRawRpcMethod}
        onChange={(event) => setCodexRawRpcMethod(event.target.value)}
      />
      <textarea
        className="mb-1 min-h-16 w-full resize-y rounded border bg-background px-2 py-1 font-mono text-[10px]"
        placeholder="params JSON"
        value={codexRawRpcParams}
        onChange={(event) => setCodexRawRpcParams(event.target.value)}
      />
      <pre className="whitespace-pre-wrap break-words max-h-32 overflow-auto">
        {codexRawRpcSnapshot
          ? JSON.stringify(codexRawRpcSnapshot, null, 2)
          : '— (raw RPC result)'}
      </pre>
    </div>
  )
}
