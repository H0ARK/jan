import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

import {
  parseCodexJson,
  stringifyCodexJson,
} from '../shared/codex-helpers'

type AccountPanelProps = {
  accountBusy: boolean
  currentThreadIdForCaps: string | null | undefined
  accountLoginParamsJson: string
  accountUsageParamsJson: string
  accountCreditsNudgeType: string
  accountInfo: unknown
  accountRateLimits: unknown
  accountUsage: unknown
  accountLogin: unknown
  accountRequiresAuth: unknown
  accountType: unknown
  accountEmail: unknown
  accountPlan: unknown
  onSetAccountLoginParamsJson: (value: string) => void
  onSetAccountUsageParamsJson: (value: string) => void
  onSetAccountCreditsNudgeType: (value: string) => void
  onSetCapError: (message: string | null) => void
  onSetAccountBusy: (busy: boolean) => void
  onRefreshCodexAccount: (refreshToken?: boolean) => Promise<void> | void
  onStartDeviceCodeLogin: () => Promise<void> | void
  onCancelDeviceCodeLogin: () => Promise<void> | void
  onLogoutCodex: () => Promise<void> | void
  onReadCodexAccountRateLimits: (janThreadId: string) => Promise<unknown>
  onReadCodexAccountUsage: (janThreadId: string, params?: Record<string, unknown>) => Promise<unknown>
  onSendCodexAddCreditsNudgeEmail: (janThreadId: string, creditType: 'credits' | 'usage_limit') => Promise<unknown>
  onSetAccountRateLimits: (value: unknown) => void
  onSetAccountUsage: (value: unknown) => void
}

