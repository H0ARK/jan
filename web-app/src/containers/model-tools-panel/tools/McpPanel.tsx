import { Input } from '@/components/ui/input'

import { cn } from '@/lib/utils'
import {
  buildJsonTemplateFromSchema,
  type CodexMcpResourceDescriptor,
  type CodexMcpToolDescriptor,
} from '../shared/codex-helpers'

type McpPanelProps = {
  codexMcpServerName: string
  codexMcpResourceUri: string
  codexMcpToolName: string
  codexMcpToolArguments: string
  codexMcpDescriptorFilter: string
  mcpBusy: boolean
  currentThreadIdForCaps: string | null | undefined
  mcpStatus: unknown
  codexMcpSnapshot: unknown
  selectableCodexMcpServerNames: string[]
  selectableCodexMcpResourceUris: string[]
  selectableCodexMcpToolNames: string[]
  codexMcpResourceDescriptors: CodexMcpResourceDescriptor[]
  codexMcpToolDescriptors: CodexMcpToolDescriptor[]
  filteredCodexMcpResourceDescriptors: CodexMcpResourceDescriptor[]
  filteredCodexMcpToolDescriptors: CodexMcpToolDescriptor[]
  selectedCodexMcpToolDescriptor?: CodexMcpToolDescriptor
  codexMcpToolArgumentValidation: string[]
  onSetCodexMcpServerName: (value: string) => void
  onSetCodexMcpResourceUri: (value: string) => void
  onSetCodexMcpToolName: (value: string) => void
  onSetCodexMcpToolArguments: (value: string) => void
  onSetCodexMcpDescriptorFilter: (value: string) => void
  onSetCapError: (message: string) => void
  onRunCodexMcpAction: (
    method: string,
    params: Record<string, unknown>,
    success?: string
  ) => Promise<unknown | null>
  onMcpOauthLogin: () => Promise<void>
}

