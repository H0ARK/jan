import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import {
  parseCodexJson,
  stringifyCodexJson,
  type CodexThreadDescriptor,
} from '../shared/codex-helpers'

type JsonObject = Record<string, unknown>

function buildMetadataJson(previous: JsonObject, source: string, workspace: string): string {
  const next: JsonObject = {
    ...previous,
  }

  if (source.trim()) {
    next.source = source.trim()
  } else {
    delete next.source
  }

  if (workspace.trim()) {
    next.workspace = workspace.trim()
  } else {
    delete next.workspace
  }

  return stringifyCodexJson(next, '{}')
}

function buildSettingsJson(previous: JsonObject, approvalPolicy: string, sandbox: string): string {
  const next: JsonObject = {
    ...previous,
  }

  if (approvalPolicy.trim()) {
    next.approvalPolicy = approvalPolicy.trim()
  } else {
    delete next.approvalPolicy
  }

  if (sandbox.trim()) {
    next.sandbox = sandbox.trim()
  } else {
    delete next.sandbox
  }

  return stringifyCodexJson(next, '{}')
}

type CodexThreadSummary = {
  id: string
  name?: string
  source?: string
  status?: string
  updatedAt?: string
  turns?: number | null
  turnItems?: number | null
  goal?: string
  snapshot?: string
}

type ThreadsPanelProps = {
  codexInjectItemsJson: string
  codexLoadedThreads: unknown
  codexRealtimeAudioBase64: string
  codexRealtimeText: string
  codexStoredThreads: unknown
  codexTargetItemId: string
  codexTargetTurnId: string
  codexThreadDescriptors: CodexThreadDescriptor[]
  codexThreadFilter: string
  codexThreadGoal: unknown
  codexThreadGoalObjective: string
  codexThreadId: string
  codexThreadMetadataJson: string
  codexThreadName: string
  codexThreadSettingsJson: string
  codexThreadSnapshot: unknown
  codexConversationSummary: unknown
  codexGitDiffToRemote: unknown
  codexAuthStatus: unknown
  codexThreadSort: 'updated' | 'name' | 'source'
  codexThreadSourceFilter: 'all' | 'loaded' | 'stored'
  codexThreadTurnItems: unknown
  codexThreadTurns: unknown
  codexThreadActionParamsJson: string
  codexThreadReviewBranch: string
  codexThreadReviewDelivery: string
  codexThreadReviewType: string
  codexTurnItemsLimit: string
  currentThreadIdForCaps: string | null | undefined
  cwd?: string
  filteredCodexThreadDescriptors: CodexThreadDescriptor[]
  onArchive: () => void
  onClearGoal: () => void
  onCompact: () => void
  onCleanTerminals: () => void
  onFork: () => void
  onGetGoal: () => void
  onInjectItems: () => void
  onInterrupt: () => void
  onMemoryOff: () => void
  onMemoryOn: () => void
  onMetadata: () => void
  onName: () => void
  onRead: (janThreadId?: string, params?: Record<string, unknown>) => Promise<unknown> | void
  onReadTurnItems: (janThreadId?: string, params?: Record<string, unknown>) => Promise<unknown> | void
  onRealtimeAudio: () => void
  onRealtimeStart: () => void
  onRealtimeStop: () => void
  onRealtimeText: () => void
  onRefresh: () => void
  onReload: () => void
  onResetMemory: () => void
  onReview: (params?: Record<string, unknown>) => void
  onRollback: () => void
  onSearchThreads: () => void
  onStartThread: () => void
  onResumeThread: () => void
  onStartTurn: () => void
  onListRealtimeVoices: () => void
  onApproveGuardianDeniedAction: () => void
  onIncrementElicitation: () => void
  onDecrementElicitation: () => void
  onReadConversationSummary: () => void
  onReadGitDiffToRemote: () => void
  onReadAuthStatus: () => void
  onSetCodexInjectItemsJson: (value: string) => void
  onSetCodexRealtimeAudioBase64: (value: string) => void
  onSetCodexRealtimeText: (value: string) => void
  onSetCodexTargetItemId: (value: string) => void
  onSetCodexTargetTurnId: (value: string) => void
  onSetCodexThreadFilter: (value: string) => void
  onSetCodexThreadGoalObjective: (value: string) => void
  onSetCodexThreadId: (value: string) => void
  onSetCodexThreadMetadataJson: (value: string) => void
  onSetCodexThreadName: (value: string) => void
  onSetCodexThreadSettingsJson: (value: string) => void
  onSetCodexThreadSort: (value: 'updated' | 'name' | 'source') => void
  onSetCodexThreadSourceFilter: (value: 'all' | 'loaded' | 'stored') => void
  onSetCodexTurnItemsLimit: (value: string) => void
  onSetCodexThreadActionParamsJson: (value: string) => void
  onSetCodexThreadReviewBranch: (value: string) => void
  onSetCodexThreadReviewDelivery: (value: string) => void
  onSetCodexThreadReviewType: (value: string) => void
  onSettings: () => void
  onSetGoal: () => void
  onTemplateInjectText: () => void
  onTemplateMetadata: () => void
  onTemplateReviewBranch: () => void
  onTemplateReviewUncommitted: () => void
  onTemplateSettings: () => void
  onUnarchive: () => void
  onUnsubscribe: () => void
  selectableCodexItemIds: string[]
  selectableCodexThreadIds: string[]
  selectableCodexTurnIds: string[]
  selectedCodexThreadSummary: CodexThreadSummary | null
  targetCodexThreadId: string
  threadBusy: boolean
}

