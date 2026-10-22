// "My submissions": the signed-in contributor's own teams in every state, including the ones that are not public yet,
// with Edit and Withdraw-edit actions. Edits are reviewed by a moderator; the published version stays up meanwhile.

import { useMemo } from 'preact/hooks'
import type { ContribSubmission } from '../cms-plugin/api-types.ts'
import { makeT } from '../cms-plugin/i18n/t.ts'
import type { PluginContext } from '../cms-plugin/plugin-api.ts'
import { TeamSummary } from '../cms-plugin/TeamSummary.tsx'
import type { Lang } from '../shared/lang.ts'

export function MySubmissions({
  items,
  uiLang,
  ctx,
  busyId,
  onEdit,
  onWithdraw,
}: {
  items: ContribSubmission[]
  uiLang: Lang
  ctx: PluginContext
  busyId: string | null
  onEdit(item: ContribSubmission): void
  onWithdraw(item: ContribSubmission): void
}) {
  const t = useMemo(() => makeT(uiLang), [uiLang])
  if (items.length === 0) return <p class="lah-tc-empty">{t('tcMyEmpty')}</p>
  return (
    <>
      <p class="lah-tc-hint">{t('tcMyNote')}</p>
      <ul class="lah-tc-list lah-tc-mine-list">
        {items.map((item) => (
          <li key={item.id} class="lah-tc-card">
            <h3 class={`lah-tc-card-title${item.title ? '' : ' lah-tc-untitled'}`} lang={item.title ? item.lang : undefined}>
              {item.title || t('tcUntitled')}
            </h3>
            <div class="lah-tc-summary">
              <TeamSummary payload={item.payload} ctx={ctx} hideTarget />
            </div>
            <div class="lah-tc-meta">
              <span class={`lah-tc-chip lah-tc-state-${item.state}`}>{item.state === 'approved' ? t('tcStateApproved') : t('tcStatePending')}</span>
              {item.revision?.state === 'pending' && <span class="lah-tc-chip lah-tc-state-pending">{t('tcEditPending')}</span>}
              {item.revision?.state === 'rejected' && <span class="lah-tc-chip lah-tc-state-rejected">{t('tcEditRejected')}</span>}
              <button type="button" class="lah-tc-btn" disabled={busyId === item.id} onClick={() => onEdit(item)}>
                {t('tcEdit')}
              </button>
              {item.revision?.state === 'pending' && item.state === 'approved' && (
                <button type="button" class="lah-tc-btn" disabled={busyId === item.id} onClick={() => onWithdraw(item)}>
                  {t('tcWithdrawEdit')}
                </button>
              )}
            </div>
            {item.revision?.state === 'rejected' && item.revision.rejectReason && (
              // Moderator text: rendered as plain text.
              <p class="lah-tc-hint">{t('tcRejectReason', { reason: item.revision.rejectReason })}</p>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}
