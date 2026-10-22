// The contributor sign-in of the editor: the shared contributor session (web/shared/contrib/session.ts, the same one the
// Team Creator uses) plus the sign-in gate shown until there is one.

import { useEffect } from 'preact/hooks'
import { prefetchEmbed } from '../../shared/contrib/embed.ts'
import { useContribSession, type ContribSession } from '../../shared/contrib/session.ts'
import type { Lang } from '../../shared/lang.ts'
import type { T } from '../i18n/t.ts'
import { Notice } from './ui.tsx'

export type Session = ContribSession

export function useSession(api: string, t: T, lang: Lang): Session {
  // Start fetching the embed now: the sign-in popup must open synchronously inside the next click, which needs it loaded.
  useEffect(() => prefetchEmbed(api), [api])
  return useContribSession(api, t, lang)
}

export function SignInGate({ session, t }: { session: Session; t: T }) {
  return (
    <div class="contrib-gate">
      <p>{t('signInIntro')}</p>
      {session.signInError && <Notice kind="error">{session.signInError}</Notice>}
      <button type="button" class="contrib-btn contrib-btn--primary" disabled={session.signingIn} onClick={() => void session.signIn()}>
        {session.signingIn ? t('signingIn') : t('signInButton')}
      </button>
    </div>
  )
}
