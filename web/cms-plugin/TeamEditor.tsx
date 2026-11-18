// Team editor: the 5 rows of the game's formation screen, one compact row per slot (hero icon, active sidekick icon and a
// 3-line summary of the levels / fans / seal level / passives). The icons open picker popovers, the summary opens a detail
// dialog, and the handle of a row drags it (Up / Down arrows move it from the keyboard). Rows left empty are skipped, like
// the game does when the battle starts: the emitted payload is the recompacted team. The borrowed support is a team switch
// (optional mode) plus a radio on every row, next to the slot number, that picks the row carrying the role (row 4 by
// default). Emits normalized payloads through onChange.

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks'
import type { FieldError, PluginContext } from './plugin-api.ts'
import { CardIcon, PwFormIcon, cardLabel, useRoster } from './common.tsx'
import * as ed from './editor-state.ts'
import { battleSlots, initState, payloadRows, sortErrors, sortedJson, toPayload, type Slot, type State } from './editor-state.ts'
import { EntryPickerPopover, IdPickerPopover } from './EntryGrid.tsx'
import { makeT, errorText, type T } from './i18n/t.ts'
import { heroEntries, sidekickEntries } from './pick.ts'
import { passiveKind, type Roster } from './roster.ts'
import { SIDEKICK_RARITIES, SlotDetailDialog } from './SlotDetail.tsx'
import type { TeamPayload, TeamSlot } from './types.ts'
import { parseTargets, targetChoices, targetLabel } from './targets.ts'
import { parseFocus, supportMode, validateTeam } from './validate.ts'

export interface EditorBridge {
  validate(): FieldError[]
  setErrors(errors: FieldError[]): void
}

let editorSeq = 0

/** Codes that only matter once the user tried to submit (a fresh editor is legitimately incomplete). */
const QUIET_UNTIL_VALIDATED = new Set(['stock_id_invalid', 'focus_missing'])

const HERO_RARITIES = [1, 3, 4, 5]

const errKey = (e: FieldError) => `${e.path}|${e.code}|${JSON.stringify(e.params ?? {})}`

// ---- component --------------------------------------------------------------------------------------

interface Props {
  init: { value: unknown; onChange(p: TeamPayload): void; errors: FieldError[] }
  ctx: PluginContext
  bridge: EditorBridge
}