export function McpPanel({
  codexMcpServerName,
  codexMcpResourceUri,
  codexMcpToolName,
  codexMcpToolArguments,
  codexMcpDescriptorFilter,
  mcpBusy,
  currentThreadIdForCaps,
  mcpStatus,
  codexMcpSnapshot,
  selectableCodexMcpServerNames,
  selectableCodexMcpResourceUris,
  selectableCodexMcpToolNames,
  codexMcpResourceDescriptors,
  codexMcpToolDescriptors,
  filteredCodexMcpResourceDescriptors,
  filteredCodexMcpToolDescriptors,
  selectedCodexMcpToolDescriptor,
  codexMcpToolArgumentValidation,
  onSetCodexMcpServerName,
  onSetCodexMcpResourceUri,
  onSetCodexMcpToolName,
  onSetCodexMcpToolArguments,
  onSetCodexMcpDescriptorFilter,
  onSetCapError,
  onRunCodexMcpAction,
  onMcpOauthLogin,
}: McpPanelProps) {
  const handleReadResource = () => {
    void onRunCodexMcpAction(
      'mcpServer/resource/read',
      {
        server: codexMcpServerName.trim(),
        uri: codexMcpResourceUri.trim(),
      },
      'Codex MCP resource read'
    )
  }

  const handleReloadConfig = () => {
    void onRunCodexMcpAction(
      'config/mcpServer/reload',
      {},
      'Codex MCP config reloaded'
    )
  }

  const handleCallTool = () => {
    try {
      void onRunCodexMcpAction(
        'mcpServer/tool/call',
        {
          server: codexMcpServerName.trim(),
          toolName: codexMcpToolName.trim(),
          arguments: JSON.parse(codexMcpToolArguments || '{}'),
        },
        'Codex MCP tool called'
      )
    } catch (e) {
      onSetCapError('MCP tool arguments JSON parse failed: ' + String(e))
    }
  }

  return (
    <div className="mb-2 border rounded p-1 bg-background/50 text-[10px]">
      <div className="font-mono mb-0.5 flex items-center justify-between gap-2">
        <span>MCP server status</span>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!currentThreadIdForCaps}
          onClick={() => {
            void onMcpOauthLogin()
          }}
        >
          MCP OAuth login
        </button>
      </div>
      <div className="mb-1 grid grid-cols-1 gap-1 md:grid-cols-3">
        <Input
          className="h-6 px-2 text-[10px]"
          placeholder="MCP server"
          value={codexMcpServerName}
          onChange={(event) => onSetCodexMcpServerName(event.target.value)}
        />
        <Input
          className="h-6 px-2 text-[10px]"
          placeholder="Resource URI"
          value={codexMcpResourceUri}
          onChange={(event) => onSetCodexMcpResourceUri(event.target.value)}
        />
        <Input
          className="h-6 px-2 text-[10px]"
          placeholder="Tool name"
          value={codexMcpToolName}
          onChange={(event) => onSetCodexMcpToolName(event.target.value)}
        />
      </div>
      <textarea
        className="mb-1 min-h-12 w-full resize-y rounded border bg-background px-2 py-1 font-mono text-[10px]"
        placeholder="MCP tool arguments JSON"
        value={codexMcpToolArguments}
        onChange={(event) => onSetCodexMcpToolArguments(event.target.value)}
      />
      {selectedCodexMcpToolDescriptor?.inputSchema ? (
        <div
          className={cn(
            'mb-1 rounded border px-2 py-1 text-[9px]',
            codexMcpToolArgumentValidation.length
              ? 'border-destructive/40 bg-destructive/5 text-destructive'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
          )}
        >
          {codexMcpToolArgumentValidation.length
            ? codexMcpToolArgumentValidation.slice(0, 4).join('; ')
            : 'Tool arguments match the selected tool schema.'}
        </div>
      ) : null}
      <div className="mb-1 flex flex-wrap gap-x-2 gap-y-1">
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={
            !currentThreadIdForCaps ||
            mcpBusy ||
            !codexMcpServerName.trim() ||
            !codexMcpResourceUri.trim()
          }
          onClick={handleReadResource}
        >
          Read resource
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!currentThreadIdForCaps || mcpBusy}
          onClick={handleReloadConfig}
        >
          Reload config
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={
            !currentThreadIdForCaps ||
            mcpBusy ||
            !codexMcpServerName.trim() ||
            !codexMcpToolName.trim() ||
            codexMcpToolArgumentValidation.length > 0
          }
          onClick={handleCallTool}
        >
          Call tool
        </button>
      </div>
      <pre className="whitespace-pre-wrap break-words max-h-20 overflow-auto">
        {mcpStatus ? JSON.stringify(mcpStatus, null, 2) : '— (refresh to load)'}
      </pre>
      {selectableCodexMcpServerNames.length ? (
        <div className="mt-1 flex flex-wrap gap-1">
          {selectableCodexMcpServerNames.map((serverName) => (
            <button
              key={serverName}
              type="button"
              className={cn(
                'max-w-full truncate rounded border px-1.5 py-0.5 font-mono text-[9px] hover:bg-accent',
                codexMcpServerName.trim() === serverName && 'bg-accent'
              )}
              title={serverName}
              onClick={() => onSetCodexMcpServerName(serverName)}
            >
              {serverName}
            </button>
          ))}
        </div>
      ) : null}
      {selectableCodexMcpResourceUris.length ? (
        <div className="mt-1 flex flex-wrap gap-1">
          {selectableCodexMcpResourceUris.map((resourceUri) => (
            <button
              key={resourceUri}
              type="button"
              className={cn(
                'max-w-full truncate rounded border px-1.5 py-0.5 font-mono text-[9px] hover:bg-accent',
                codexMcpResourceUri.trim() === resourceUri && 'bg-accent'
              )}
              title={resourceUri}
              onClick={() => onSetCodexMcpResourceUri(resourceUri)}
            >
              resource:{resourceUri}
            </button>
          ))}
        </div>
      ) : null}
      {selectableCodexMcpToolNames.length ? (
        <div className="mt-1 flex flex-wrap gap-1">
          {selectableCodexMcpToolNames.map((toolName) => (
            <button
              key={toolName}
              type="button"
              className={cn(
                'max-w-full truncate rounded border px-1.5 py-0.5 font-mono text-[9px] hover:bg-accent',
                codexMcpToolName.trim() === toolName && 'bg-accent'
              )}
              title={toolName}
              onClick={() => onSetCodexMcpToolName(toolName)}
            >
              tool:{toolName}
            </button>
          ))}
        </div>
      ) : null}
      {codexMcpResourceDescriptors.length || codexMcpToolDescriptors.length ? (
        <div className="mt-2 grid grid-cols-1 gap-1 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input
              className="h-6 px-2 text-[10px]"
              placeholder="Search MCP resources / tools"
              value={codexMcpDescriptorFilter}
              onChange={(event) =>
                onSetCodexMcpDescriptorFilter(event.target.value)
              }
            />
          </div>
          <div className="rounded border bg-background/40 p-1">
            <div className="mb-1 flex items-center justify-between gap-2 font-mono text-[9px]">
              <span>MCP resources</span>
              <span className="text-muted-foreground">
                {filteredCodexMcpResourceDescriptors.length}/
                {codexMcpResourceDescriptors.length}
              </span>
            </div>
            {filteredCodexMcpResourceDescriptors.length ? (
              <div className="max-h-28 space-y-1 overflow-auto">
                {filteredCodexMcpResourceDescriptors.map((descriptor) => (
                  <button
                    key={descriptor.uri}
                    type="button"
                    className="block w-full rounded border px-1.5 py-1 text-left hover:bg-accent"
                    title={descriptor.description ?? descriptor.uri}
                    onClick={() => onSetCodexMcpResourceUri(descriptor.uri)}
                  >
                    <div className="truncate font-mono text-[9px]">
                      {descriptor.name ?? descriptor.uri}
                    </div>
                    <div className="truncate text-[9px] text-muted-foreground">
                      {descriptor.mimeType ? `${descriptor.mimeType} · ` : ''}
                      {descriptor.uri}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-[9px] text-muted-foreground">
                No matching resource descriptors.
              </div>
            )}
          </div>
          <div className="rounded border bg-background/40 p-1">
            <div className="mb-1 flex items-center justify-between gap-2 font-mono text-[9px]">
              <span>MCP tools</span>
              <span className="text-muted-foreground">
                {filteredCodexMcpToolDescriptors.length}/
                {codexMcpToolDescriptors.length}
              </span>
            </div>
            {filteredCodexMcpToolDescriptors.length ? (
              <div className="max-h-28 space-y-1 overflow-auto">
                {filteredCodexMcpToolDescriptors.map((descriptor) => (
                  <button
                    key={descriptor.name}
                    type="button"
                    className="block w-full rounded border px-1.5 py-1 text-left hover:bg-accent"
                    title={descriptor.description ?? descriptor.name}
                    onClick={() => {
                      onSetCodexMcpToolName(descriptor.name)
                      onSetCodexMcpToolArguments(
                        JSON.stringify(
                          buildJsonTemplateFromSchema(descriptor.inputSchema),
                          null,
                          2
                        )
                      )
                    }}
                  >
                    <div className="truncate font-mono text-[9px]">
                      {descriptor.name}
                    </div>
                    <div className="truncate text-[9px] text-muted-foreground">
                      {descriptor.description ??
                        (descriptor.inputSchema ? 'schema available' : 'no schema')}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-[9px] text-muted-foreground">
                No matching tool descriptors.
              </div>
            )}
          </div>
        </div>
      ) : null}
      <pre className="mt-1 whitespace-pre-wrap break-words max-h-24 overflow-auto">
        {codexMcpSnapshot
          ? JSON.stringify(codexMcpSnapshot, null, 2)
          : '— (MCP resource/tool results)'}
      </pre>
    </div>
  )
}