export function AccountPanel({
  accountBusy,
  currentThreadIdForCaps,
  accountLoginParamsJson,
  accountUsageParamsJson,
  accountCreditsNudgeType,
  accountInfo,
  accountRateLimits,
  accountUsage,
  accountLogin,
  accountRequiresAuth,
  onSetAccountLoginParamsJson,
  onSetAccountUsageParamsJson,
  onSetAccountCreditsNudgeType,
  onSetCapError,
  onSetAccountBusy,
  onRefreshCodexAccount,
  onStartDeviceCodeLogin,
  onCancelDeviceCodeLogin,
  onLogoutCodex,
  onReadCodexAccountRateLimits,
  onReadCodexAccountUsage,
  onSendCodexAddCreditsNudgeEmail,
  onSetAccountRateLimits,
  onSetAccountUsage,
}: AccountPanelProps) {
  const [showAdvancedLoginParams, setShowAdvancedLoginParams] = useState(false)
  const [showAdvancedUsageParams, setShowAdvancedUsageParams] = useState(false)

  const isPlainObject = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }

  const parsedLoginParams = parseCodexJson<Record<string, unknown>>(
    accountLoginParamsJson,
    {}
  )
  const parsedUsageParams = parseCodexJson<Record<string, unknown>>(
    accountUsageParamsJson,
    {}
  )
  const parsedLoginType =
    typeof parsedLoginParams.type === 'string'
      ? parsedLoginParams.type
      : 'chatgptDeviceCode'
  const parsedRangeDays =
    typeof parsedUsageParams.rangeDays === 'number'
      ? String(parsedUsageParams.rangeDays)
      : parsedUsageParams.rangeDays === 0
        ? '0'
        : ''

  const onSetLoginType = (nextType: string) => {
    const nextParams = {
      ...parsedLoginParams,
      type: nextType || 'chatgptDeviceCode',
    }
    onSetAccountLoginParamsJson(stringifyCodexJson(nextParams, accountLoginParamsJson))
  }

  const onSetUsageRangeDays = (rawRangeDays: string) => {
    const nextParams = { ...parsedUsageParams }
    if (rawRangeDays.trim()) {
      const parsedRangeDays = Number.parseInt(rawRangeDays, 10)
      if (!Number.isNaN(parsedRangeDays)) {
        nextParams.rangeDays = parsedRangeDays
      } else {
        delete nextParams.rangeDays
      }
    } else {
      delete nextParams.rangeDays
    }
    onSetAccountUsageParamsJson(stringifyCodexJson(nextParams, accountUsageParamsJson))
  }

  const account = (accountInfo as any)?.account
  const resolvedAccountType = account?.type ?? (accountInfo as any)?.authMode ?? 'none'
  const resolvedAccountEmail = account?.email ?? (accountInfo as any)?.email
  const resolvedAccountPlan = account?.planType ?? (accountInfo as any)?.planType
  const resolvedRequiresAuth = (accountInfo as any)?.requiresOpenaiAuth ?? accountRequiresAuth

  return (
    <div className="mb-2 border rounded p-1 bg-background/50 text-[10px]">
      <div className="font-mono mb-1 flex items-center justify-between gap-2">
        <span>Account</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="text-[9px] underline disabled:opacity-50"
            disabled={!currentThreadIdForCaps || accountBusy}
            onClick={() => void onRefreshCodexAccount(true)}
          >
            Refresh
          </button>
          <button
            type="button"
            className="text-[9px] underline disabled:opacity-50"
            disabled={!currentThreadIdForCaps || accountBusy}
            onClick={() => void onStartDeviceCodeLogin()}
          >
            Login
          </button>
          <button
            type="button"
            className="text-[9px] underline disabled:opacity-50"
            disabled={!currentThreadIdForCaps || accountBusy || ! (accountLogin as any)?.loginId}
            onClick={() => void onCancelDeviceCodeLogin()}
          >
            Cancel
          </button>
          <button
            type="button"
            className="text-[9px] underline disabled:opacity-50"
            disabled={!currentThreadIdForCaps || accountBusy}
            onClick={() => void onLogoutCodex()}
          >
            Logout
          </button>
        </div>
      </div>
      <div className="mb-1 grid grid-cols-1 gap-1 md:grid-cols-2">
        {showAdvancedLoginParams ? (
          <textarea
            className="min-h-12 w-full resize-y rounded border bg-background px-2 py-1 font-mono text-[10px]"
            placeholder="Account login params JSON"
            value={accountLoginParamsJson}
            onChange={(event) =>
              onSetAccountLoginParamsJson(event.target.value)
            }
          />
        ) : (
          <Input
            className="h-6 px-2 text-[10px]"
            placeholder="Account login type"
            value={parsedLoginType}
            onChange={(event) => onSetLoginType(event.target.value)}
          />
        )}
        {showAdvancedUsageParams ? (
          <textarea
            className="min-h-12 w-full resize-y rounded border bg-background px-2 py-1 font-mono text-[10px]"
            placeholder="Account usage params JSON"
            value={accountUsageParamsJson}
            onChange={(event) =>
              onSetAccountUsageParamsJson(event.target.value)
            }
          />
        ) : (
          <Input
            className="h-6 px-2 text-[10px]"
            placeholder="Usage range days"
            value={parsedRangeDays}
            onChange={(event) => onSetUsageRangeDays(event.target.value)}
          />
        )}
      </div>
      <div className="mb-1 flex gap-2">
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={accountBusy}
          onClick={() =>
            setShowAdvancedLoginParams((previous) => !previous)
          }
        >
          {showAdvancedLoginParams ? 'Use structured login' : 'Advanced login JSON'}
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={accountBusy}
          onClick={() =>
            setShowAdvancedUsageParams((previous) => !previous)
          }
        >
          {showAdvancedUsageParams ? 'Use structured usage' : 'Advanced usage JSON'}
        </button>
      </div>
      <Input
        className="mb-1 h-6 px-2 text-[10px]"
        placeholder="Credits nudge type"
        value={accountCreditsNudgeType}
        onChange={(event) => onSetAccountCreditsNudgeType(event.target.value)}
      />
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
        <span className="text-muted-foreground">Required</span>
        <span>{String(resolvedRequiresAuth ?? 'unknown')}</span>
        <span className="text-muted-foreground">Mode</span>
        <span>{String(resolvedAccountType)}</span>
        <span className="text-muted-foreground">Email</span>
        <span className="truncate">{resolvedAccountEmail ?? '—'}</span>
        <span className="text-muted-foreground">Plan</span>
        <span>{resolvedAccountPlan ?? '—'}</span>
      </div>
      {(accountLogin as any)?.verificationUrl || (accountLogin as any)?.userCode ? (
        <div className="mt-1 rounded border border-border/60 p-1">
          <div className="truncate" title={(accountLogin as any).verificationUrl}>
            {(accountLogin as any).verificationUrl}
          </div>
          <div className="font-mono">{(accountLogin as any).userCode ?? '—'}</div>
        </div>
      ) : null}
      <div className="mt-1 flex gap-2">
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!currentThreadIdForCaps || accountBusy}
          onClick={async () => {
            if (!currentThreadIdForCaps) return
            onSetAccountBusy(true)
            onSetCapError(null)
            try {
              const params = parseCodexJson<unknown>(
                accountUsageParamsJson,
                null
              )
              if (!isPlainObject(params)) {
                throw new Error('Account usage params must be a JSON object.')
              }
              const [rateLimitSnapshot, usageSnapshot] =
              await Promise.all([
                onReadCodexAccountRateLimits(currentThreadIdForCaps).catch(
                  (e) => ({ error: String(e) })
                ),
                onReadCodexAccountUsage(currentThreadIdForCaps, params).catch((e) => ({
                  error: String(e),
                })),
              ])
              onSetAccountRateLimits(rateLimitSnapshot)
              onSetAccountUsage(usageSnapshot)
            } catch (e) {
              onSetCapError('Read limits/usage failed: ' + String(e))
            } finally {
              onSetAccountBusy(false)
            }
          }}
        >
          Read limits/usage
        </button>
        <button
          type="button"
          className="text-[9px] underline disabled:opacity-50"
          disabled={!currentThreadIdForCaps || accountBusy}
          onClick={async () => {
            if (!currentThreadIdForCaps) return
            try {
              const normalizedCreditType =
                accountCreditsNudgeType.trim() === 'credits' ||
                accountCreditsNudgeType.trim() === 'usage_limit'
                  ? (accountCreditsNudgeType.trim() as 'credits' | 'usage_limit')
                  : 'usage_limit'
              await onSendCodexAddCreditsNudgeEmail(
                currentThreadIdForCaps,
                normalizedCreditType
              )
              if (accountCreditsNudgeType.trim() && accountCreditsNudgeType.trim() !== normalizedCreditType) {
                onSetCapError(
                  `Invalid credits nudge type "${accountCreditsNudgeType}". Using "${normalizedCreditType}".`
                )
              }
              toast.success('Credits nudge sent')
            } catch (e) {
              onSetCapError('Credits nudge failed: ' + String(e))
            }
          }}
        >
          Credits nudge
        </button>
      </div>
      <pre className="mt-1 whitespace-pre-wrap break-words max-h-24 overflow-auto">
        {accountRateLimits || accountUsage
          ? JSON.stringify(
              { rateLimits: accountRateLimits, usage: accountUsage },
              null,
              2
            )
          : '— (refresh to load)'}
      </pre>
    </div>
  )
}