export function TeamEditor({ init, ctx, bridge }: Props) {
  const t = makeT(ctx.uiLang)
  const lang = ctx.uiLang
  const options = ctx.group.options
  const mode = supportMode(options)
  const allowsSupport = mode !== 'none'
  const targets = parseTargets(options)
  const focus = parseFocus(options)
  const roster = useRoster()
  const [uid] = useState(() => ++editorSeq)

  const [state, setState] = useState<State>(() => initState(init.value, options))
  const stateRef = useRef(state)
  const rosterRef = useRef<Roster | null | undefined>(roster)
  rosterRef.current = roster
  const [serverErrors, setServerErrors] = useState<FieldError[]>(() => init.errors ?? [])
  const [showAll, setShowAll] = useState(false)
  const [live, setLive] = useState({ text: '', n: 0 })
  const rootRef = useRef<HTMLDivElement>(null)
  const pendingFocus = useRef<{ key: number; what: 'hero' | 'handle' } | null>(null)
  const onChangeRef = useRef(init.onChange)
  onChangeRef.current = init.onChange

  const announce = (text: string) => setLive((l) => ({ text, n: l.n + 1 }))

  const emit = (s: State) => {
    setServerErrors([]) // reported positions are stale after any edit
    onChangeRef.current(toPayload(s, allowsSupport))
  }

  const commit = (next: State, opts: { announce?: string; focus?: typeof pendingFocus.current } = {}) => {
    stateRef.current = next
    pendingFocus.current = opts.focus ?? null
    setState(next)
    if (opts.announce) announce(opts.announce)
    emit(next)
  }

  // Tell the host when normalizing the incoming value (a blank team, defaults) changed it.
  useEffect(() => {
    const payload = toPayload(stateRef.current, allowsSupport)
    if (sortedJson(payload) !== sortedJson(init.value)) onChangeRef.current(payload)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Bridge for the EditorHandle (validate / setErrors).
  bridge.validate = () => {
    setShowAll(true)
    return validateTeam(toPayload(stateRef.current, allowsSupport), options, rosterRef.current ?? undefined)
  }
  bridge.setErrors = (errors) => {
    setServerErrors(errors ?? [])
    if (errors?.length) setShowAll(true)
  }

  // Restore keyboard focus after a move/clear (keyed nodes can be re-inserted).
  useLayoutEffect(() => {
    const p = pendingFocus.current
    if (!p || !rootRef.current) return
    pendingFocus.current = null
    const li = rootRef.current.querySelector(`[data-cms-slot="${p.key}"]`)
    const pick = (w: string) => li?.querySelector<HTMLElement>(`[data-focus="${w}"]:not([disabled])`)
    ;(pick(p.what) ?? pick('hero'))?.focus()
  })

  // ---- actions
  const patch = (key: number, p: Partial<TeamSlot>) => commit(ed.patchSlot(stateRef.current, key, p))
  const setHero = (key: number, id: number) => {
    const r = rosterRef.current
    // A hero without a skill tree cannot need one.
    commit(ed.patchSlot(stateRef.current, key, { stockId: id, ...(r?.hero(id)?.hasSkillTree === false ? { skillTree: false } : {}) }))
  }
  const clearSlot = (key: number) => commit(ed.clearSlot(stateRef.current, key), { announce: t('slotCleared'), focus: { key, what: 'hero' } })
  const moveSlot = (from: number, to: number) => {
    const s = stateRef.current
    const next = ed.moveSlot(s, from, to)
    if (next === s) return
    commit(next, { announce: t('movedTo', { pos: to + 1, total: next.slots.length }), focus: { key: next.slots[to].key, what: 'handle' } })
  }
  const selectTarget = (id: string | null) => commit(ed.selectTarget(stateRef.current, id))
  const setSupportOn = (on: boolean) => commit(ed.setSupportOn(stateRef.current, on))
  const setSupportRow = (key: number) => commit(ed.setSupportRow(stateRef.current, key))

  // ---- drag to reorder: pointer events on the handle, live-reordering as the dragged row crosses its neighbours
  const drag = useRef<{ key: number; grabY: number; lastY: number; dy: number; from: number; li: HTMLElement } | null>(null)
  const [dragKey, setDragKey] = useState<number | null>(null)
  /** Removes the document listeners of a drag in progress (so an unmount mid-drag does not leak them). */
  const dragCleanup = useRef<(() => void) | null>(null)
  useEffect(() => () => dragCleanup.current?.(), [])

  /** Puts the dragged row under the pointer (its natural position moves whenever the rows are reordered). */
  const placeDragged = () => {
    const d = drag.current
    if (!d) return
    const natural = d.li.getBoundingClientRect().top - d.dy
    d.dy = d.lastY - d.grabY - natural
    d.li.style.transform = `translateY(${d.dy}px)`
  }

  const startDrag = (e: PointerEvent, key: number) => {
    if (drag.current || (e.pointerType === 'mouse' && e.button !== 0)) return
    const li = (e.currentTarget as HTMLElement).closest<HTMLElement>('[data-cms-slot]')
    if (!li) return
    e.preventDefault()
    const from = stateRef.current.slots.findIndex((x) => x.key === key)
    drag.current = { key, grabY: e.clientY - li.getBoundingClientRect().top, lastY: e.clientY, dy: 0, from, li }
    setDragKey(key)

    const move = (ev: PointerEvent) => {
      const d = drag.current
      if (!d) return
      d.lastY = ev.clientY
      placeDragged()
      // The row goes where its centre is: after every other row whose centre is above it.
      const rect = d.li.getBoundingClientRect()
      const centre = rect.top + rect.height / 2
      const others = [...(rootRef.current?.querySelectorAll<HTMLElement>('[data-cms-slot]') ?? [])].filter((x) => x !== d.li)
      const to = others.filter((x) => {
        const r = x.getBoundingClientRect()
        return r.top + r.height / 2 < centre
      }).length
      const s = stateRef.current
      const at = s.slots.findIndex((x) => x.key === d.key)
      if (to !== at) {
        // Live reorder only: the host hears about the final order once, when the drag ends.
        const next = ed.moveSlot(s, at, to)
        stateRef.current = next
        setState(next)
      }
    }
    const removeListeners = () => {
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerup', end)
      document.removeEventListener('pointercancel', end)
      dragCleanup.current = null
    }
    const end = () => {
      removeListeners()
      const d = drag.current
      drag.current = null
      if (!d) return
      d.li.style.transform = ''
      const at = stateRef.current.slots.findIndex((x) => x.key === d.key)
      pendingFocus.current = { key: d.key, what: 'handle' }
      if (at !== d.from) {
        announce(t('movedTo', { pos: at + 1, total: stateRef.current.slots.length }))
        emit(stateRef.current)
      }
      setDragKey(null)
    }
    document.addEventListener('pointermove', move)
    document.addEventListener('pointerup', end)
    document.addEventListener('pointercancel', end)
    dragCleanup.current = () => {
      removeListeners()
      drag.current = null
    }
  }

  // A reorder moves the dragged row in the list: keep it under the pointer.
  useLayoutEffect(placeDragged, [state.slots])

  // ---- errors
  const payload = toPayload(state, allowsSupport)
  const clientErrors = validateTeam(payload, options, roster ?? undefined).filter((e) => showAll || !QUIET_UNTIL_VALIDATED.has(e.code))
  const seen = new Set<string>()
  const errors = [...serverErrors, ...clientErrors].filter((e) => !seen.has(errKey(e)) && !!seen.add(errKey(e)))
  const rows = payloadRows(state)
  const numbers = battleSlots(state)
  const sorted = sortErrors(errors, rows)

  const supportName = `cms-lah-${uid}-support`
  const focusName = focus ? cardLabel(roster, focus.kind, focus.stockId, lang) : ''

  return (
    <div class="cms-lah cms-lah-editor" ref={rootRef}>
      {focus && <p class="cms-lah-hint cms-lah-hint-focus">{t(focus.kind === 'hero' ? 'focusHero' : 'focusSidekick', { name: focusName })}</p>}
      {targets.length > 0 && (
        <div class="cms-lah-field cms-lah-target-field">
          <label class="cms-lah-label" for={`cms-lah-${uid}-target`}>
            {t('targetField')}
          </label>
          <select
            id={`cms-lah-${uid}-target`}
            class="cms-lah-input cms-lah-select"
            value={state.target ?? ''}
            aria-invalid={sorted.target.length ? true : undefined}
            aria-describedby={sorted.target.length ? `cms-lah-${uid}-target-err` : `cms-lah-${uid}-target-help`}
            onChange={(e) => selectTarget(e.currentTarget.value || null)}
          >
            <option value="">{t('targetGeneral')}</option>
            {targetChoices(targets, state.target).map((tg) => (
              <option key={tg.id} value={tg.id}>
                {tg.retired ? t('targetRetiredOption', { name: targetLabel(tg, lang) }) : targetLabel(tg, lang)}
              </option>
            ))}
          </select>
          <p class="cms-lah-muted cms-lah-small" id={`cms-lah-${uid}-target-help`}>
            {t('targetHelp')}
          </p>
          {sorted.target.length > 0 && (
            <p class="cms-lah-error" id={`cms-lah-${uid}-target-err`}>
              {sorted.target.map((e) => errorText(t, e)).join(' ')}
            </p>
          )}
        </div>
      )}
      {roster === undefined && <p class="cms-lah-hint">{t('rosterLoading')}</p>}
      {roster === null && <p class="cms-lah-hint cms-lah-hint-warn">{t('rosterFailed')}</p>}

      {allowsSupport && (
        <div class="cms-lah-field cms-lah-support-field">
          {mode === 'optional' ? (
            <label class="cms-lah-check">
              <input type="checkbox" checked={state.supportOn} onChange={(e) => setSupportOn(e.currentTarget.checked)} />
              <span class="cms-lah-support-switch">{t('supportToggle')}</span>
            </label>
          ) : (
            <div class="cms-lah-label">{t('supportToggle')}</div>
          )}
          <p class="cms-lah-muted cms-lah-small">{t(mode === 'optional' ? 'supportHelpOptional' : 'supportHelpRequired')}</p>
        </div>
      )}

      <div class="cms-lah-team-errors" aria-live="polite">
        {[...sorted.team, ...sorted.support].map((e) => (
          <p key={errKey(e)} class="cms-lah-error">
            {errorText(t, e)}
          </p>
        ))}
      </div>

      <ol class="cms-lah-slots-editor" aria-label={t('slotsHeading')}>
        {state.slots.map((slot, i) => (
          <SlotEditor
            key={slot.key}
            slot={slot}
            index={i}
            pos={numbers[i]}
            idBase={`cms-lah-${uid}-${slot.key}`}
            supportName={allowsSupport && state.supportOn ? supportName : null}
            support={allowsSupport && state.supportOn && state.supportKey === slot.key}
            dragging={dragKey === slot.key}
            roster={roster}
            lang={lang}
            t={t}
            errs={sorted.slots.get(i)}
            onHero={(id) => setHero(slot.key, id)}
            onPatch={(p) => patch(slot.key, p)}
            onSupport={() => setSupportRow(slot.key)}
            onClear={() => clearSlot(slot.key)}
            onDragStart={(e) => startDrag(e, slot.key)}
            onNudge={(dir) => moveSlot(i, i + dir)}
          />
        ))}
      </ol>

      <div class="cms-lah-sr" aria-live="polite" aria-atomic="true">
        {live.text}
        {live.n % 2 ? '​' : ''}
      </div>
    </div>
  )
}

// ---- one slot ---------------------------------------------------------------------------------------

type Overlay = null | 'hero' | 'active' | 'detail'

interface SlotProps {
  slot: Slot
  /** Row (0-based). */
  index: number
  /** Battle slot (1-based) the row takes once the empty rows are skipped; null for a skipped row. */
  pos: number | null
  idBase: string
  /** Name of the radio group choosing the support row; null when the team has no support (no radios). */
  supportName: string | null
  /** This row carries the support role. */
  support: boolean
  dragging: boolean
  roster: Roster | null | undefined
  lang: PluginContext['uiLang']
  t: T
  errs: Map<string, FieldError[]> | undefined
  onHero(id: number): void
  onPatch(p: Partial<TeamSlot>): void
  /** The support radio of this row was chosen. */
  onSupport(): void
  onClear(): void
  onDragStart(e: PointerEvent): void
  /** Up / Down arrow on the handle. */
  onNudge(dir: -1 | 1): void
}

function SlotEditor({ slot, index, pos, idBase, supportName, support, dragging, roster, lang, t, errs, onHero, onPatch, onSupport, onClear, onDragStart, onNudge }: SlotProps) {
  const [open, setOpen] = useState<Overlay>(null)
  const filled = slot.stockId !== 0
  const hero = filled ? roster?.hero(slot.stockId) : undefined
  const heroName = filled ? cardLabel(roster, 'hero', slot.stockId, lang) : t('heroNone')
  const activeName = slot.active !== null ? cardLabel(roster, 'sidekick', slot.active, lang) : t('activeNone')
  const close = () => setOpen(null)

  const allErrors = errs ? [...errs.values()].flat() : []
  const hasErr = (field: string) => (errs?.get(field) ?? []).length > 0
  const detailErr = [...(errs?.entries() ?? [])].some(([field, list]) => list.length > 0 && !['', 'stockId', 'active'].includes(field))
  const summary = `${t('lv')} ${slot.lv}, ${t('plv')} ${slot.plv}, ${t('fans')} ${slot.fans}, ${t('engrave')} ${slot.engrave}`

  const heroEntriesAll = useMemo(() => (roster ? heroEntries(roster) : []), [roster])
  const activeEntries = useMemo(() => (roster ? sidekickEntries(roster, { excludeCharacter: hero?.characterId ?? null, exclude: [slot.stockId] }) : []), [roster, hero, slot.stockId])

  return (
    <li class={'cms-lah-card cms-lah-slot' + (support ? ' cms-lah-support' : '') + (dragging ? ' cms-lah-slot-dragging' : '')} data-cms-slot={slot.key}>
      <div class="cms-lah-slot-row">
        <div class="cms-lah-slot-no">
          <span aria-label={t('slotN', { n: pos ?? index + 1 })}>{pos ? t('slotN', { n: pos }) : '–'}</span>
          {supportName !== null && (
            <label class="cms-lah-support-pick" title={t('supportTitle')}>
              <input type="radio" name={supportName} checked={support} aria-label={t('supportRadio', { n: pos ?? index + 1 })} onChange={onSupport} />
              <span>{t('support')}</span>
            </label>
          )}
        </div>

        <div class="cms-lah-slot-main">
          <div class="cms-lah-herocol">
            <button
              type="button"
              class="cms-lah-slotbtn"
              data-focus="hero"
              disabled={roster === undefined}
              aria-haspopup="dialog"
              aria-label={`${t('heroField')}: ${heroName}`}
              aria-invalid={hasErr('stockId') ? true : undefined}
              onClick={() => setOpen('hero')}
            >
              {filled ? <CardIcon kind="hero" stockId={slot.stockId} roster={roster} lang={lang} size="lg" /> : <span class="cms-lah-icon cms-lah-icon-lg cms-lah-icon-empty" aria-hidden="true">+</span>}
            </button>
            {filled && slot.skillTree && <span class="cms-lah-badge">{t('badgeSkillTree')}</span>}
          </div>

          <button
            type="button"
            class="cms-lah-slotbtn cms-lah-slotbtn-sk"
            data-focus="active"
            disabled={roster === undefined || !filled}
            title={filled ? undefined : t('pickHeroFirst')}
            aria-haspopup="dialog"
            aria-label={`${t('activeField')}: ${activeName}`}
            aria-invalid={hasErr('active') ? true : undefined}
            onClick={() => setOpen('active')}
          >
            {slot.active !== null ? <CardIcon kind="sidekick" stockId={slot.active} roster={roster} lang={lang} size="lg" /> : <span class="cms-lah-icon cms-lah-icon-lg cms-lah-icon-empty" aria-hidden="true">+</span>}
          </button>

          {filled ? (
            <button type="button" class={'cms-lah-params' + (detailErr ? ' cms-lah-params-err' : '')} aria-haspopup="dialog" aria-label={`${t('editDetails', { n: pos ?? index + 1 })}: ${summary}`} onClick={() => setOpen('detail')}>
              <span class="cms-lah-prow">
                <span class="cms-lah-param">
                  {t('lv')} {slot.lv}
                </span>
                {slot.plv > 0 && <PwFormIcon itemId={slot.pwForm ?? 60} size="sm" title="" />}
                <span class="cms-lah-param">
                  {t('plv')} {slot.plv}
                </span>
              </span>
              <span class="cms-lah-pbody">
                <span class="cms-lah-pcol">
                  <span class="cms-lah-param">
                    {t('fans')} {slot.fans}
                  </span>
                  <span class="cms-lah-param">
                    {t('engrave')} {slot.engrave}
                  </span>
                </span>
                <span class="cms-lah-pslots" aria-hidden="true">
                  {[0, 1, 2].map((i) => {
                    const id = slot.passives[i]
                    return id !== undefined ? (
                      <CardIcon key={i} kind={passiveKind(roster, id)} stockId={id} roster={roster} lang={lang} size="md" />
                    ) : (
                      <span key={i} class="cms-lah-pslot" />
                    )
                  })}
                </span>
              </span>
            </button>
          ) : (
            // An empty row keeps its place; the support row says what it is waiting for.
            <span class="cms-lah-params cms-lah-params-empty" aria-hidden={support ? undefined : true}>
              {support && <span class="cms-lah-muted">{t('supportPickHero')}</span>}
            </span>
          )}
        </div>

        <button
          type="button"
          class="cms-lah-handle"
          data-focus="handle"
          aria-label={t('dragHandle', { n: pos ?? index + 1 })}
          title={t('dragHandle', { n: pos ?? index + 1 })}
          onPointerDown={(e) => onDragStart(e)}
          onKeyDown={(e) => {
            if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
            e.preventDefault()
            onNudge(e.key === 'ArrowUp' ? -1 : 1)
          }}
        >
          <span aria-hidden="true">⠿</span>
        </button>
      </div>

      {allErrors.map((e, i) => (
        <p key={`${e.path}|${e.code}|${i}`} class="cms-lah-error">
          {errorText(t, e)}
        </p>
      ))}

      {open === 'hero' && roster === null && (
        <IdPickerPopover
          t={t}
          title={t('heroField')}
          onSelect={(id) => {
            close()
            onHero(id)
          }}
          onClear={filled ? () => (close(), onClear()) : undefined}
          clearLabel={t('clearSlot')}
          onClose={close}
        />
      )}
      {open === 'hero' && roster && (
        <EntryPickerPopover
          roster={roster}
          entries={heroEntriesAll}
          rarities={HERO_RARITIES}
          elements
          selectedId={slot.stockId || null}
          lang={lang}
          t={t}
          title={t('heroField')}
          onSelect={(e) => {
            close()
            onHero(e.id)
          }}
          clearLabel={t('clearSlot')}
          onClear={
            filled
              ? () => {
                  close()
                  onClear()
                }
              : undefined
          }
          onClose={close}
        />
      )}
      {open === 'active' && roster === null && (
        <IdPickerPopover
          t={t}
          title={t('activeField')}
          onSelect={(id) => {
            close()
            onPatch({ active: id })
          }}
          onClear={slot.active !== null ? () => (close(), onPatch({ active: null })) : undefined}
          clearLabel={t('activeNone')}
          onClose={close}
        />
      )}
      {open === 'active' && roster && (
        <EntryPickerPopover
          roster={roster}
          entries={activeEntries}
          rarities={SIDEKICK_RARITIES}
          selectedId={slot.active}
          lang={lang}
          t={t}
          title={t('activeField')}
          onSelect={(e) => {
            close()
            onPatch({ active: e.id })
          }}
          clearLabel={t('activeNone')}
          onClear={
            slot.active !== null
              ? () => {
                  close()
                  onPatch({ active: null })
                }
              : undefined
          }
          onClose={close}
        />
      )}
      {open === 'detail' && (
        <SlotDetailDialog
          slot={slot}
          title={`${t('slotN', { n: pos ?? index + 1 })}: ${heroName}`}
          idBase={idBase}
          roster={roster}
          lang={lang}
          t={t}
          errs={errs}
          onPatch={onPatch}
          onClose={close}
        />
      )}
    </li>
  )
}
