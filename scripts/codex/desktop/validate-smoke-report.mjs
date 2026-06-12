#!/usr/bin/env node
/**
 * Validate a filled Jan Codex desktop smoke report.
 *
 * Usage:
 *   node scripts/codex/desktop/validate-smoke-report.mjs [report.md]
 *   node scripts/codex/desktop/validate-smoke-report.mjs --latest
 *   node scripts/codex/desktop/validate-smoke-report.mjs --self-test
 */

import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { cwd, platform } from 'node:process'

const root = cwd()
const reportsDir = join(root, 'reports', 'codex-desktop-smoke')
const defaultCodexBinary =
  platform === 'darwin' &&
  existsSync('/Applications/Codex.app/Contents/Resources/codex')
    ? '/Applications/Codex.app/Contents/Resources/codex'
    : 'codex'
const codexBinary = process.env.CODEX_BINARY || defaultCodexBinary

function fail(message, detail) {
  return { ok: false, message, detail }
}

function pass(message, detail) {
  return { ok: true, message, detail }
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    timeout: 10_000,
    windowsHide: true,
  })
  return result.status === 0 ? String(result.stdout ?? '').trim() : ''
}

function getSourceWorktreeState() {
  const result = spawnSync(
    'git',
    [
      'status',
      '--porcelain',
      '--',
      '.',
      ':(exclude)reports/codex-desktop-smoke',
    ],
    {
      cwd: root,
      encoding: 'utf8',
      timeout: 10_000,
      windowsHide: true,
    }
  )
  if (result.status !== 0) return 'unknown'
  return String(result.stdout ?? '').trim() ? 'dirty' : 'clean'
}

