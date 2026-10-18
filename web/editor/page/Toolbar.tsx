// The page editor's toolbar: character link and item pickers, a collapsible block and section templates.

import { useState } from 'preact/hooks'
import type { T } from '../i18n/t.ts'
import type { EditorDataView } from './editor-data.ts'
import { charaLinkText, detailsBlock, itemText, searchBy, type SectionKind } from './insert.ts'

type Panel = null | 'chara' | 'item' | 'details' | 'section'

export function Toolbar({ t, data, dataFailed, onInsert, onSection }: { t: T; data: EditorDataView | null; dataFailed: boolean; onInsert: (text: string) => void; onSection: (kind: SectionKind) => void }) {
  const [panel, setPanel] = useState<Panel>(null)
  const toggle = (p: Exclude<Panel, null>) => setPanel((cur) => (cur === p ? null : p))
  const done = (text: string | null) => {
    if (text) onInsert(text)
    setPanel(null)
  }

  return (
    <div class="contrib-toolbar">
      <div class="contrib-toolbar__buttons" role="toolbar">
        <button type="button" class="contrib-btn contrib-btn--small" aria-expanded={panel === 'chara'} onClick={() => toggle('chara')}>
          {t('insertChara')}
        </button>
        <button type="button" class="contrib-btn contrib-btn--small" aria-expanded={panel === 'item'} onClick={() => toggle('item')}>
          {t('insertItem')}
        </button>
        <button type="button" class="contrib-btn contrib-btn--small" aria-expanded={panel === 'details'} onClick={() => toggle('details')}>
          {t('insertDetails')}
        </button>
        <button type="button" class="contrib-btn contrib-btn--small" aria-expanded={panel === 'section'} onClick={() => toggle('section')}>
          {t('insertSection')}
        </button>
      </div>
      {panel === 'chara' && <CharaPanel t={t} data={data} failed={dataFailed} onDone={done} />}
      {panel === 'item' && <ItemPanel t={t} data={data} onDone={done} />}
      {panel === 'details' && <DetailsPanel t={t} onDone={done} />}
      {panel === 'section' && (
        <div class="contrib-panel">
          {(['usage', 'notes', 'blank'] as const).map((k) => (
            <button
              key={k}
              type="button"
              class="contrib-btn contrib-btn--small"
              onClick={() => {
                onSection(k)
                setPanel(null)
              }}
            >
              {k === 'usage' ? t('sectionUsage') : k === 'notes' ? t('sectionNotes') : t('sectionCustom')}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function CharaPanel({ t, data, failed, onDone }: { t: T; data: EditorDataView | null; failed: boolean; onDone: (text: string | null) => void }) {
  const [q, setQ] = useState('')
  const [variant, setVariant] = useState<'' | 'h1' | 's1'>('')
  const results = data ? searchBy(data.charas, q, (c) => c.title) : []
  return (
    <div class="contrib-panel">
      <label for="contrib-chara-q">{t('charaPickerLabel')}</label>
      <input id="contrib-chara-q" type="search" autocomplete="off" placeholder={t('charaSearch')} value={q} onInput={(e) => setQ((e.currentTarget as HTMLInputElement).value)} />
      <label for="contrib-chara-variant">{t('charaVariant')}</label>
      <select id="contrib-chara-variant" value={variant} onChange={(e) => setVariant((e.currentTarget as HTMLSelectElement).value as '' | 'h1' | 's1')}>
        <option value="">{t('charaDefault')}</option>
        <option value="h1">{t('charaHero')}</option>
        <option value="s1">{t('charaSidekick')}</option>
      </select>
      {failed && <p class="contrib-field-error">{t('charaDataFailed')}</p>}
      {!data && !failed && <p class="contrib-help">{t('loading')}</p>}
      <ul class="contrib-results">
        {results.map((c) => {
          const text = charaLinkText(c.title, variant)
          return (
            <li key={c.title}>
              <button type="button" class="contrib-result" disabled={!text} onClick={() => onDone(text)}>
                {c.title}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function ItemPanel({ t, data, onDone }: { t: T; data: EditorDataView | null; onDone: (text: string | null) => void }) {
  const [q, setQ] = useState('')
  const [icon, setIcon] = useState(false)
  const idOnly = /^\d+$/.test(q.trim()) ? Number(q.trim()) : null
  const results = data ? searchBy(data.items, q, (i) => `${i.name} ${i.id}`) : []
  return (
    <div class="contrib-panel">
      <label for="contrib-item-q">{t('itemIdLabel')}</label>
      <input id="contrib-item-q" type="search" autocomplete="off" placeholder={t('itemSearch')} value={q} onInput={(e) => setQ((e.currentTarget as HTMLInputElement).value)} />
      <label class="contrib-check">
        <input type="checkbox" checked={icon} onChange={(e) => setIcon((e.currentTarget as HTMLInputElement).checked)} /> {t('itemIconOnly')}
      </label>
      {idOnly !== null && (
        <button type="button" class="contrib-btn contrib-btn--small" onClick={() => onDone(itemText(idOnly, icon))}>
          {t('insertButton')} #{idOnly}
        </button>
      )}
      <ul class="contrib-results">
        {results.map((i) => (
          <li key={i.id}>
            <button type="button" class="contrib-result" onClick={() => onDone(itemText(i.id, icon))}>
              {i.name} <span class="contrib-result__id">#{i.id}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function DetailsPanel({ t, onDone }: { t: T; onDone: (text: string | null) => void }) {
  const [title, setTitle] = useState('Details')
  return (
    <div class="contrib-panel">
      <label for="contrib-details-title">{t('detailsSummary')}</label>
      <input id="contrib-details-title" type="text" value={title} onInput={(e) => setTitle((e.currentTarget as HTMLInputElement).value)} />
      <button type="button" class="contrib-btn contrib-btn--small" disabled={!title.trim()} onClick={() => onDone(detailsBlock(title, 'Text'))}>
        {t('insertButton')}
      </button>
    </div>
  )
}
