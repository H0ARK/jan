type CodexCapabilitiesFooterProps = {
  message?: string
}

export function CodexCapabilitiesFooter({
  message = 'Full layer also includes remoteControl/*, marketplace, config read/write, listCollaborationModes, Studio CLI actions, and git worktrees (Projects menu).',
}: CodexCapabilitiesFooterProps) {
  return <div className="mt-1 text-[9px] text-muted-foreground">{message}</div>
}
