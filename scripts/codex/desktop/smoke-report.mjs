#!/usr/bin/env node
/**
 * Generate a current desktop smoke report template for the Jan Codex runtime.
 *
 * This does not run the interactive Tauri smoke. It creates a timestamped,
 * current-commit report template so the remaining manual pass records evidence
 * consistently and does not rely on stale checklist metadata.
 */

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { cwd, platform } from 'node:process'

const root = cwd()
const reportsDir = join(root, 'reports', 'codex-desktop-smoke')
const checklistPath = join(root, 'DESKTOP_SMOKE_CHECKLIST.md')
const defaultCodexBinary =
  platform === 'darwin' && existsSync('/Applications/Codex.app/Contents/Resources/codex')
    ? '/Applications/Codex.app/Contents/Resources/codex'
    : 'codex'
const codexBinary = process.env.CODEX_BINARY || defaultCodexBinary

function run(command, args, timeout = 10_000) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    timeout,
    windowsHide: true,
  })
  return {
    ok: result.status === 0,
    status: result.status,
    stdout: result.stdout?.toString() ?? '',
    stderr: result.error ? String(result.error.message) : result.stderr?.toString() ?? '',
  }
}

function safeLine(value, fallback = 'unknown') {
  const trimmed = String(value ?? '').trim()
  return trimmed.length ? trimmed.replace(/\n/g, ' ') : fallback
}

function extractChecklistSections(text) {
  const sections = []
  const lines = text.split('\n')
  let current = null
  for (const line of lines) {
    const heading = line.match(/^###\s+(.+)$/)
    if (heading) {
      current = { title: heading[1], checks: [] }
      sections.push(current)
      continue
    }
    const check = line.match(/^- \[ \]\s+(.+)$/)
    if (check && current) {
      current.checks.push(check[1])
    }
  }
  return sections
}

function getSourceWorktreeState() {
  const result = run('git', [
    'status',
    '--porcelain',
    '--',
    '.',
    ':(exclude)reports/codex-desktop-smoke',
  ])
  if (!result.ok) return 'unknown'
  return result.stdout.trim() ? 'dirty' : 'clean'
}

const now = new Date()
const timestamp = now.toISOString().replace(/[:.]/g, '-')
const branch = safeLine(run('git', ['rev-parse', '--abbrev-ref', 'HEAD']).stdout)
const commit = safeLine(run('git', ['rev-parse', '--short', 'HEAD']).stdout)
const sourceWorktree = getSourceWorktreeState()
const codexVersionResult = run(codexBinary, ['-V'])
const codexVersion = safeLine(
  codexVersionResult.stdout || codexVersionResult.stderr,
  `${codexBinary} not runnable`
)
const preflight = run('yarn', ['codex:desktop:preflight'], 30_000)
const checklistText = existsSync(checklistPath) ? readFileSync(checklistPath, 'utf8') : ''
const sections = extractChecklistSections(checklistText)
const reportPath = join(reportsDir, `${timestamp}-${branch.replace(/[^a-zA-Z0-9._-]+/g, '-')}-${commit}.md`)

const body = `# Jan Codex Runtime Desktop Smoke Report

- Date: ${now.toISOString()}
- Branch: ${branch}
- Commit: ${commit}
- Source worktree: ${sourceWorktree}
- Codex binary: ${codexBinary}
- Codex version: ${codexVersion}
- Checklist: ${existsSync(checklistPath) ? basename(checklistPath) : 'missing'}
- Preflight: ${preflight.ok ? 'passed' : 'failed'}

## Preflight output

\`\`\`text
${(preflight.stdout || preflight.stderr || 'no output').trim()}
\`\`\`

## Result summary

- Overall: TODO pass/fail
- Tester: TODO
- App launch mode: TODO dev:tauri / built app
- Screenshots or recordings: TODO paths or notes
- New bugs found: TODO

## Test matrix

${sections
  .map((section) => {
    const checks = section.checks.length
      ? section.checks.map((check) => `- [ ] ${check}\n  Evidence: TODO`).join('\n')
      : '- [ ] Section exercised\n  Evidence: TODO'
    return `### ${section.title}\n\n${checks}`
  })
  .join('\n\n')}

## Required evidence attachments

- [ ] Approval dialog in action
  Evidence: TODO
- [ ] Streaming chat with command output
  Evidence: TODO
- [ ] Review panel after Codex edit
  Evidence: TODO
- [ ] Runtime terminal/process panel
  Evidence: TODO
- [ ] Process start / event logs
  Evidence: TODO

## Final decision

- [ ] Ready to mark Codex clone v1 complete
- [ ] Not ready; blockers listed below

Blockers:
- TODO
`

if (process.argv.includes('--write')) {
  mkdirSync(reportsDir, { recursive: true })
  writeFileSync(reportPath, body)
  console.log(reportPath)
} else {
  console.log(body)
}
