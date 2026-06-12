import { useEffect, useState } from 'react'

import { Input } from '@/components/ui/input'
import {
  parseCodexJson,
  stringifyCodexJson,
} from '../shared/codex-helpers'

import {
  RawRpcMethodCatalog,
  type RawRpcCatalogItem,
} from './RawRpcMethodCatalog'

type RawRpcParamField = {
  key: string
  value: string
}

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
  currentThreadIdForCaps: string | null | undefined
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

function parseTargets(value: string) {
  const parsed = parseCodexJson<unknown>(value || '[]', [])
  if (!Array.isArray(parsed)) return []
  return parsed.filter((entry): entry is string => typeof entry === 'string')
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
  const [pluginShareRemotePluginId, setPluginShareRemotePluginId] = useState('')
  const [pluginSharePluginPath, setPluginSharePluginPath] = useState('')
  const [pluginShareTargets, setPluginShareTargets] = useState('[]')
  const [fuzzySessionId, setFuzzySessionId] = useState('')
  const [reviewType, setReviewType] = useState('uncommittedChanges')
  const [reviewDelivery, setReviewDelivery] = useState('detached')
  const [reviewBranch, setReviewBranch] = useState('main')
  const [showAdvancedRawRpcJson, setShowAdvancedRawRpcJson] = useState(false)
  const [rawRpcParamFields, setRawRpcParamFields] = useState<RawRpcParamField[]>([
    { key: '', value: '' },
  ])

  const parsedRawRpcParams = parseCodexJson<unknown>(
    codexRawRpcParams || '{}',
    {}
  )
  const hasRawRpcParamsError =
    typeof parsedRawRpcParams !== 'object' ||
    parsedRawRpcParams === null ||
    Array.isArray(parsedRawRpcParams)
  const rawRpcParamsMessage = hasRawRpcParamsError
    ? 'Raw RPC params must be a valid JSON object.'
    : null

  const parseRawRpcValue = (value: string): unknown => {
    const trimmed = value.trim()
    if (!trimmed) return value
    if (trimmed === 'true') return true
    if (trimmed === 'false') return false
    if (trimmed === 'null') return null
    if (!Number.isNaN(Number(trimmed))) return Number(trimmed)
    if (
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))
    ) {
      try {
        return JSON.parse(trimmed)
      } catch {
        return value
      }
    }
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.slice(1, -1)
    }
    return value
  }

  const setRawRpcParamsFromFields = (
    fields: RawRpcParamField[] = rawRpcParamFields
  ) => {
    const nextPayload = fields.reduce<Record<string, unknown>>((acc, field) => {
      const fieldKey = field.key.trim()
      if (!fieldKey) return acc
      if (Object.prototype.hasOwnProperty.call(acc, fieldKey)) return acc
      acc[fieldKey] = parseRawRpcValue(field.value)
      return acc
    }, {})
    setCodexRawRpcParams(stringifyCodexJson(nextPayload, '{}'))
  }

  const setRawRpcParamField = (index: number, field: RawRpcParamField) => {
    const nextFields = rawRpcParamFields.map((nextField, nextIndex) =>
      nextIndex === index ? field : nextField
    )
    setRawRpcParamFields(nextFields)
    if (!showAdvancedRawRpcJson) {
      setRawRpcParamsFromFields(nextFields)
    }
  }

  const addRawRpcParamField = () => {
    setRawRpcParamFields([...rawRpcParamFields, { key: '', value: '' }])
  }

  const removeRawRpcParamField = (index: number) => {
    const nextFields = rawRpcParamFields.filter((_, nextIndex) => {
      return nextIndex !== index
    })
    const fallbackFields = nextFields.length ? nextFields : [{ key: '', value: '' }]
    setRawRpcParamFields(fallbackFields)
    if (!showAdvancedRawRpcJson) {
      setRawRpcParamsFromFields(fallbackFields)
    }
  }

  useEffect(() => {
    if (!showAdvancedRawRpcJson) {
      const parsed = parsedRawRpcParams
      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        setRawRpcParamFields([{ key: '', value: '' }])
        return
      }
      const nextFields = Object.entries(parsed).map(([fieldKey, fieldValue]) => ({
        key: fieldKey,
        value:
          typeof fieldValue === 'string'
            ? fieldValue
            : stringifyCodexJson(fieldValue, String(fieldValue ?? '')),
      }))
      setRawRpcParamFields(nextFields.length ? nextFields : [{ key: '', value: '' }])
    }
  }, [codexRawRpcParams, showAdvancedRawRpcJson, parsedRawRpcParams])

  return (
    <div className="mb-2 border rounded p-1 bg-background/50 text-[10px]">
      <div className="font-mono mb-1 flex items-center justify-between gap-2">
        <span>Raw app-server RPC</span>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={
            !currentThreadIdForCaps || rawRpcBusy || !codexRawRpcMethod.trim()
            || hasRawRpcParamsError
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
          className="text-[9px] underline disabled:opacity-50"
          disabled={!pluginShareRemotePluginId.trim()}
          onClick={() =>
            setCodexRawRpcPreset('plugin/share/list', {
              remotePluginId: pluginShareRemotePluginId.trim(),
            })
          }
        >
          preset: plugin/share/list
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!pluginShareRemotePluginId.trim() || !pluginSharePluginPath.trim()}
          onClick={() =>
            setCodexRawRpcPreset('plugin/share/checkout', {
              remotePluginId: pluginShareRemotePluginId.trim(),
              pluginPath: pluginSharePluginPath.trim(),
            })
          }
        >
          preset: plugin/share/checkout
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!pluginShareRemotePluginId.trim()}
          onClick={() =>
            setCodexRawRpcPreset('plugin/share/updateTargets', {
              remotePluginId: pluginShareRemotePluginId.trim(),
              targets: parseTargets(pluginShareTargets),
            })
          }
        >
          preset: plugin/share/updateTargets
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!pluginShareRemotePluginId.trim() || !pluginSharePluginPath.trim()}
          onClick={() =>
            setCodexRawRpcPreset('plugin/share/save', {
              remotePluginId: pluginShareRemotePluginId.trim(),
              pluginPath: pluginSharePluginPath.trim(),
              targets: parseTargets(pluginShareTargets),
            })
          }
        >
          preset: plugin/share/save
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!pluginShareRemotePluginId.trim()}
          onClick={() =>
            setCodexRawRpcPreset('plugin/share/delete', {
              remotePluginId: pluginShareRemotePluginId.trim(),
            })
          }
        >
          preset: plugin/share/delete
        </button>
        <div className="mb-1 flex w-full flex-wrap gap-x-2 gap-y-1">
          <Input
            className="h-6 min-w-0 flex-1 px-2 text-[10px]"
            placeholder="plugin share remote id"
            value={pluginShareRemotePluginId}
            onChange={(event) => setPluginShareRemotePluginId(event.target.value)}
          />
          <Input
            className="h-6 min-w-0 flex-1 px-2 text-[10px]"
            placeholder="plugin share plugin path"
            value={pluginSharePluginPath}
            onChange={(event) => setPluginSharePluginPath(event.target.value)}
          />
          <Input
            className="h-6 min-w-0 flex-1 px-2 text-[10px]"
            placeholder="plugin share targets JSON array"
            value={pluginShareTargets}
            onChange={(event) => setPluginShareTargets(event.target.value)}
          />
        </div>
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
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!fuzzySessionId.trim()}
          onClick={() =>
            setCodexRawRpcPreset('fuzzyFileSearch/sessionStart', {
              sessionId: fuzzySessionId.trim(),
            })
          }
        >
          preset: fuzzy session start
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!fuzzySessionId.trim()}
          onClick={() =>
            setCodexRawRpcPreset('fuzzyFileSearch/sessionUpdate', {
              sessionId: fuzzySessionId.trim(),
            })
          }
        >
          preset: fuzzy session update
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!fuzzySessionId.trim()}
          onClick={() =>
            setCodexRawRpcPreset('fuzzyFileSearch/sessionStop', {
              sessionId: fuzzySessionId.trim(),
            })
          }
        >
          preset: fuzzy session stop
        </button>
        <Input
          className="h-6 min-w-0 px-2 text-[10px]"
          placeholder="fuzzy session id"
          value={fuzzySessionId}
          onChange={(event) => setFuzzySessionId(event.target.value)}
        />
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!targetCodexThreadId}
          onClick={() =>
            setCodexRawRpcPreset('review/start', {
              threadId: targetCodexThreadId,
              type: 'uncommittedChanges',
              delivery: reviewDelivery.trim() || 'detached',
            })
          }
        >
          preset: review start uncommitted
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!targetCodexThreadId}
          onClick={() =>
            setCodexRawRpcPreset('review/start', {
              threadId: targetCodexThreadId,
              type: 'branch',
              base: reviewBranch.trim() || 'main',
              delivery: reviewDelivery.trim() || 'detached',
            })
          }
        >
          preset: review start branch
        </button>
        <Input
          className="h-6 min-w-0 flex-1 px-2 text-[10px]"
          placeholder="review type"
          value={reviewType}
          onChange={(event) => setReviewType(event.target.value)}
        />
        <Input
          className="h-6 min-w-0 flex-1 px-2 text-[10px]"
          placeholder="review branch (for branch type)"
          value={reviewBranch}
          onChange={(event) => setReviewBranch(event.target.value)}
        />
        <Input
          className="h-6 min-w-0 flex-1 px-2 text-[10px]"
          placeholder="review delivery"
          value={reviewDelivery}
          onChange={(event) => setReviewDelivery(event.target.value)}
        />
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!targetCodexThreadId}
          onClick={() =>
            setCodexRawRpcPreset('review/start', {
              threadId: targetCodexThreadId,
              type: reviewType.trim() || 'uncommittedChanges',
              delivery: reviewDelivery.trim() || 'detached',
              ...(reviewType.trim() === 'branch'
                ? { base: reviewBranch.trim() || 'main' }
                : {}),
            })
          }
        >
          apply review params
        </button>
      </div>
      <Input
        className="mb-1 h-6 px-2 text-[10px]"
        placeholder="method, e.g. model/list"
        value={codexRawRpcMethod}
        onChange={(event) => setCodexRawRpcMethod(event.target.value)}
      />
      <div className="mb-1 flex gap-2">
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={rawRpcBusy}
          onClick={() =>
            setShowAdvancedRawRpcJson((previous) => !previous)
          }
        >
          {showAdvancedRawRpcJson ? 'Use params form' : 'Advanced params JSON'}
        </button>
      </div>
      {showAdvancedRawRpcJson ? (
        <textarea
          className="mb-1 min-h-16 w-full resize-y rounded border bg-background px-2 py-1 font-mono text-[10px]"
          placeholder="params JSON"
          value={codexRawRpcParams}
          onChange={(event) => setCodexRawRpcParams(event.target.value)}
        />
      ) : (
        <div className="mb-1 space-y-1">
          {rawRpcParamFields.map((field, index) => (
            <div
              key={`${field.key || 'param'}-${index}`}
              className="grid grid-cols-[1.2fr_1.8fr_auto] gap-1"
            >
              <Input
                className="h-6 px-2 text-[10px]"
                placeholder="param key"
                value={field.key}
                onChange={(event) =>
                  setRawRpcParamField(index, {
                    ...field,
                    key: event.target.value,
                  })
                }
              />
              <Input
                className="h-6 px-2 text-[10px]"
                placeholder="param value"
                value={field.value}
                onChange={(event) =>
                  setRawRpcParamField(index, {
                    ...field,
                    value: event.target.value,
                  })
                }
              />
              <button
                type="button"
                className="text-[9px] underline disabled:opacity-50"
                disabled={rawRpcBusy}
                onClick={() => removeRawRpcParamField(index)}
              >
                remove
              </button>
            </div>
          ))}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] text-muted-foreground">
              Add top-level params for method payload.
            </span>
            <button
              type="button"
              className="text-[9px] underline disabled:opacity-50"
              disabled={rawRpcBusy}
              onClick={addRawRpcParamField}
            >
              + add param
            </button>
          </div>
        </div>
      )}
      {rawRpcParamsMessage ? (
        <div className="mb-1 text-destructive">{rawRpcParamsMessage}</div>
      ) : null}
      <pre className="whitespace-pre-wrap break-words max-h-32 overflow-auto">
        {codexRawRpcSnapshot
          ? JSON.stringify(codexRawRpcSnapshot, null, 2)
          : '— (raw RPC result)'}
      </pre>
    </div>
  )
}