function safeLine(value, fallback = '') {
  const trimmed = String(value ?? '').trim()
  return trimmed.length ? trimmed.replace(/\n/g, ' ') : fallback
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function findLatestReport() {
  if (!existsSync(reportsDir)) return null
  const reports = readdirSync(reportsDir)
    .filter((name) => name.endsWith('.md'))
    .sort()
  const latest = reports.at(-1)
  return latest ? join(reportsDir, latest) : null
}

function validateReportText(text, context = {}) {
  const checks = []
  const checkboxLines = text
    .split('\n')
    .map((line, index) => ({ line, number: index + 1 }))
    .filter(({ line }) => /^- \[[ xX]\]/.test(line))
  const uncheckedLines = checkboxLines.filter(({ line }) => /^- \[ \]/.test(line))
  const blockingUncheckedLines = uncheckedLines.filter(
    ({ line }) => !/- \[ \] Not ready; blockers listed below/.test(line)
  )
  const todoLines = text
    .split('\n')
    .map((line, index) => ({ line, number: index + 1 }))
    .filter(({ line }) => /TODO/.test(line))

  checks.push(
    /- Preflight: passed/.test(text)
      ? pass('Preflight marked passed')
      : fail('Preflight is not marked passed')
  )
  if (context.branch) {
    const branchPattern = new RegExp(`- Branch:\\s*${escapeRegex(context.branch)}\\b`)
    checks.push(
      branchPattern.test(text)
        ? pass('Report branch matches current branch')
        : fail('Report branch does not match current branch', context.branch)
    )
  }
  if (context.commit) {
    const commitPattern = new RegExp(`- Commit:\\s*${escapeRegex(context.commit)}\\b`)
    checks.push(
      commitPattern.test(text)
        ? pass('Report commit matches current commit')
        : fail('Report commit does not match current commit', context.commit)
    )
  }
  if (context.sourceWorktree) {
    checks.push(
      /- Source worktree:\s*clean\b/i.test(text)
        ? pass('Report source worktree is marked clean')
        : fail('Report source worktree is not marked clean')
    )
    checks.push(
      context.sourceWorktree === 'clean'
        ? pass('Current source worktree is clean')
        : fail('Current source worktree is not clean', context.sourceWorktree)
    )
  }
  if (context.codexBinary) {
    const codexBinaryPattern = new RegExp(
      `- Codex binary:\\s*${escapeRegex(context.codexBinary)}\\s*$`,
      'm'
    )
    checks.push(
      codexBinaryPattern.test(text)
        ? pass('Report Codex binary matches current binary')
        : fail('Report Codex binary does not match current binary', context.codexBinary)
    )
  }
  if (context.codexVersion) {
    const codexVersionPattern = new RegExp(
      `- Codex version:\\s*${escapeRegex(context.codexVersion)}\\s*$`,
      'm'
    )
    checks.push(
      codexVersionPattern.test(text)
        ? pass('Report Codex version matches current binary')
        : fail('Report Codex version does not match current binary', context.codexVersion)
    )
  }
  checks.push(
    /- Overall: pass\b/i.test(text)
      ? pass('Overall result marked pass')
      : fail('Overall result is not marked pass')
  )
  checks.push(
    /- Tester:\s*(?!TODO)\S/i.test(text)
      ? pass('Tester is filled')
      : fail('Tester is missing')
  )
  checks.push(
    /- App launch mode:\s*(?!TODO)(dev:tauri|built app)\b/i.test(text)
      ? pass('App launch mode is filled')
      : fail('App launch mode is missing or unsupported')
  )
  checks.push(
    /- Screenshots or recordings:\s*(?!TODO)\S/i.test(text)
      ? pass('Screenshots or recordings are filled')
      : fail('Screenshots or recordings are missing')
  )
  checks.push(
    /- \[[xX]\] Ready to mark Codex clone v1 complete/.test(text)
      ? pass('Final decision marks v1 ready')
      : fail('Final decision does not mark v1 ready')
  )
  checks.push(
    /- \[[xX]\] Not ready; blockers listed below/.test(text)
      ? fail('Report marks v1 not ready')
      : pass('Report does not mark v1 not ready')
  )
  checks.push(
    blockingUncheckedLines.length === 0
      ? pass('No unchecked checklist items remain')
      : fail(
          'Unchecked checklist items remain',
          blockingUncheckedLines
            .slice(0, 10)
            .map(({ number, line }) => `${number}: ${line}`)
        )
  )
  checks.push(
    todoLines.length === 0
      ? pass('No TODO placeholders remain')
      : fail(
          'TODO placeholders remain',
          todoLines.slice(0, 10).map(({ number, line }) => `${number}: ${line}`)
        )
  )
  checks.push(
    /Approval dialog in action[\s\S]*Evidence:\s*(?!TODO)\S/.test(text)
      ? pass('Approval evidence is filled')
      : fail('Approval evidence is missing')
  )
  checks.push(
    /Streaming chat with command output[\s\S]*Evidence:\s*(?!TODO)\S/.test(text)
      ? pass('Streaming command-output evidence is filled')
      : fail('Streaming command-output evidence is missing')
  )
  checks.push(
    /Runtime terminal\/process panel[\s\S]*Evidence:\s*(?!TODO)\S/.test(text)
      ? pass('Runtime panel evidence is filled')
      : fail('Runtime panel evidence is missing')
  )
  checks.push(
    /Review panel after Codex edit[\s\S]*Evidence:\s*(?!TODO)\S/.test(text)
      ? pass('Review panel evidence is filled')
      : fail('Review panel evidence is missing')
  )
  checks.push(
    /Process start \/ event logs[\s\S]*Evidence:\s*(?!TODO)\S/.test(text)
      ? pass('Process event-log evidence is filled')
      : fail('Process event-log evidence is missing')
  )

  const failed = checks.filter((check) => !check.ok)
  return {
    overall: failed.length ? 'failed' : 'passed',
    checks,
  }
}

function printReport(reportPath, result) {
  console.log(
    JSON.stringify(
      {
        reportPath,
        overall: result.overall,
        checks: result.checks,
      },
      null,
      2
    )
  )
}

function runSelfTest() {
  const passingReport = `# Jan Codex Runtime Desktop Smoke Report

- Preflight: passed
- Branch: feature-codex-runtime-preview
- Commit: abc1234
- Source worktree: clean
- Codex binary: /Applications/Codex.app/Contents/Resources/codex
- Codex version: codex-cli 0.140.0-alpha.2
- Overall: pass
- Tester: conrad
- App launch mode: dev:tauri
- Screenshots or recordings: reports/codex-desktop-smoke/screenshots/pass.png

- [x] App launches cleanly
  Evidence: screenshot app.png
- [x] Approval dialog in action
  Evidence: screenshot approval.png
- [x] Streaming chat with command output
  Evidence: screenshot stream.png
- [x] Runtime terminal/process panel
  Evidence: screenshot runtime.png
- [x] Review panel after Codex edit
  Evidence: screenshot review.png
- [x] Process start / event logs
  Evidence: screenshot process-events.png

- [x] Ready to mark Codex clone v1 complete
- [ ] Not ready; blockers listed below
`
  const failingReport = passingReport.replace('- Overall: pass', '- Overall: TODO pass/fail')
  const staleReport = passingReport.replace('- Commit: abc1234', '- Commit: def5678')
  const staleVersionReport = passingReport.replace(
    '- Codex version: codex-cli 0.140.0-alpha.2',
    '- Codex version: codex-cli 0.139.0'
  )
  const context = {
    branch: 'feature-codex-runtime-preview',
    commit: 'abc1234',
    sourceWorktree: 'clean',
    codexBinary: '/Applications/Codex.app/Contents/Resources/codex',
    codexVersion: 'codex-cli 0.140.0-alpha.2',
  }
  const dirtyContext = {
    ...context,
    sourceWorktree: 'dirty',
  }
  const passResult = validateReportText(passingReport, context)
  const failResult = validateReportText(failingReport, context)
  const staleResult = validateReportText(staleReport, context)
  const staleVersionResult = validateReportText(staleVersionReport, context)
  const dirtyResult = validateReportText(passingReport, dirtyContext)
  if (
    passResult.overall !== 'passed' ||
    failResult.overall !== 'failed' ||
    staleResult.overall !== 'failed' ||
    staleVersionResult.overall !== 'failed' ||
    dirtyResult.overall !== 'failed'
  ) {
    printReport('self-test-pass', passResult)
    printReport('self-test-fail', failResult)
    printReport('self-test-stale', staleResult)
    printReport('self-test-stale-version', staleVersionResult)
    printReport('self-test-dirty-source', dirtyResult)
    process.exitCode = 1
    return
  }
  console.log('self-test passed')
}

if (process.argv.includes('--self-test')) {
  runSelfTest()
} else {
  const explicitPath = process.argv.find((arg) => arg.endsWith('.md'))
  const reportPath = explicitPath ? resolve(root, explicitPath) : findLatestReport()
  if (!reportPath || !existsSync(reportPath)) {
    console.error('No desktop smoke report found. Generate one with yarn codex:desktop:smoke:report.')
    process.exit(1)
  }
  const result = validateReportText(readFileSync(reportPath, 'utf8'), {
    branch: run('git', ['rev-parse', '--abbrev-ref', 'HEAD']),
    commit: run('git', ['rev-parse', '--short', 'HEAD']),
    sourceWorktree: getSourceWorktreeState(),
    codexBinary,
    codexVersion: safeLine(
      run(codexBinary, ['-V']),
      `${codexBinary} not runnable`
    ),
  })
  printReport(reportPath, result)
  if (result.overall !== 'passed') process.exitCode = 1
}
