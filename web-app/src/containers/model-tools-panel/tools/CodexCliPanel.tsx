import { useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import {
  runCodexApply,
  runCodexCompletion,
  runCodexCliDebug,
  runCodexCliMcp,
  runCodexExec,
  runCodexCliProto,
  runCodexLogin,
  runCodexLogout,
  runCodexVersion,
  runCodexCliSubcommand,
} from '@/lib/codex-app-server'

type CodexCliPanelProps = {
  cwd: string
}

function parseCodexCliArgs(value: string, fallback: string[] | null) {
  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) {
      return fallback
    }
    return parsed.map((arg) => String(arg))
  } catch {
    return fallback
  }
}

function describeCodexCliError(error: unknown) {
  return `Codex CLI command failed: ${String(error)}`
}

export function CodexCliPanel({ cwd }: CodexCliPanelProps) {
  type CliSnapshot = {
    label: string
    result: unknown
  }

  const [busy, setBusy] = useState(false)
  const [snapshot, setSnapshot] = useState<CliSnapshot | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [execPrompt, setExecPrompt] = useState('')
  const [command, setCommand] = useState('')
  const [commandArgs, setCommandArgs] = useState('[]')
  const [applyTaskId, setApplyTaskId] = useState('')
  const [completionShell, setCompletionShell] = useState('bash')
  const [loginApiKey, setLoginApiKey] = useState('')
  const [rawArgs, setRawArgs] = useState('["--version"]')

  const runCodexCliAction = async (
    label: string,
    action: () => Promise<unknown>
  ) => {
    setBusy(true)
    setErrorMessage('')
    try {
      const result = await action()
      setSnapshot({ label, result })
      toast.success(`Codex CLI completed: ${label}`)
    } catch (e) {
      const message = describeCodexCliError(e)
      setErrorMessage(message)
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mb-2 border rounded p-1 bg-background/50 text-[10px]">
      <div className="font-mono mb-1 flex items-center justify-between gap-2">
        <span>Codex CLI</span>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={busy}
          onClick={() =>
            void runCodexCliAction('help', () =>
              runCodexCliSubcommand({
                command: 'codex',
                args: ['help'],
                cwd,
              })
            )
          }
        >
          Help
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={busy}
          onClick={() =>
            void runCodexCliAction('version', () =>
              runCodexVersion({
                cwd,
              })
            )
          }
        >
          Version
        </button>
      </div>
      <div className="mb-1 text-[10px] text-muted-foreground">
        Runs Codex CLI subcommands through the desktop bridge against the
        active workspace. This complements app-server chat with CLI-native
        diagnostics, review/apply flows, and automation.
      </div>
      <div className="mb-1 grid gap-1 md:grid-cols-3">
        <Input
          className="h-6 px-2 text-[10px]"
          placeholder="codex command (no leading codex)"
          value={command}
          onChange={(event) => setCommand(event.target.value)}
        />
        <Input
          className="h-6 px-2 text-[10px]"
          placeholder="apply task id for quick action"
          value={applyTaskId}
          onChange={(event) => setApplyTaskId(event.target.value)}
        />
        <Input
          className="h-6 px-2 text-[10px]"
          placeholder="completion shell (bash, zsh, fish)"
          value={completionShell}
          onChange={(event) => setCompletionShell(event.target.value)}
        />
      </div>
      <textarea
        className="mb-1 min-h-10 w-full resize-y rounded border bg-background px-2 py-1 font-mono text-[10px]"
        placeholder='codex command args JSON array (e.g. ["--uncommitted"] )'
        value={commandArgs}
        onChange={(event) => setCommandArgs(event.target.value)}
      />
      <div className="mb-1 flex flex-wrap gap-x-2 gap-y-1">
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={busy || !command.trim()}
          onClick={() => {
            const args = parseCodexCliArgs(commandArgs, null)
            if (args === null) {
              setErrorMessage('Codex CLI args must be a JSON array.')
              return
            }
            void runCodexCliAction(`codex ${command.trim()}`, () =>
              runCodexCliSubcommand({
                command: 'codex',
                args: [command.trim(), ...args],
                cwd,
              })
            )
          }}
        >
          Run CLI command
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={busy || !applyTaskId.trim()}
          onClick={() => {
            const taskId = applyTaskId.trim()
            if (!taskId) return
            void runCodexCliAction('codex apply', () =>
              runCodexApply({
                taskId,
                cwd,
              })
            )
          }}
        >
          Apply task diff
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={busy}
          onClick={() => {
            void runCodexCliAction('codex completion', () =>
              runCodexCompletion({
                shell: completionShell.trim() || 'bash',
                cwd,
              })
            )
          }}
        >
          Generate completion
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={busy}
          onClick={() => {
            void runCodexCliAction('login', () =>
              runCodexLogin({
                apiKey: loginApiKey.trim() || undefined,
                cwd,
              })
            )
          }}
        >
          Login
        </button>
      </div>
      <textarea
        className="mb-1 min-h-12 w-full resize-y rounded border bg-background px-2 py-1 font-mono text-[10px]"
        placeholder="codex exec prompt"
        value={execPrompt}
        onChange={(event) => setExecPrompt(event.target.value)}
      />
      <Input
        className="mb-1 h-6 px-2 text-[10px]"
        placeholder="login API key (optional)"
        value={loginApiKey}
        onChange={(event) => setLoginApiKey(event.target.value)}
      />
      <textarea
        className="mb-1 min-h-12 w-full resize-y rounded border bg-background px-2 py-1 font-mono text-[10px]"
        placeholder="raw Codex CLI args JSON array"
        value={rawArgs}
        onChange={(event) => setRawArgs(event.target.value)}
      />
      <div className="mb-1 flex flex-wrap gap-x-2 gap-y-1">
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={busy || !execPrompt.trim()}
          onClick={() => {
            void runCodexCliAction('exec', () =>
              runCodexExec({
                prompt: execPrompt.trim(),
                cwd,
                sandbox: 'workspace-write',
              })
            )
          }}
        >
          Exec
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={busy}
          onClick={() => {
            void runCodexCliAction('login status', () =>
              runCodexLogin({
                status: true,
                cwd,
              })
            )
          }}
        >
          Login status
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={busy}
          onClick={() => {
            void runCodexCliAction('logout', () =>
              runCodexLogout({
                cwd,
              })
            )
          }}
        >
          Logout
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={busy}
          onClick={() => {
            const args = parseCodexCliArgs(rawArgs, null)
            if (args === null) {
              setErrorMessage('Codex CLI args must be a JSON array.')
              return
            }
            void runCodexCliAction('raw', () =>
              runCodexCliSubcommand({
                command: 'codex',
                args,
                cwd,
              })
            )
          }}
        >
          Raw CLI
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={busy}
          onClick={() => {
            const args = parseCodexCliArgs(rawArgs, null)
            if (args === null) {
              setErrorMessage('Codex CLI args must be a JSON array.')
              return
            }
            void runCodexCliAction('app-server', () =>
              runCodexCliSubcommand({
                command: 'codex',
                args: ['app-server', ...args],
                cwd,
              })
            )
          }}
        >
          App-server
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={busy}
          onClick={() => {
            const args = parseCodexCliArgs(rawArgs, null)
            if (args === null) {
              setErrorMessage('Codex CLI args must be a JSON array.')
              return
            }
            void runCodexCliAction('proto', () =>
              runCodexCliProto({
                args,
                cwd,
              })
            )
          }}
        >
          Proto
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={busy}
          onClick={() => {
            const args = parseCodexCliArgs(rawArgs, null)
            if (args === null) {
              setErrorMessage('Codex CLI args must be a JSON array.')
              return
            }
            void runCodexCliAction('mcp', () =>
              runCodexCliMcp({
                args,
                cwd,
              })
            )
          }}
        >
          MCP
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={busy}
          onClick={() => {
            const args = parseCodexCliArgs(rawArgs, null)
            if (args === null) {
              setErrorMessage('Codex CLI args must be a JSON array.')
              return
            }
            void runCodexCliAction('debug', () =>
              runCodexCliDebug({
                args,
                cwd,
              })
            )
          }}
        >
          Debug
        </button>
      </div>
      <pre className="whitespace-pre-wrap break-words max-h-32 overflow-auto">
        {snapshot
          ? JSON.stringify(snapshot, null, 2)
          : '— (CLI result)'}
      </pre>
      {errorMessage ? (
        <div className="mt-1 text-[9px] text-red-500">{errorMessage}</div>
      ) : null}
    </div>
  )
}
