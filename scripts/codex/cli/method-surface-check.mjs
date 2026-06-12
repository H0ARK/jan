#!/usr/bin/env node
/**
 * Check Jan's codex app-server method surface against the active runtime's method surface.
 */

import { createInterface } from 'node:readline'
import { readFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const DEFAULT_CODEX_BINARY =
  process.platform === 'darwin'
    ? '/Applications/Codex.app/Contents/Resources/codex'
    : 'codex'
const CODEX_BINARY = process.env.CODEX_BINARY || DEFAULT_CODEX_BINARY
const PROBE_METHOD = 'listMethods'
const FALLBACK_PROBE_METHOD = 'jan_method_surface_probe_does_not_exist'
const REQUEST_TIMEOUT_MS = 8_000

const CLIENT_METHOD_SOURCES = [
  'web-app/src/lib/codex-app-server/client.ts',
  'web-app/src/lib/codex-app-server/chat-backend.ts',
  'web-app/src/lib/codex-app-server/method-aliases.ts',
]

function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

function collectCalledMethodsFromSource(sourceFile) {
  const rawText = readFileSync(resolve(process.cwd(), sourceFile), 'utf8')
  const text = stripComments(rawText)
  const methods = new Set()
  const patterns = [
    /(?:this\.|return\s+)?requestAppServerWithFallback\(\s*['"]([^'"]+)['"]/g,
    /requestAppServer\(\s*['"]([^'"]+)['"]/g,
    /callCodexAppServer\([^,]+,\s*['"]([^'"]+)['"]/g,
    /\.rpc\.request\(\s*['"]([^'"]+)['"]/g,
    /unsupportedAppServerMethod\(\s*['"]([^'"]+)['"]/g,
  ]

  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const method = match[1].trim()
      if (method.includes('/')) {
        methods.add(method)
      }
    }
  }

  return methods
}

function collectMethodsFromMethodAliases(sourceFile) {
  const rawText = readFileSync(resolve(process.cwd(), sourceFile), 'utf8')
  const aliasEntries = new Map()

  const aliasRegex = /['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g
  let match
  while ((match = aliasRegex.exec(rawText)) !== null) {
    const sourceMethod = match[1].trim()
    const fallbackMethod = match[2].trim()
    if (sourceMethod.includes('/') || fallbackMethod.includes('/')) {
      aliasEntries.set(sourceMethod, fallbackMethod)
    }
  }

  return aliasEntries
}

function collectJanMethodSurface() {
  const methodSet = new Set()
  const aliases = collectMethodsFromMethodAliases(
    'web-app/src/lib/codex-app-server/method-aliases.ts'
  )
  for (const source of CLIENT_METHOD_SOURCES) {
    for (const method of collectCalledMethodsFromSource(source)) {
      methodSet.add(method)
    }
  }
  for (const [method, fallback] of aliases.entries()) {
    methodSet.add(method)
    methodSet.add(fallback)
  }

  return {
    methods: Array.from(methodSet).sort(),
    aliases: Object.fromEntries(Array.from(aliases.entries())),
  }
}

function normalizeCode(methods) {
  return methods.filter(Boolean).map((value) => value.trim())
}

function parseMethodsFromResponsePayload(payload) {
  const candidates = []
  if (!payload) return []

  const error = payload.error
  if (!error) return []

  const collectFromText = (text) => {
    if (!text) return
    for (const match of text.matchAll(
      /[\"'`]?([a-z][A-Za-z0-9_]*\/[A-Za-z0-9_\/]*)[\"'`]?/g
    )) {
      candidates.push(match[1])
    }
    for (const match of text.matchAll(/\[[^\]]*\]/g)) {
      const maybeList = match[0]
      try {
        const parsed = JSON.parse(maybeList)
        if (Array.isArray(parsed)) {
          parsed.forEach((method) => {
            if (typeof method === 'string' && method.includes('/')) {
              candidates.push(method)
            }
          })
        }
      } catch {
        // ignore list fragments that are not parseable JSON
      }
    }
  }

  collectFromText(typeof error === 'string' ? error : JSON.stringify(error))
  collectFromText(typeof error.data === 'string' ? error.data : '')
  collectFromText(typeof error.message === 'string' ? error.message : '')
  if (error.data && Array.isArray(error.data)) {
    for (const method of error.data) {
      if (typeof method === 'string' && method.includes('/')) {
        candidates.push(method)
      }
    }
  }

  if (!candidates.length && error.data && typeof error.data === 'object') {
    const dataText = JSON.stringify(error.data)
    collectFromText(dataText)
  }

  return normalizeCode(Array.from(new Set(candidates)))
}

async function queryAppServerMethods(binary) {
  const child = spawn(binary, ['app-server', '--stdio'], {
    env: process.env,
    stdio: ['pipe', 'pipe', 'pipe'],
  })

  const stdout = createInterface({ input: child.stdout })
  const pending = new Map()
  const rawOutput = []
  const stderr = []
  let nextId = 1

  const close = (code, signal) => {
    for (const resolve of pending.values()) {
      resolve({
        id: null,
        error: {
          message: `app-server exited before response (${code ?? 'null'}, ${signal ?? 'null'})`,
        },
      })
    }
    pending.clear()
  }

  const pendingTimeouts = new Map()
  child.on('close', close)
  child.on('error', (error) => {
    close(error instanceof Error ? error.message : 'error', null)
  })

  child.stderr.on('data', (chunk) => {
    const data = chunk.toString()
    stderr.push(data)
  })

  stdout.on('line', (line) => {
    rawOutput.push(line)
    try {
      const message = JSON.parse(line)
      if (message.id === undefined || message.id === null) return
      const callback = pending.get(message.id)
      if (!callback) return
      const timeout = pendingTimeouts.get(message.id)
      if (timeout) {
        clearTimeout(timeout)
        pendingTimeouts.delete(message.id)
      }
      pending.delete(message.id)
      callback(message)
    } catch {
      // Ignore noisy startup logs that are not JSON-RPC envelopes.
    }
  })

  const request = (method, params = {}) =>
    new Promise((resolve) => {
      const id = nextId++
      const payload = { id, jsonrpc: '2.0', method, params }
      const timeout = setTimeout(() => {
        pending.delete(id)
        pendingTimeouts.delete(id)
        resolve({
          id,
          error: { message: `Timeout waiting for response to method '${method}'.` },
        })
      }, REQUEST_TIMEOUT_MS)

      pending.set(id, resolve)
      pendingTimeouts.set(id, timeout)
      child.stdin.write(`${JSON.stringify(payload)}\n`)
    })

  const notify = (method, params = {}) => {
    child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method, params })}\n`)
  }

  const initialize = await request('initialize', {
    clientInfo: { name: 'jan', title: 'Jan', version: '0.0.0' },
    capabilities: { experimentalApi: true },
  })
  notify('initialized')

  let probeResponse = await request(PROBE_METHOD)
  if (!probeResponse || probeResponse.error == null) {
    probeResponse = await request(FALLBACK_PROBE_METHOD)
  }

  const upstream = new Set(
    parseMethodsFromResponsePayload(probeResponse).filter((method) => method.includes('/'))
  )

  child.stdin.end()
  child.kill()

  return {
    initialize,
    probe: probeResponse,
    upstreamMethods: Array.from(upstream).sort(),
    rawOutput,
    stderr: stderr.join(''),
  }
}

function compareMethodSurfaces(jan, upstream) {
  const upstreamSet = new Set(upstream.map((method) => method.trim()))
  const missing = []
  const fallbackCovered = []

  for (const method of jan) {
    if (upstreamSet.has(method)) {
      continue
    }

    const fallback = methodAliasMap.get(method)
    if (fallback && upstreamSet.has(fallback)) {
      fallbackCovered.push({ method, fallback: fallback })
      continue
    }

    missing.push(method)
  }

  const extras = upstream.filter((method) => !jan.has(method))

  return {
    missing,
    fallbackCovered,
    extras,
  }
}

const { methods: methodsFromJan, aliases: methodAliases } = collectJanMethodSurface()
const methodAliasMap = new Map(Object.entries(methodAliases))
const janMethodSurface = new Set(methodsFromJan)

export async function runCodexMethodSurfaceCheck(binary = CODEX_BINARY) {
  const result = {
    timestamp: new Date().toISOString(),
    binary,
    initialize: null,
    probe: null,
    upstreamMethods: [],
    janMethods: methodsFromJan,
    aliasMap: methodAliases,
    comparison: null,
    overall: 'failed',
  }

  const appServerResult = await queryAppServerMethods(binary)
  result.initialize = appServerResult.initialize
  result.probe = appServerResult.probe
  result.upstreamMethods = appServerResult.upstreamMethods

  result.comparison = compareMethodSurfaces(janMethodSurface, result.upstreamMethods)

  const missing = result.comparison.missing.length
  const hasProbeError =
    result.probe && typeof result.probe === 'object' && result.probe.error
  result.overall =
    missing === 0 && hasProbeError && result.initialize.result !== undefined
      ? 'passed'
      : 'failed'

  return { result, exitCode: result.overall === 'passed' ? 0 : 1 }
}

export async function runCodexMethodSurfaceCheckCli() {
  const { result, exitCode } = await runCodexMethodSurfaceCheck(CODEX_BINARY)
  console.log(JSON.stringify(result, null, 2))

  for (const method of result.comparison.missing) {
    console.error(`[missing] ${method} not supported by upstream`)
  }
  for (const fallback of result.comparison.fallbackCovered) {
    console.error(
      `[alias] ${fallback.method} now falls back to ${fallback.fallback}`
    )
  }
  if (result.comparison.extras.length) {
    console.log(
      `[info] Upstream exposes ${result.comparison.extras.length} additional methods not used by Jan.`
    )
  }

  return exitCode
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const exitCode = await runCodexMethodSurfaceCheckCli()
  process.exit(exitCode)
}
