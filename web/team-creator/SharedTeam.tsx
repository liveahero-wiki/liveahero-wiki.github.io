// The team of a `?team=` link, shown read-only above the list. The link is untrusted, so it is decoded and then run
// through the same validator as a submission (against the live roster and the group's options); anything wrong
// shows a message instead of a card.

import { useMemo } from 'preact/hooks'
import { makeT } from '../cms-plugin/i18n/t.ts'
import type { PluginContext } from '../cms-plugin/plugin-api.ts'
import { useRoster } from '../cms-plugin/common.tsx'
import { TeamDetail } from '../cms-plugin/TeamDetail.tsx'
import type { TeamPayload } from '../cms-plugin/types.ts'
import { validateTeamPayload } from '../cms-plugin/validate.ts'
import { decodeTeam } from './share.ts'

export function SharedTeam({ param, ctx, onEditCopy }: { param: string; ctx: PluginContext; onEditCopy(team: TeamPayload): void }) {
  const t = useMemo(() => makeT(ctx.uiLang), [ctx.uiLang])
  const decoded = useMemo(() => decodeTeam(param), [param])
  const roster = useRoster(decoded.ok)

  const checked = useMemo(() => (decoded.ok && roster ? validateTeamPayload(decoded.value, { options: ctx.group.options }, { roster }) : null), [decoded, roster, ctx.group.options])

  if (!decoded.ok || (checked && !checked.ok)) {
    return (
      <div class="lah-tc-shared lah-tc-status" role="alert">
        <p>{!decoded.ok && decoded.reason === 'version' ? t('tcSharedNewer') : t('tcSharedInvalid')}</p>
      </div>
    )
  }
  if (roster === null) {
    return (
      <div class="lah-tc-shared lah-tc-status" role="alert">
        <p>{t('tcSharedRosterError')}</p>
      </div>
    )
  }
  if (!checked?.ok) return <p class="lah-tc-shared lah-tc-hint">{t('tcSharedChecking')}</p>

  return (
    <section class="lah-tc-shared lah-tc-card" aria-labelledby="lah-tc-shared-title">
      <h2 id="lah-tc-shared-title" class="lah-tc-shared-title">
        {t('tcSharedTitle')}
      </h2>
      <p class="lah-tc-hint">{t('tcSharedNote')}</p>
      <TeamDetail payload={checked.value} ctx={ctx} />
      <div class="lah-tc-meta">
        <button type="button" class="lah-tc-btn" onClick={() => onEditCopy(checked.value)}>
          {t('tcSharedEditCopy')}
        </button>
      </div>
    </section>
  )
}
