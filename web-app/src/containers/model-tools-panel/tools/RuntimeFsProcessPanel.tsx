import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { encodeUtf8Base64 } from '../shared/codex-helpers'

type CodexProcessTerminalSession = {
  handle: string
  kind: string
  label: string
  status: string
  lines: string[]
}

type RuntimeFsProcessPanelProps = {
  codexCommandExecParams: string
  codexProcessHandle: string
  codexProcessTerminalCols: string
  codexProcessTerminalExpanded: boolean
  codexProcessTerminalFilter: string
  codexProcessTerminalRows: string
  codexProcessTerminals: CodexProcessTerminalSession[]
  codexRuntimeCopyDestination: string
  codexRuntimeFileText: string
  codexRuntimePath: string
  codexRuntimePtySize: string
  codexRuntimeSnapshot: unknown
  codexRuntimeSpawnCommand: string
  codexRuntimeStdin: string
  codexRuntimeWatchId: string
  currentThreadIdForCaps: string
  cwd: string
  filteredCodexProcessTerminalLines: string[]
  onAppendCodexTerminalLines: (
    handle: string,
    lines: string[],
    options?: { label?: string }
  ) => void
  onClearCodexProcessEvents: () => void
  onClearCodexProcessTerminals: () => void
  onReadCodexRuntimeFile: () => Promise<void>
  onRunCodexRuntimeAction: (
    method: string,
    params: Record<string, unknown>,
    success?: string
  ) => Promise<unknown | null>
  onSetCapError: (message: string) => void
  onSetCodexCommandExecParams: (value: string) => void
  onSetCodexProcessHandle: (value: string) => void
  onSetCodexProcessTerminalCols: (value: string) => void
  onSetCodexProcessTerminalExpanded: (value: boolean | ((value: boolean) => boolean)) => void
  onSetCodexProcessTerminalFilter: (value: string) => void
  onSetCodexProcessTerminalRows: (value: string) => void
  onSetCodexRuntimeCopyDestination: (value: string) => void
  onSetCodexRuntimeFileText: (value: string) => void
  onSetCodexRuntimePath: (value: string) => void
  onSetCodexRuntimePtySize: (value: string) => void
  onSetCodexRuntimeSnapshot: (updater: (previous: unknown) => unknown) => void
  onSetCodexRuntimeSpawnCommand: (value: string) => void
  onSetCodexRuntimeStdin: (value: string) => void
  onSetCodexRuntimeWatchId: (value: string) => void
  onSpawnCodexRuntimeProcess: () => Promise<void>
  onWriteCodexRuntimeFile: () => Promise<void>
  runtimeBusy: boolean
  selectableCodexProcessHandles: string[]
  selectedCodexProcessTerminal: CodexProcessTerminalSession | null
}