export function ThreadsPanel({
  codexInjectItemsJson,
  codexLoadedThreads,
  codexRealtimeAudioBase64,
  codexRealtimeText,
  codexStoredThreads,
  codexTargetItemId,
  codexTargetTurnId,
  codexThreadDescriptors,
  codexThreadFilter,
  codexThreadGoal,
  codexThreadGoalObjective,
  codexThreadId,
  codexThreadMetadataJson,
  codexThreadName,
  codexThreadSettingsJson,
  codexThreadSnapshot,
  codexConversationSummary,
  codexGitDiffToRemote,
  codexAuthStatus,
  codexThreadSort,
  codexThreadSourceFilter,
  codexThreadTurnItems,
  codexThreadTurns,
  codexThreadActionParamsJson,
  codexThreadReviewBranch,
  codexThreadReviewDelivery,
  codexThreadReviewType,
  codexTurnItemsLimit,
  currentThreadIdForCaps,
  filteredCodexThreadDescriptors,
  onArchive,
  onClearGoal,
  onCompact,
  onCleanTerminals,
  onFork,
  onGetGoal,
  onInjectItems,
  onInterrupt,
  onMemoryOff,
  onMemoryOn,
  onMetadata,
  onName,
  onRead,
  onReadTurnItems,
  onRealtimeAudio,
  onRealtimeStart,
  onRealtimeStop,
  onRealtimeText,
  onRefresh,
  onReload,
  onResetMemory,
  onReview,
  onRollback,
  onSearchThreads,
  onStartThread,
  onResumeThread,
  onStartTurn,
  onListRealtimeVoices,
  onApproveGuardianDeniedAction,
  onIncrementElicitation,
  onDecrementElicitation,
  onReadConversationSummary,
  onReadGitDiffToRemote,
  onReadAuthStatus,
  onSetCodexInjectItemsJson,
  onSetCodexRealtimeAudioBase64,
  onSetCodexRealtimeText,
  onSetCodexTargetItemId,
  onSetCodexTargetTurnId,
  onSetCodexThreadFilter,
  onSetCodexThreadGoalObjective,
  onSetCodexThreadId,
  onSetCodexThreadMetadataJson,
  onSetCodexThreadName,
  onSetCodexThreadSettingsJson,
  onSetCodexThreadSort,
  onSetCodexThreadSourceFilter,
  onSetCodexTurnItemsLimit,
  onSetCodexThreadActionParamsJson,
  onSetCodexThreadReviewBranch,
  onSetCodexThreadReviewDelivery,
  onSetCodexThreadReviewType,
  onSettings,
  onSetGoal,
  onTemplateInjectText,
  onTemplateMetadata,
  onTemplateReviewBranch,
  onTemplateReviewUncommitted,
  onTemplateSettings,
  onUnarchive,
  onUnsubscribe,
  selectableCodexItemIds,
  selectableCodexThreadIds,
  selectableCodexTurnIds,
  selectedCodexThreadSummary,
  targetCodexThreadId,
  threadBusy,
}: ThreadsPanelProps) {
  const metadata = parseCodexJson<JsonObject>(codexThreadMetadataJson, {})
  const settings = parseCodexJson<JsonObject>(codexThreadSettingsJson, {})

  const metadataSource = typeof metadata.source === 'string' ? metadata.source : ''
  const metadataWorkspace = typeof metadata.workspace === 'string' ? metadata.workspace : ''
  const settingsApprovalPolicy = typeof settings.approvalPolicy === 'string' ? settings.approvalPolicy : ''
  const settingsSandbox = typeof settings.sandbox === 'string' ? settings.sandbox : ''

  const updateThreadMetadataField = (field: 'source' | 'workspace', value: string) => {
    if (field === 'source') {
      onSetCodexThreadMetadataJson(
        buildMetadataJson(parseCodexJson<JsonObject>(codexThreadMetadataJson, {}), value, metadataWorkspace)
      )
      return
    }

    onSetCodexThreadMetadataJson(
      buildMetadataJson(
        parseCodexJson<JsonObject>(codexThreadMetadataJson, {}),
        metadataSource,
        value
      )
    )
  }

  const updateThreadSettingsField = (
    field: 'approvalPolicy' | 'sandbox',
    value: string
  ) => {
    if (field === 'approvalPolicy') {
      onSetCodexThreadSettingsJson(
        buildSettingsJson(parseCodexJson<JsonObject>(codexThreadSettingsJson, {}), value, settingsSandbox)
      )
      return
    }

    onSetCodexThreadSettingsJson(
      buildSettingsJson(
        parseCodexJson<JsonObject>(codexThreadSettingsJson, {}),
        settingsApprovalPolicy,
        value
      )
    )
  }

  return (
    <div className="mb-2 border rounded p-1 bg-background/50 text-[10px]">
      <div className="font-mono mb-1 flex items-center justify-between gap-2">
        <span>Threads</span>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!currentThreadIdForCaps || threadBusy}
          onClick={() => onRefresh()}
        >
          Refresh
        </button>
      </div>
      <div className="mb-1 flex gap-1">
        <Input
          className="h-6 min-w-0 flex-1 px-2 text-[10px]"
          placeholder="Codex thread id"
          value={codexThreadId}
          onChange={(event) => onSetCodexThreadId(event.target.value)}
        />
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!targetCodexThreadId || threadBusy}
          onClick={() => onRead()}
        >
          Read
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!targetCodexThreadId || threadBusy}
          onClick={() => onReadTurnItems()}
        >
          Read turn items
        </button>
      </div>
      <div className="mb-1 grid grid-cols-1 gap-1 md:grid-cols-2">
        <div className="min-h-12 grid grid-cols-1 gap-1">
          <Input
            className="h-6 px-2 text-[10px]"
            placeholder="Thread metadata source"
            value={metadataSource}
            onChange={(event) => updateThreadMetadataField('source', event.target.value)}
          />
          <Input
            className="h-6 px-2 text-[10px]"
            placeholder="Thread metadata workspace"
            value={metadataWorkspace}
            onChange={(event) =>
              updateThreadMetadataField('workspace', event.target.value)
            }
          />
          <details className="rounded border border-border/60 px-2 py-1">
            <summary className="cursor-pointer text-[9px] text-muted-foreground">
              Advanced metadata JSON
            </summary>
            <textarea
              className="mt-1 min-h-12 w-full resize-y rounded border bg-background px-2 py-1 font-mono text-[10px]"
              placeholder="Thread metadata JSON"
              value={codexThreadMetadataJson}
              onChange={(event) => onSetCodexThreadMetadataJson(event.target.value)}
            />
          </details>
        </div>
        <div className="min-h-12 grid grid-cols-1 gap-1">
          <Input
            className="h-6 px-2 text-[10px]"
            placeholder="Thread approval policy"
            value={settingsApprovalPolicy}
            onChange={(event) =>
              updateThreadSettingsField('approvalPolicy', event.target.value)
            }
          />
          <Input
            className="h-6 px-2 text-[10px]"
            placeholder="Thread sandbox"
            value={settingsSandbox}
            onChange={(event) =>
              updateThreadSettingsField('sandbox', event.target.value)
            }
          />
          <details className="rounded border border-border/60 px-2 py-1">
            <summary className="cursor-pointer text-[9px] text-muted-foreground">
              Advanced settings JSON
            </summary>
            <textarea
              className="mt-1 min-h-12 w-full resize-y rounded border bg-background px-2 py-1 font-mono text-[10px]"
              placeholder="Thread settings JSON"
              value={codexThreadSettingsJson}
              onChange={(event) => onSetCodexThreadSettingsJson(event.target.value)}
            />
          </details>
        </div>
        <textarea
          className="min-h-12 w-full resize-y rounded border bg-background px-2 py-1 font-mono text-[10px]"
          placeholder="Items JSON array to inject"
          value={codexInjectItemsJson}
          onChange={(event) => onSetCodexInjectItemsJson(event.target.value)}
        />
      </div>
      <div className="mb-1 flex flex-wrap gap-x-2 gap-y-1">
        <button type="button" className="text-[9px] underline" onClick={() => onTemplateMetadata()}>Metadata template</button>
        <button type="button" className="text-[9px] underline" onClick={() => onTemplateSettings()}>Settings template</button>
        <button type="button" className="text-[9px] underline" onClick={() => onTemplateInjectText()}>Inject text template</button>
        <button type="button" className="text-[9px] underline" onClick={() => onTemplateReviewUncommitted()}>Review uncommitted template</button>
        <button type="button" className="text-[9px] underline" onClick={() => onTemplateReviewBranch()}>Review branch template</button>
      </div>
      <div className="mb-1 grid grid-cols-1 gap-1 md:grid-cols-3">
        <Input
          className="h-6 px-2 text-[10px]"
          placeholder="Review type (uncommittedChanges / branch)"
          value={codexThreadReviewType}
          onChange={(event) => onSetCodexThreadReviewType(event.target.value)}
        />
        <Input
          className="h-6 px-2 text-[10px]"
          placeholder="Review branch (for branch type)"
          value={codexThreadReviewBranch}
          onChange={(event) => onSetCodexThreadReviewBranch(event.target.value)}
        />
        <Input
          className="h-6 px-2 text-[10px]"
          placeholder="Review delivery (detached)"
          value={codexThreadReviewDelivery}
          onChange={(event) => onSetCodexThreadReviewDelivery(event.target.value)}
        />
      </div>
      <div className="mb-1">
        <textarea
          className="min-h-12 w-full resize-y rounded border bg-background px-2 py-1 font-mono text-[10px]"
          placeholder="Thread action params JSON"
          value={codexThreadActionParamsJson}
          onChange={(event) => onSetCodexThreadActionParamsJson(event.target.value)}
        />
        <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1">
          <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!currentThreadIdForCaps || threadBusy} onClick={() => onSearchThreads()}>Search</button>
          <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!currentThreadIdForCaps || threadBusy} onClick={() => onStartThread()}>Start</button>
          <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!currentThreadIdForCaps || threadBusy} onClick={() => onResumeThread()}>Resume</button>
          <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!currentThreadIdForCaps || threadBusy} onClick={() => onStartTurn()}>Start turn</button>
          <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!currentThreadIdForCaps || threadBusy || !codexThreadId.trim()} onClick={() => onListRealtimeVoices()}>Realtime voices</button>
          <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!currentThreadIdForCaps || threadBusy} onClick={() => onApproveGuardianDeniedAction()}>Approve guardian</button>
          <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!currentThreadIdForCaps || threadBusy} onClick={() => onIncrementElicitation()}>Increment elicitation</button>
          <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!currentThreadIdForCaps || threadBusy} onClick={() => onDecrementElicitation()}>Decrement elicitation</button>
        </div>
      </div>
      <div className="mb-1 rounded border bg-background/40 p-1">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-[9px]">
          <span className="text-muted-foreground">Thread diagnostics</span>
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!currentThreadIdForCaps || threadBusy} onClick={() => onReadConversationSummary()}>Conversation summary</button>
            <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!currentThreadIdForCaps || threadBusy} onClick={() => onReadGitDiffToRemote()}>Git diff to remote</button>
            <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!currentThreadIdForCaps || threadBusy} onClick={() => onReadAuthStatus()}>Auth status</button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-1 md:grid-cols-3">
          <pre className="max-h-20 overflow-auto whitespace-pre-wrap break-words">
            {codexConversationSummary != null
              ? JSON.stringify(codexConversationSummary, null, 2)
              : '— conversation summary'}
          </pre>
          <pre className="max-h-20 overflow-auto whitespace-pre-wrap break-words">
            {codexGitDiffToRemote != null
              ? JSON.stringify(codexGitDiffToRemote, null, 2)
              : '— git diff to remote'}
          </pre>
          <pre className="max-h-20 overflow-auto whitespace-pre-wrap break-words">
            {codexAuthStatus != null ? JSON.stringify(codexAuthStatus, null, 2) : '— auth status'}
          </pre>
        </div>
      </div>
      <div className="mb-1 grid grid-cols-1 gap-1 md:grid-cols-3">
        <Input className="h-6 px-2 text-[10px]" placeholder="Thread name" value={codexThreadName} onChange={(event) => onSetCodexThreadName(event.target.value)} />
        <Input className="h-6 px-2 text-[10px]" placeholder="Goal objective" value={codexThreadGoalObjective} onChange={(event) => onSetCodexThreadGoalObjective(event.target.value)} />
        <Input className="h-6 px-2 text-[10px]" placeholder="Turn id for items / rollback" value={codexTargetTurnId} onChange={(event) => onSetCodexTargetTurnId(event.target.value)} />
        <Input className="h-6 px-2 text-[10px]" placeholder="Item id for rollback" value={codexTargetItemId} onChange={(event) => onSetCodexTargetItemId(event.target.value)} />
        <Input className="h-6 px-2 text-[10px]" placeholder="Turn items limit" value={codexTurnItemsLimit} onChange={(event) => onSetCodexTurnItemsLimit(event.target.value)} />
        <Input className="h-6 px-2 text-[10px]" placeholder="Realtime text" value={codexRealtimeText} onChange={(event) => onSetCodexRealtimeText(event.target.value)} />
        <Input className="h-6 px-2 text-[10px]" placeholder="Realtime audio base64" value={codexRealtimeAudioBase64} onChange={(event) => onSetCodexRealtimeAudioBase64(event.target.value)} />
      </div>
      <div className="mb-1 flex flex-wrap gap-x-2 gap-y-1">
        <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!targetCodexThreadId || threadBusy} onClick={() => onFork()}>Fork</button>
        <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!targetCodexThreadId || threadBusy} onClick={() => onArchive()}>Archive</button>
        <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!targetCodexThreadId || threadBusy} onClick={() => onUnarchive()}>Unarchive</button>
        <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!targetCodexThreadId || threadBusy} onClick={() => onUnsubscribe()}>Unsubscribe</button>
        <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!targetCodexThreadId || threadBusy || !codexThreadName.trim()} onClick={() => onName()}>Name</button>
        <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!targetCodexThreadId || threadBusy} onClick={() => onMetadata()}>Metadata</button>
        <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!targetCodexThreadId || threadBusy} onClick={() => onSettings()}>Settings</button>
        <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!targetCodexThreadId || threadBusy} onClick={() => onSetGoal()}>Set goal</button>
        <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!targetCodexThreadId || threadBusy} onClick={() => onGetGoal()}>Get goal</button>
        <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!targetCodexThreadId || threadBusy} onClick={() => onClearGoal()}>Clear goal</button>
        <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!targetCodexThreadId || threadBusy} onClick={() => onMemoryOn()}>Memory on</button>
        <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!targetCodexThreadId || threadBusy} onClick={() => onMemoryOff()}>Memory off</button>
        <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={threadBusy} onClick={() => onResetMemory()}>Reset memory</button>
        <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!targetCodexThreadId || threadBusy} onClick={() => onInterrupt()}>Interrupt</button>
        <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!targetCodexThreadId || threadBusy} onClick={() => onCompact()}>Compact</button>
        <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!targetCodexThreadId || threadBusy} onClick={() => onReload()}>Reload</button>
        <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!targetCodexThreadId || threadBusy} onClick={() => onRollback()}>Rollback</button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!targetCodexThreadId || threadBusy}
          onClick={() =>
            onReview({
              type: 'uncommittedChanges',
              delivery: codexThreadReviewDelivery.trim() || 'detached',
            })
          }
        >
          Review uncommitted
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!targetCodexThreadId || threadBusy}
          onClick={() =>
            onReview({
              type: 'branch',
              base: codexThreadReviewBranch.trim() || 'main',
              delivery: codexThreadReviewDelivery.trim() || 'detached',
            })
          }
        >
          Review branch
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!targetCodexThreadId || threadBusy}
          onClick={() =>
            onReview({
              type: codexThreadReviewType.trim() || 'uncommittedChanges',
              ...(codexThreadReviewType.trim() === 'branch' &&
              { base: codexThreadReviewBranch.trim() || 'main' }),
              delivery: codexThreadReviewDelivery.trim() || 'detached',
            })
          }
        >
          Review with typed params
        </button>
        <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!targetCodexThreadId || threadBusy} onClick={() => onInjectItems()}>Inject items</button>
        <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!targetCodexThreadId || threadBusy} onClick={() => onCleanTerminals()}>Clean terminals</button>
        <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!targetCodexThreadId || threadBusy} onClick={() => onRealtimeStart()}>Realtime start</button>
        <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!targetCodexThreadId || threadBusy} onClick={() => onRealtimeText()}>Realtime text</button>
        <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!targetCodexThreadId || threadBusy} onClick={() => onRealtimeAudio()}>Realtime audio</button>
        <button type="button" className="text-[9px] underline disabled:opacity-50" disabled={!targetCodexThreadId || threadBusy} onClick={() => onRealtimeStop()}>Realtime stop</button>
      </div>
      <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
        <pre className="max-h-24 overflow-auto whitespace-pre-wrap break-words">
          {codexLoadedThreads ? JSON.stringify(codexLoadedThreads, null, 2) : '— loaded threads'}
        </pre>
        <pre className="max-h-24 overflow-auto whitespace-pre-wrap break-words">
          {codexStoredThreads ? JSON.stringify(codexStoredThreads, null, 2) : '— stored threads'}
        </pre>
      </div>
      {codexThreadDescriptors.length ? (
        <div className="mt-1 grid grid-cols-1 gap-1 md:grid-cols-3">
          <Input className="h-6 px-2 text-[10px]" placeholder="Search threads" value={codexThreadFilter} onChange={(event) => onSetCodexThreadFilter(event.target.value)} />
          <select className="h-6 rounded border bg-background px-2 text-[10px]" value={codexThreadSourceFilter} onChange={(event) => onSetCodexThreadSourceFilter(event.target.value as 'all' | 'loaded' | 'stored')}>
            <option value="all">All sources</option>
            <option value="loaded">Loaded only</option>
            <option value="stored">Stored only</option>
          </select>
          <select className="h-6 rounded border bg-background px-2 text-[10px]" value={codexThreadSort} onChange={(event) => onSetCodexThreadSort(event.target.value as 'updated' | 'name' | 'source')}>
            <option value="updated">Sort by updated</option>
            <option value="name">Sort by name</option>
            <option value="source">Sort by source</option>
          </select>
        </div>
      ) : null}
      {codexThreadDescriptors.length ? (
        <div className="mt-1">
          <div className="text-[9px] text-muted-foreground mb-0.5">
            {filteredCodexThreadDescriptors.length}/{codexThreadDescriptors.length} threads (click row to select)
          </div>
          <table className="w-full text-[9px] font-mono border-collapse">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-1 py-0.5">Id / Name</th>
                <th className="px-1 py-0.5">Status</th>
                <th className="px-1 py-0.5">Source</th>
                <th className="px-1 py-0.5">Updated</th>
                <th className="px-1 py-0.5">Turns</th>
                <th className="px-1 py-0.5">Items</th>
                <th className="px-1 py-0.5">Goal</th>
              </tr>
            </thead>
            <tbody>
              {filteredCodexThreadDescriptors.map((thread) => {
                const isSelected = targetCodexThreadId === thread.id
                return (
                  <tr
                    key={thread.id}
                    className={cn(
                      'border-b hover:bg-accent cursor-pointer',
                      isSelected && 'bg-accent'
                    )}
                    title={thread.id}
                    onClick={() => onSetCodexThreadId(thread.id)}
                  >
                    <td className="px-1 py-0.5 truncate max-w-[12em]">{thread.name ?? thread.id}</td>
                    <td className="px-1 py-0.5 truncate text-muted-foreground">{thread.status ?? '—'}</td>
                    <td className="px-1 py-0.5 text-muted-foreground">{thread.source}</td>
                    <td className="px-1 py-0.5 truncate text-muted-foreground">{thread.updatedAt ?? '—'}</td>
                    <td className="px-1 py-0.5">{(thread as any).turns ?? '—'}</td>
                    <td className="px-1 py-0.5">{(thread as any).turnItems ?? '—'}</td>
                    <td className="px-1 py-0.5 truncate max-w-[10em] text-muted-foreground">{(thread as any).goal ?? '—'}</td>
                  </tr>
                )
              })}
              {!filteredCodexThreadDescriptors.length ? (
                <tr>
                  <td colSpan={7} className="px-1 py-1 text-muted-foreground">No matching Codex threads.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
      {selectableCodexThreadIds.length ? (
        <div className="mt-1 flex flex-wrap gap-1">
          {selectableCodexThreadIds.map((threadId) => (
            <button
              key={threadId}
              type="button"
              className={cn(
                'max-w-full truncate rounded border px-1.5 py-0.5 font-mono text-[9px] hover:bg-accent',
                targetCodexThreadId === threadId && 'bg-accent'
              )}
              title={threadId}
              onClick={() => onSetCodexThreadId(threadId)}
            >
              {threadId}
            </button>
          ))}
        </div>
      ) : null}
      {selectedCodexThreadSummary ? (
        <div className="mt-1 rounded border bg-background/40 p-1 text-[10px]">
          <div className="mb-1 flex items-center justify-between gap-2 font-mono text-[9px]">
            <span className="truncate">
              Selected thread: {selectedCodexThreadSummary.name ?? selectedCodexThreadSummary.id}
            </span>
            <span className="shrink-0 text-muted-foreground">
              {selectedCodexThreadSummary.source ?? 'manual'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] md:grid-cols-4">
            <span className="text-muted-foreground">status</span>
            <span className="truncate">{selectedCodexThreadSummary.status ?? '—'}</span>
            <span className="text-muted-foreground">updated</span>
            <span className="truncate">{selectedCodexThreadSummary.updatedAt ?? '—'}</span>
            <span className="text-muted-foreground">turns</span>
            <span>{selectedCodexThreadSummary.turns ?? '—'}</span>
            <span className="text-muted-foreground">items</span>
            <span>{selectedCodexThreadSummary.turnItems ?? '—'}</span>
            <span className="text-muted-foreground">goal</span>
            <span className="truncate md:col-span-3">{selectedCodexThreadSummary.goal || '—'}</span>
            <span className="text-muted-foreground">snapshot</span>
            <span className="truncate md:col-span-3">{selectedCodexThreadSummary.snapshot || '—'}</span>
          </div>
        </div>
      ) : null}
      <pre className="mt-1 max-h-28 overflow-auto whitespace-pre-wrap break-words">
        {codexThreadSnapshot || codexThreadTurns || codexThreadTurnItems || codexThreadGoal
          ? JSON.stringify(
              {
                thread: codexThreadSnapshot,
                turns: codexThreadTurns,
                turnItems: codexThreadTurnItems,
                goal: codexThreadGoal,
              },
              null,
              2
            )
          : '— selected thread'}
      </pre>
      {selectableCodexTurnIds.length ? (
        <div className="mt-1 flex flex-wrap gap-1">
          {selectableCodexTurnIds.map((turnId) => (
            <button
              key={turnId}
              type="button"
              className={cn(
                'max-w-full truncate rounded border px-1.5 py-0.5 font-mono text-[9px] hover:bg-accent',
                codexTargetTurnId.trim() === turnId && 'bg-accent'
              )}
              title={turnId}
              onClick={() => onSetCodexTargetTurnId(turnId)}
            >
              turn:{turnId}
            </button>
          ))}
        </div>
      ) : null}
      {selectableCodexItemIds.length ? (
        <div className="mt-1 flex flex-wrap gap-1">
          {selectableCodexItemIds.map((itemId) => (
            <button
              key={itemId}
              type="button"
              className={cn(
                'max-w-full truncate rounded border px-1.5 py-0.5 font-mono text-[9px] hover:bg-accent',
                codexTargetItemId.trim() === itemId && 'bg-accent'
              )}
              title={itemId}
              onClick={() => onSetCodexTargetItemId(itemId)}
            >
              item:{itemId}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
