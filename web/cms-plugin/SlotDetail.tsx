// Detail dialog of an editor row: levels (sliders), Parallel Weapon design, skill tree, passive sidekicks / items and the
// borrowed support role. It edits live (every change goes straight to the editor state); "Close" just dismisses it.

import { useMemo, useState } from 'preact/hooks'
import { CardIcon, Dialog, PwFormIcon, cardLabel } from './common.tsx'
import type { Slot } from './editor-state.ts'
import { MAX_PASSIVES } from './editor-state.ts'
import { EntryPickerPopover, IdPickerPopover } from './EntryGrid.tsx'
import { errorText, pwFormLabel, type T } from './i18n/t.ts'
import { NumSlider } from './NumSlider.tsx'
import { passiveEntries } from './pick.ts'
import type { FieldError, PluginContext } from './plugin-api.ts'
import { passiveKind, type Roster } from './roster.ts'
import type { TeamSlot } from './types.ts'
import { DEFAULT_PW_FORM, PW_FORMS } from './validate.ts'

type Lang = PluginContext['uiLang']

/** Rarities of the sidekicks (the skill-book items have none). */
export const SIDEKICK_RARITIES = [1, 3, 4]

interface Props {
  slot: Slot
  title: string
  idBase: string
  roster: Roster | null | undefined
  lang: Lang
  t: T
  errs: Map<string, FieldError[]> | undefined
  /** The borrowed support is possible in this team. */
  allowsSupport: boolean
  support: boolean
  onPatch(p: Partial<TeamSlot>): void
  onToggleSupport(): void
  onClose(): void
}

export function SlotDetailDialog({ slot, title, idBase, roster, lang, t, errs, allowsSupport, support, onPatch, onToggleSupport, onClose }: Props) {
  const [adding, setAdding] = useState(false)
  const hero = slot.stockId ? roster?.hero(slot.stockId) : undefined
  const treeUnavailable = !!hero && !hero.hasSkillTree
  const errorsOf = (field: string) => errs?.get(field) ?? []
  const fieldErrors = (field: string) =>
    errorsOf(field).length > 0 ? <p class="cms-lah-error">{errorsOf(field).map((e) => errorText(t, e)).join(' ')}</p> : null
  const full = slot.passives.length >= MAX_PASSIVES
  const entries = useMemo(() => (roster ? passiveEntries(roster, { excludeCharacter: hero?.characterId ?? null, exclude: slot.passives }) : []), [roster, hero, slot.passives])
  const slider = (field: 'lv' | 'plv' | 'fans' | 'engrave', label: string, def: number, min: number, max: number, every: number) => (
    <NumSlider id={`${idBase}-${field}`} label={label} value={slot[field]} def={def} min={min} max={max} every={every} t={t} errors={errorsOf(field)} onChange={(v) => onPatch({ [field]: v })} />
  )
  const passivesTitle = t('passivesField', { count: slot.passives.length, max: MAX_PASSIVES })

  return (
    <Dialog title={title} t={t} class="cms-lah-dialog-narrow" onClose={onClose}>
      <div class="cms-lah-detail">
        {errorsOf('').map((e) => (
          <p key={e.code} class="cms-lah-error">
            {errorText(t, e)}
          </p>
        ))}
        {slider('lv', t('lv'), 60, 1, 60, 10)}
        {slider('plv', t('plv'), 0, 0, 100, 10)}

        {slot.plv > 0 && (
          <div class="cms-lah-field cms-lah-pwform-field">
            <label class="cms-lah-label" for={`${idBase}-pwform`}>
              {t('pwForm')}
            </label>
            <div class="cms-lah-pwform-row">
              <PwFormIcon itemId={slot.pwForm ?? DEFAULT_PW_FORM} size="md" title="" />
              <select
                id={`${idBase}-pwform`}
                class="cms-lah-input cms-lah-select"
                value={slot.pwForm ?? DEFAULT_PW_FORM}
                aria-invalid={errorsOf('pwForm').length ? true : undefined}
                onChange={(e) => onPatch({ pwForm: Number(e.currentTarget.value) })}
              >
                {PW_FORMS.map((id) => (
                  <option key={id} value={id}>
                    {pwFormLabel(t, id)}
                  </option>
                ))}
              </select>
            </div>
            {fieldErrors('pwForm')}
          </div>
        )}

        {slider('fans', t('fans'), 0, 0, 1000, 250)}
        {slider('engrave', t('engrave'), 0, 0, 1000, 250)}

        <div class="cms-lah-field">
          <label class={'cms-lah-check' + (treeUnavailable ? ' cms-lah-disabled' : '')} title={treeUnavailable ? t('skillTreeUnavailable') : undefined}>
            <input type="checkbox" checked={slot.skillTree} disabled={treeUnavailable} onChange={(e) => onPatch({ skillTree: e.currentTarget.checked })} />
            <span>{t('skillTreeCheck')}</span>
          </label>
          {treeUnavailable && <p class="cms-lah-muted cms-lah-small">{t('skillTreeUnavailable')}</p>}
          {fieldErrors('skillTree')}
        </div>

        <div class="cms-lah-field cms-lah-passives">
          <div class="cms-lah-label">{passivesTitle}</div>
          {slot.passives.length > 0 && (
            <ul class="cms-lah-chips">
              {slot.passives.map((id) => {
                const kind = passiveKind(roster, id)
                const name = cardLabel(roster, kind, id, lang)
                return (
                  <li key={id} class="cms-lah-selchip">
                    <CardIcon kind={kind} stockId={id} roster={roster} lang={lang} size="md" />
                    <span class="cms-lah-selchip-name">{name}</span>
                    <button
                      type="button"
                      class="cms-lah-btn cms-lah-btn-icon"
                      aria-label={t('removeItem', { name })}
                      title={t('removeItem', { name })}
                      onClick={() => onPatch({ passives: slot.passives.filter((x) => x !== id) })}
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
          <button type="button" class="cms-lah-btn" disabled={full || roster === undefined} onClick={() => setAdding(true)}>
            + {t('passivesPlaceholder')}
          </button>
          {fieldErrors('passives')}
        </div>

        {allowsSupport && (
          <div class="cms-lah-field">
            <label class="cms-lah-check cms-lah-support-radio">
              <input type="checkbox" checked={support} onChange={onToggleSupport} />
              <span>{t('supportSlotRadio')}</span>
            </label>
            <p class="cms-lah-muted cms-lah-small">{t('supportHelpOptional')}</p>
          </div>
        )}
      </div>

      {adding && roster && (
        <EntryPickerPopover
          roster={roster}
          entries={entries}
          rarities={SIDEKICK_RARITIES}
          selectedId={null}
          lang={lang}
          t={t}
          title={passivesTitle}
          onSelect={(e) => {
            setAdding(false)
            onPatch({ passives: [...slot.passives, e.id] })
          }}
          onClose={() => setAdding(false)}
        />
      )}
      {adding && roster === null && (
        <IdPickerPopover
          t={t}
          title={passivesTitle}
          onSelect={(id) => {
            setAdding(false)
            onPatch({ passives: [...slot.passives, id] })
          }}
          onClose={() => setAdding(false)}
        />
      )}
    </Dialog>
  )
}
