import { toast } from 'sonner'

import { parseCodexJson } from '../shared/codex-helpers'

type CodexReviewPanelProps = {
  currentThreadIdForCaps: string | null | undefined
  reviewStarting: boolean
  setReviewStarting: (value: boolean) => void
  codexAdvancedReviewJson: string
  onSetCodexAdvancedReviewJson: (value: string) => void
  onStartReview: (
    threadId: string,
    params: Record<string, unknown>
  ) => Promise<void>
}

const reviewPrompt =
  'Review the current workspace changes. Use your review/start capability with delivery=detached (or default detached) and target uncommittedChanges (or the appropriate base). Provide structured analysis, issues, risks, and suggestions ONLY — do not output or author the raw diff content itself (the host Review panel / git diff HEAD is the authoritative source). Reference specific files/paths from the real diff. Summarize for the Review tab.'

export function CodexReviewPanel({
  currentThreadIdForCaps,
  reviewStarting,
  setReviewStarting,
  codexAdvancedReviewJson,
  onSetCodexAdvancedReviewJson,
  onStartReview,
}: CodexReviewPanelProps) {
  const parseAdvancedReviewParams = () => {
    const parsed = parseCodexJson<Record<string, unknown>>(
      codexAdvancedReviewJson || '{}',
      {}
    )
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error('Advanced review params must be a JSON object.')
    }
    return parsed
  }

  const runAdvancedReview = async () => {
    if (!currentThreadIdForCaps) return
    setReviewStarting(true)
    try {
      await onStartReview(currentThreadIdForCaps, parseAdvancedReviewParams())
      toast.success('Advanced Codex review started')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to start advanced Codex review'
      )
    } finally {
      setReviewStarting(false)
    }
  }

  const runDetachedReview = async () => {
    if (!currentThreadIdForCaps) return
    setReviewStarting(true)
    try {
      await onStartReview(currentThreadIdForCaps, {
        type: 'uncommittedChanges',
      })
      toast.success(
        'Codex review started (detached). Analysis surfaces in chat; diff stays in git panel.'
      )
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to start Codex review'
      )
    } finally {
      setReviewStarting(false)
    }
  }

  const copyPromptToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(reviewPrompt)
      toast.success('Review prompt copied')
    } catch {
      // best effort
    }
  }

  return (
    <div className="p-2 border-t text-xs bg-muted/5">
      <div className="font-medium mb-1 flex items-center justify-between gap-2">
        <span>Codex Agent Review Analysis / Findings</span>
        <div className="flex gap-1 shrink-0">
          {currentThreadIdForCaps ? (
            <>
              <button
                type="button"
                className="text-[10px] px-2 py-0.5 border rounded hover:bg-accent disabled:opacity-50"
                disabled={reviewStarting}
                onClick={runDetachedReview}
                title="Call review/start with detached delivery against uncommitted changes"
              >
                {reviewStarting ? 'Starting…' : 'Start Codex review'}
              </button>
              <button
                type="button"
                className="text-[10px] px-2 py-0.5 border rounded hover:bg-accent disabled:opacity-50"
                disabled={reviewStarting}
                onClick={runAdvancedReview}
                title="Call review/start with custom JSON params"
              >
                Advanced review
              </button>
            </>
          ) : null}
          <button
            type="button"
            className="text-[10px] px-2 py-0.5 border rounded hover:bg-accent"
            onClick={copyPromptToClipboard}
            title="Copy prompt to paste into Codex chat (drives review/start detached + analysis for this panel)"
          >
            Copy review prompt
          </button>
        </div>
      </div>
      <div className="text-muted-foreground text-[10px]">
        Additional analysis or findings from the Codex engine (via
        review/start with detached delivery + userFacingHint, reasoning, plan,
        or direct chat instruction) can be surfaced here on top of the git
        diff above. The base diff is always from real `git diff HEAD` (or
        equivalent for the target via the Rust git_review_* commands). No
        agent-generated diff content is used or "added to a spot".
        The agent owns planning/tool use/subagents/patching/reasoning; Jan (this panel) owns the authoritative git view + approvals + workspace.
      </div>
      <div className="mt-1 text-[10px] text-muted-foreground">
        Select the Review tab (or open /review) while a Codex provider profile is active for the workspace. Instruct the agent in chat or use the copied prompt above. Codex events (including from subagents) with threadId appear in main chat CodexActivity; analysis can be referenced or copied here. Review panel stays purely git for the diff.
      </div>
      <textarea
        className="mt-1 min-h-12 w-full resize-y rounded border bg-background px-2 py-1 font-mono text-[10px]"
        placeholder="review/start params JSON"
        value={codexAdvancedReviewJson}
        onChange={(event) => onSetCodexAdvancedReviewJson(event.target.value)}
      />
    </div>
  )
}