export function RuntimeFsProcessPanel({
  codexCommandExecParams,
  codexProcessHandle,
  codexProcessTerminalCols,
  codexProcessTerminalExpanded,
  codexProcessTerminalFilter,
  codexProcessTerminalRows,
  codexProcessTerminals,
  codexRuntimeCopyDestination,
  codexRuntimeFileText,
  codexRuntimePath,
  codexRuntimePtySize,
  codexRuntimeSnapshot,
  codexRuntimeSpawnCommand,
  codexRuntimeStdin,
  codexRuntimeWatchId,
  currentThreadIdForCaps,
  cwd,
  filteredCodexProcessTerminalLines,
  onAppendCodexTerminalLines,
  onClearCodexProcessEvents,
  onClearCodexProcessTerminals,
  onReadCodexRuntimeFile,
  onRunCodexRuntimeAction,
  onSetCapError,
  onSetCodexCommandExecParams,
  onSetCodexProcessHandle,
  onSetCodexProcessTerminalCols,
  onSetCodexProcessTerminalExpanded,
  onSetCodexProcessTerminalFilter,
  onSetCodexProcessTerminalRows,
  onSetCodexRuntimeCopyDestination,
  onSetCodexRuntimeFileText,
  onSetCodexRuntimePath,
  onSetCodexRuntimePtySize,
  onSetCodexRuntimeSnapshot,
  onSetCodexRuntimeSpawnCommand,
  onSetCodexRuntimeStdin,
  onSetCodexRuntimeWatchId,
  onSpawnCodexRuntimeProcess,
  onWriteCodexRuntimeFile,
  runtimeBusy,
  selectableCodexProcessHandles,
  selectedCodexProcessTerminal,
}: RuntimeFsProcessPanelProps) {
  return (
    <div className="mb-2 border rounded p-1 bg-background/50 text-[10px]">
      <div className="font-mono mb-1 flex items-center justify-between gap-2">
        <span>Runtime FS / Process</span>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!currentThreadIdForCaps || runtimeBusy}
          onClick={() =>
            onSetCodexRuntimeSnapshot((previous) => ({
              ...((previous as Record<string, unknown> | null) ?? {}),
              cwd,
            }))
          }
        >
          Set cwd
        </button>
      </div>
      <div className="mb-1 text-[10px] text-muted-foreground">
        Calls Codex app-server filesystem and process RPCs directly through the
        active agent session. This is the Codex runtime view, separate from
        Jan&apos;s local file browser.
      </div>
      <div className="mb-1 flex gap-1">
        <Input
          className="h-6 min-w-0 flex-1 px-2 text-[10px]"
          placeholder="Path for fs/readFile, fs/writeFile, fs/readDirectory"
          value={codexRuntimePath}
          onChange={(event) => onSetCodexRuntimePath(event.target.value)}
        />
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!codexRuntimePath.trim() || runtimeBusy}
          onClick={() => void onReadCodexRuntimeFile()}
        >
          Read
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!codexRuntimePath.trim() || runtimeBusy}
          onClick={() => void onWriteCodexRuntimeFile()}
        >
          Write
        </button>
      </div>
      <div className="mb-1 grid grid-cols-1 gap-1 md:grid-cols-3">
        <Input
          className="h-6 px-2 text-[10px]"
          placeholder="Copy destination path"
          value={codexRuntimeCopyDestination}
          onChange={(event) =>
            onSetCodexRuntimeCopyDestination(event.target.value)
          }
        />
        <Input
          className="h-6 px-2 text-[10px]"
          placeholder="Watch id"
          value={codexRuntimeWatchId}
          onChange={(event) => onSetCodexRuntimeWatchId(event.target.value)}
        />
        <Input
          className="h-6 px-2 text-[10px]"
          placeholder="Spawn command JSON or shell command"
          value={codexRuntimeSpawnCommand}
          onChange={(event) =>
            onSetCodexRuntimeSpawnCommand(event.target.value)
          }
        />
      </div>
      <textarea
        className="mb-1 min-h-16 w-full resize-y rounded border bg-background px-2 py-1 font-mono text-[10px]"
        placeholder="File text for fs/writeFile, populated by fs/readFile"
        value={codexRuntimeFileText}
        onChange={(event) => onSetCodexRuntimeFileText(event.target.value)}
      />
      <textarea
        className="mb-1 min-h-12 w-full resize-y rounded border bg-background px-2 py-1 font-mono text-[10px]"
        placeholder="command/exec params JSON"
        value={codexCommandExecParams}
        onChange={(event) => onSetCodexCommandExecParams(event.target.value)}
      />
      <div className="mb-1 flex flex-wrap gap-x-2 gap-y-1">
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!codexRuntimePath.trim() || runtimeBusy}
          onClick={() =>
            void onRunCodexRuntimeAction(
              'fs/readDirectory',
              { path: codexRuntimePath.trim() },
              'Codex directory read'
            )
          }
        >
          Read directory
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!codexRuntimePath.trim() || runtimeBusy}
          onClick={() =>
            void onRunCodexRuntimeAction(
              'fs/getMetadata',
              { path: codexRuntimePath.trim() },
              'Codex metadata read'
            )
          }
        >
          Metadata
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!codexRuntimePath.trim() || runtimeBusy}
          onClick={() =>
            void onRunCodexRuntimeAction(
              'fs/createDirectory',
              { path: codexRuntimePath.trim(), recursive: true },
              'Codex directory created'
            )
          }
        >
          Mkdir
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!codexRuntimePath.trim() || runtimeBusy}
          onClick={() => {
            const confirmed = window.confirm(
              `Remove ${codexRuntimePath.trim()} through Codex app-server?`
            )
            if (!confirmed) return
            void onRunCodexRuntimeAction(
              'fs/remove',
              {
                path: codexRuntimePath.trim(),
                recursive: true,
                force: true,
              },
              'Codex filesystem path removed'
            )
          }}
        >
          Remove
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={
            !codexRuntimePath.trim() ||
            !codexRuntimeCopyDestination.trim() ||
            runtimeBusy
          }
          onClick={() =>
            void onRunCodexRuntimeAction(
              'fs/copy',
              {
                sourcePath: codexRuntimePath.trim(),
                destinationPath: codexRuntimeCopyDestination.trim(),
              },
              'Codex filesystem path copied'
            )
          }
        >
          Copy
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={
            !codexRuntimePath.trim() ||
            !codexRuntimeWatchId.trim() ||
            runtimeBusy
          }
          onClick={() =>
            void onRunCodexRuntimeAction(
              'fs/watch',
              {
                watchId: codexRuntimeWatchId.trim(),
                path: codexRuntimePath.trim(),
              },
              'Codex filesystem watch started'
            )
          }
        >
          Watch
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!codexRuntimeWatchId.trim() || runtimeBusy}
          onClick={() =>
            void onRunCodexRuntimeAction(
              'fs/unwatch',
              { watchId: codexRuntimeWatchId.trim() },
              'Codex filesystem watch stopped'
            )
          }
        >
          Unwatch
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={runtimeBusy}
          onClick={() => void onSpawnCodexRuntimeProcess()}
        >
          Spawn process
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={runtimeBusy}
          onClick={() => {
            try {
              const params = JSON.parse(codexCommandExecParams || '{}')
              void onRunCodexRuntimeAction(
                'command/exec',
                {
                  cwd,
                  ...params,
                },
                'Codex command exec started'
              )
            } catch (e) {
              onSetCapError('Command exec JSON parse failed: ' + String(e))
            }
          }}
        >
          Command exec
        </button>
      </div>
      <div className="mb-1 flex gap-1">
        <Input
          className="h-6 min-w-0 flex-1 px-2 text-[10px]"
          placeholder="Process handle"
          value={codexProcessHandle}
          onChange={(event) => onSetCodexProcessHandle(event.target.value)}
        />
        <Input
          className="h-6 min-w-0 flex-1 px-2 text-[10px]"
          placeholder="stdin"
          value={codexRuntimeStdin}
          onChange={(event) => onSetCodexRuntimeStdin(event.target.value)}
        />
        <Input
          className="h-6 min-w-0 flex-1 px-2 text-[10px]"
          placeholder="PTY size JSON"
          value={codexRuntimePtySize}
          onChange={(event) => onSetCodexRuntimePtySize(event.target.value)}
        />
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!codexProcessHandle.trim() || runtimeBusy}
          onClick={() =>
            void onRunCodexRuntimeAction(
              'process/writeStdin',
              {
                processHandle: codexProcessHandle.trim(),
                deltaBase64: encodeUtf8Base64(codexRuntimeStdin),
              },
              'Codex stdin sent'
            )
          }
        >
          Stdin
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!codexProcessHandle.trim() || runtimeBusy}
          onClick={() =>
            void onRunCodexRuntimeAction(
              'command/stdin',
              {
                processId: codexProcessHandle.trim(),
                deltaBase64: encodeUtf8Base64(codexRuntimeStdin),
              },
              'Codex command stdin sent'
            )
          }
        >
          Cmd stdin
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!codexProcessHandle.trim() || runtimeBusy}
          onClick={() => {
            try {
              const size = JSON.parse(codexRuntimePtySize || '{}')
              void onRunCodexRuntimeAction(
                'process/resizePty',
                {
                  processHandle: codexProcessHandle.trim(),
                  size,
                },
                'Codex PTY resized'
              )
            } catch (e) {
              onSetCapError('PTY size JSON parse failed: ' + String(e))
            }
          }}
        >
          Resize
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!codexProcessHandle.trim() || runtimeBusy}
          onClick={() => {
            try {
              const size = JSON.parse(codexRuntimePtySize || '{}')
              void onRunCodexRuntimeAction(
                'command/resize',
                {
                  processId: codexProcessHandle.trim(),
                  size,
                },
                'Codex command PTY resized'
              )
            } catch (e) {
              onSetCapError('Command PTY size JSON parse failed: ' + String(e))
            }
          }}
        >
          Cmd resize
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!codexProcessHandle.trim() || runtimeBusy}
          onClick={() =>
            void onRunCodexRuntimeAction(
              'process/kill',
              { processHandle: codexProcessHandle.trim() },
              'Codex process killed'
            )
          }
        >
          Kill
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!codexProcessHandle.trim() || runtimeBusy}
          onClick={() =>
            void onRunCodexRuntimeAction(
              'command/terminate',
              { processId: codexProcessHandle.trim() },
              'Codex command terminated'
            )
          }
        >
          Cmd terminate
        </button>
      </div>
      <div
        className={cn(
          'mb-1 rounded border border-border/60 bg-[#050505] text-[10px] text-zinc-100',
          codexProcessTerminalExpanded &&
            'fixed inset-4 z-50 flex flex-col shadow-2xl'
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-2 py-1 font-mono">
          <span>Codex process terminal</span>
          <div className="flex gap-2">
            <Input
              className="h-5 w-32 border-white/20 bg-black/40 px-1.5 text-[9px] text-zinc-100"
              placeholder="Search output"
              value={codexProcessTerminalFilter}
              onChange={(event) =>
                onSetCodexProcessTerminalFilter(event.target.value)
              }
            />
            <button
              type="button"
              className="text-[9px] underline disabled:opacity-50"
              disabled={!selectedCodexProcessTerminal}
              onClick={async () => {
                if (!selectedCodexProcessTerminal) return
                await navigator.clipboard.writeText(
                  selectedCodexProcessTerminal.lines.join('\n')
                )
                toast.success('Codex terminal output copied')
              }}
            >
              Copy output
            </button>
            <Input
              className="h-5 w-12 border-white/20 bg-black/40 px-1.5 text-[9px] text-zinc-100"
              placeholder="rows"
              value={codexProcessTerminalRows}
              onChange={(event) =>
                onSetCodexProcessTerminalRows(event.target.value)
              }
            />
            <Input
              className="h-5 w-12 border-white/20 bg-black/40 px-1.5 text-[9px] text-zinc-100"
              placeholder="cols"
              value={codexProcessTerminalCols}
              onChange={(event) =>
                onSetCodexProcessTerminalCols(event.target.value)
              }
            />
            <button
              type="button"
              className="text-[9px] underline disabled:opacity-50"
              disabled={!selectedCodexProcessTerminal || runtimeBusy}
              onClick={() => {
                if (!selectedCodexProcessTerminal) return
                const rows = Number.parseInt(codexProcessTerminalRows, 10) || 24
                const cols = Number.parseInt(codexProcessTerminalCols, 10) || 80
                const size = { rows, cols }
                onSetCodexRuntimePtySize(JSON.stringify(size))
                const handle = selectedCodexProcessTerminal.handle
                if (selectedCodexProcessTerminal.kind === 'command') {
                  void onRunCodexRuntimeAction(
                    'command/resize',
                    { processId: handle, size },
                    'Codex command PTY resized'
                  )
                } else {
                  void onRunCodexRuntimeAction(
                    'process/resizePty',
                    { processHandle: handle, size },
                    'Codex PTY resized'
                  )
                }
              }}
            >
              Apply size
            </button>
            <button
              type="button"
              className="text-[9px] underline"
              onClick={() =>
                onSetCodexProcessTerminalExpanded((expanded) => !expanded)
              }
            >
              {codexProcessTerminalExpanded ? 'Collapse' : 'Expand'}
            </button>
            <button
              type="button"
              className="text-[9px] underline disabled:opacity-50"
              disabled={!codexProcessHandle.trim()}
              onClick={() =>
                onAppendCodexTerminalLines(
                  codexProcessHandle.trim(),
                  [`attached ${codexProcessHandle.trim()}`],
                  { label: codexProcessHandle.trim() }
                )
              }
            >
              Attach handle
            </button>
            <button
              type="button"
              className="text-[9px] underline disabled:opacity-50"
              disabled={!codexProcessTerminals.length}
              onClick={() => {
                onClearCodexProcessTerminals()
                onClearCodexProcessEvents()
              }}
            >
              Clear terminals
            </button>
          </div>
        </div>
        {codexProcessTerminals.length ? (
          <div
            className={cn(
              'grid grid-cols-1 md:grid-cols-[11rem_1fr]',
              codexProcessTerminalExpanded && 'min-h-0 flex-1'
            )}
          >
            <div
              className={cn(
                'max-h-44 overflow-auto border-b border-white/10 p-1 md:border-b-0 md:border-r',
                codexProcessTerminalExpanded && 'max-h-none'
              )}
            >
              {codexProcessTerminals.map((session) => (
                <button
                  key={session.handle}
                  type="button"
                  className={cn(
                    'mb-1 flex w-full min-w-0 flex-col rounded border border-white/10 px-1.5 py-1 text-left hover:bg-white/10',
                    codexProcessHandle.trim() === session.handle && 'bg-white/10'
                  )}
                  title={session.handle}
                  onClick={() => onSetCodexProcessHandle(session.handle)}
                >
                  <span className="truncate font-mono text-[9px]">
                    {session.kind}:{session.label}
                  </span>
                  <span className="text-[9px] text-zinc-400">
                    {session.status} · {session.lines.length} lines
                  </span>
                </button>
              ))}
            </div>
            <div
              className={cn(
                'max-h-52 min-h-28 overflow-auto p-2 font-mono leading-relaxed',
                codexProcessTerminalExpanded && 'max-h-none min-h-0'
              )}
            >
              {selectedCodexProcessTerminal ? (
                filteredCodexProcessTerminalLines.length ? (
                  filteredCodexProcessTerminalLines.map((line, index) => (
                    <div
                      key={`${codexProcessHandle}-${index}`}
                      className="whitespace-pre-wrap break-words"
                    >
                      {line || ' '}
                    </div>
                  ))
                ) : (
                  <div className="text-zinc-500">
                    No terminal lines match the current search.
                  </div>
                )
              ) : (
                <div className="text-zinc-500">
                  Select a process session to view output.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="px-2 py-3 text-zinc-500">
            Spawn a process, run command/exec, or attach a known process handle
            to start a terminal session.
          </div>
        )}
      </div>
      <pre className="whitespace-pre-wrap break-words max-h-32 overflow-auto">
        {codexRuntimeSnapshot
          ? JSON.stringify(codexRuntimeSnapshot, null, 2)
          : '— (runtime action results)'}
      </pre>
      {selectableCodexProcessHandles.length ? (
        <div className="mt-1 flex flex-wrap gap-1">
          {selectableCodexProcessHandles.map((processHandle) => (
            <button
              key={processHandle}
              type="button"
              className={cn(
                'max-w-full truncate rounded border px-1.5 py-0.5 font-mono text-[9px] hover:bg-accent',
                codexProcessHandle.trim() === processHandle && 'bg-accent'
              )}
              title={processHandle}
              onClick={() => onSetCodexProcessHandle(processHandle)}
            >
              proc:{processHandle}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
