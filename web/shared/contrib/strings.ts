// The contributor sign-in strings, in every UI language. Each app spreads them into its own bundle
// (`{ ...contribStrings.en, … }`), so `t('signInFailed')` works everywhere. Pure, so node --test can import it.

import type { Lang } from '../lang.ts'
import { MIN_ACCOUNT_AGE_DAYS } from './embed.ts'

const en = {
  signIn: 'Sign in',
  signOut: 'Sign out',
  signedInAs: 'Signed in as {name}',
  popupBlocked: 'The sign-in window was blocked by your browser. Allow pop-ups for this site and try again.',
  signInClosed: 'The sign-in window was closed before finishing.',
  tooYoung: 'Your Discord account must be at least {days} days old to contribute. You can sign in again from {date}.',
  tooYoungNoDate: 'Your Discord account must be at least {days} days old to contribute.',
  signInFailed: 'Signing in failed. Please try again.',
}

export type ContribKey = keyof typeof en
type ContribBundle = Record<ContribKey, string>

export const contribStrings: Record<Lang, ContribBundle> = {
  en,
  ja: {
    signIn: 'サインイン',
    signOut: 'サインアウト',
    signedInAs: '{name} としてサインイン中',
    popupBlocked: 'サインインのウィンドウがブラウザにブロックされました。このサイトのポップアップを許可してもう一度お試しください。',
    signInClosed: 'サインインが完了する前にウィンドウが閉じられました。',
    tooYoung: '投稿するにはDiscordアカウントの作成から{days}日以上経っている必要があります。{date}以降にもう一度サインインできます。',
    tooYoungNoDate: '投稿するにはDiscordアカウントの作成から{days}日以上経っている必要があります。',
    signInFailed: 'サインインに失敗しました。もう一度お試しください。',
  },
  'zh-Hans': {
    signIn: '登录',
    signOut: '退出登录',
    signedInAs: '已登录：{name}',
    popupBlocked: '登录窗口被浏览器拦截。请允许此网站弹出窗口后重试。',
    signInClosed: '登录窗口在完成前被关闭。',
    tooYoung: '你的 Discord 账号注册需满{days}天后才能投稿。你可以从{date}起再次登录。',
    tooYoungNoDate: '你的 Discord 账号注册需满{days}天后才能投稿。',
    signInFailed: '登录失败，请重试。',
  },
  'zh-Hant': {
    signIn: '登入',
    signOut: '登出',
    signedInAs: '已登入：{name}',
    popupBlocked: '登入視窗被瀏覽器封鎖。請允許此網站的彈出視窗後重試。',
    signInClosed: '登入視窗在完成前被關閉。',
    tooYoung: '你的 Discord 帳號註冊需滿{days}天後才能投稿。你可以從{date}起再次登入。',
    tooYoungNoDate: '你的 Discord 帳號需註冊滿{days}天後才能投稿。',
    signInFailed: '登入失敗，請重試。',
  },
}

interface SignInLike {
  code?: string
  eligibleAt?: number | null
}

/** Localized message for a rejection of `contrib.signIn`. `t` is any app's lookup (its bundle includes `contribStrings`). */
export function signInErrorText(t: (key: ContribKey, params?: Record<string, string | number>) => string, lang: string, e: unknown): string {
  const code = (e as SignInLike | null)?.code
  if (code === 'popup_blocked') return t('popupBlocked')
  if (code === 'closed') return t('signInClosed')
  if (code === 'account_too_young') {
    const at = (e as SignInLike).eligibleAt
    if (!at) return t('tooYoungNoDate', { days: MIN_ACCOUNT_AGE_DAYS })
    return t('tooYoung', { days: MIN_ACCOUNT_AGE_DAYS, date: new Date(at).toLocaleDateString(lang) })
  }
  return t('signInFailed')
}
