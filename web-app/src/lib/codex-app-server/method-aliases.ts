export const CODEX_APP_SERVER_METHOD_FALLBACKS: Record<string, string> = {
  'mcpServer/status/list': 'mcpServerStatus/list',
  'mcpServerStatus/list': 'mcpServer/status/list',
  'thread/compact/start': 'thread/compact',
  'thread/compact': 'thread/compact/start',
  'review/start': 'thread/review',
  'thread/review': 'review/start',
}

export function resolveCodexAppServerMethod(method: string): string {
  return CODEX_APP_SERVER_METHOD_FALLBACKS[method] ?? method
}
