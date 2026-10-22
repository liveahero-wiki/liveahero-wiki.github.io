// "My contributions": the signed-in contributor's own submissions of the three editor types, with what happened to each.

import { useEffect, useState } from 'preact/hooks'
import { getContrib } from '../../shared/contrib/embed.ts'
import type { T } from '../i18n/t.ts'
import { rowsOf, type ContribSubmission, type MineRow } from './mine.ts'
import { TYPES } from './submit.ts'
import { Modal, Notice } from './ui.tsx'

export function MyContributions({ api, t, lang, onClose }: { api: string; t: T; lang: string; onClose: () => void }) {
  const [rows, setRows] = useState<MineRow[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let dead = false
    getContrib(api)
      .then((c) => Promise.all(TYPES.map((type) => c.mine(type, api))))
      .then(
        (lists: ContribSubmission[][]) => !dead && setRows(rowsOf(t, lists)),
        () => !dead && setFailed(true),
      )
    return () => {
      dead = true
    }
  }, [api, t])

  return (
    <Modal title={t('mineTitle')} t={t} onRequestClose={onClose}>
      {failed ? (
        <Notice kind="error">{t('mineError')}</Notice>
      ) : rows === null ? (
        <p>{t('loading')}</p>
      ) : rows.length === 0 ? (
        <p>{t('mineEmpty')}</p>
      ) : (
        <ul class="contrib-mine">
          {rows.map((r) => (
            <li key={r.id}>
              <div class="contrib-mine__title">{r.title}</div>
              <div class="contrib-mine__meta">
                <time dateTime={new Date(r.createdAt).toISOString()}>{new Date(r.createdAt).toLocaleDateString(lang)}</time>
                <span class="contrib-mine__status">{r.status}</span>
                {r.url && (
                  <a href={r.url} target="_blank" rel="noopener noreferrer">
                    {t('outcomeLink')}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
