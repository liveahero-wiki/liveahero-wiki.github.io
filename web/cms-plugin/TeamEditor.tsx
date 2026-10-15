// Team editor: 1-5 slots reordered by pointer drag (mouse/touch) or by move up/down buttons, a hero
// combobox, number inputs, a skill-tree checkbox (bloom is derived), active + passive sidekick pickers, and (when
// the group allows it) a "borrowed support" radio. Emits normalized payloads through onChange.

import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks'
import type { FieldError, PluginContext } from './plugin-api.ts'
import { cardLabel, PwFormIcon, useRoster } from './common.tsx'
import { startDrag } from './dnd.ts'
import { makeT, errorText, pwFormLabel, type T } from './i18n/t.ts'
import { CardPicker, PassivePicker } from './pickers.tsx'
import type { Roster } from './roster.ts'
import type { Focus, TeamPayload, TeamSlot } from './types.ts'
import { parseTargets, targetChoices, targetLabel } from './targets.ts'
import { DEFAULT_PW_FORM, MAX_SLOTS, PW_FORMS, parseFocus, supportMode, validateTeam } from './validate.ts'
import * as ed from './editor-state.ts'
import { sortErrors, sortedJson, toPayload, initState, type Slot, type State } from './editor-state.ts'

export interface EditorBridge {
  validate(): FieldError[]
  setErrors(errors: FieldError[]): void
  abortDrag(): void
}

let editorSeq = 0

/** Codes that only matter once the user tried to submit (a fresh editor is legitimately incomplete). */
const QUIET_UNTIL_VALIDATED = new Set(['stock_id_invalid', 'focus_missing'])

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
  /** Only a required support is picked automatically (the last slot); an optional one never is. */
  const autoSupport = mode === 'required'
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
  const listRef = useRef<HTMLOListElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const pendingFocus = useRef<{ key: number; what: 'hero' | 'up' | 'down' | 'remove' } | null>(null)
  const abortDrag = useRef<() => void>(() => {})
  const onChangeRef = useRef(init.onChange)
  onChangeRef.current = init.onChange

  const announce = (text: string) => setLive((l) => ({ text, n: l.n + 1 }))

  const commit = (next: State, opts: { announce?: string; focus?: typeof pendingFocus.current } = {}) => {
    stateRef.current = next
    pendingFocus.current = opts.focus ?? null
    setState(next)
    setServerErrors([]) // reported positions are stale after any edit
    if (opts.announce) announce(opts.announce)
    onChangeRef.current(toPayload(next, allowsSupport))
  }

  // Tell the host when normalizing the incoming value (prefilled hero, auto support) changed it.
  useEffect(() => {
    const payload = toPayload(stateRef.current, allowsSupport)
    if (sortedJson(payload) !== sortedJson(init.value)) onChangeRef.current(payload)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Bridge for the EditorHandle (validate / setErrors / drag cleanup).
  bridge.validate = () => {
    setShowAll(true)
    return validateTeam(toPayload(stateRef.current, allowsSupport), options, rosterRef.current ?? undefined)
  }
  bridge.setErrors = (errors) => {
    setServerErrors(errors ?? [])
    if (errors?.length) setShowAll(true)
  }
  bridge.abortDrag = () => abortDrag.current()

  // Restore keyboard focus after a move/add (keyed nodes can be re-inserted). Layout effect: runs
  // synchronously after the DOM update instead of waiting for an animation frame.
  useLayoutEffect(() => {
    const p = pendingFocus.current
    if (!p || !rootRef.current) return
    pendingFocus.current = null
    const li = rootRef.current.querySelector(`[data-cms-slot="${p.key}"]`)
    const pick = (w: string) => li?.querySelector<HTMLElement>(`[data-focus="${w}"]:not([disabled])`)
    const target = pick(p.what) ?? pick(p.what === 'up' ? 'down' : 'up') ?? pick('hero')
    target?.focus()
  })

  // ---- actions
  const patchSlot = (key: number, patch: Partial<TeamSlot>) => {
    const s = stateRef.current
    commit({ ...s, slots: s.slots.map((x) => (x.key === key ? { ...x, ...patch } : x)) })
  }
  const addSlot = () => {
    const s = stateRef.current
    const next = ed.addSlot(s, autoSupport)
    if (next === s) return
    commit(next, { announce: t('slotAdded', { n: next.slots.length }), focus: { key: next.slots[next.slots.length - 1].key, what: 'hero' } })
  }
  const removeSlot = (key: number) => {
    const s = stateRef.current
    const next = ed.removeSlot(s, key)
    if (next === s) return
    const at = Math.min(s.slots.findIndex((x) => x.key === key), next.slots.length - 1)
    commit(next, { announce: t('slotRemoved'), focus: { key: next.slots[at].key, what: 'hero' } })
  }
  const moveSlot = (from: number, to: number, via: 'drag' | 'up' | 'down') => {
    const s = stateRef.current
    const next = ed.moveSlot(s, from, to)
    if (next === s) return
    commit(next, {
      announce: t('movedTo', { pos: to + 1, total: next.slots.length }),
      focus: via === 'drag' ? null : { key: next.slots[to].key, what: via },
    })
  }
  const selectSupport = (key: number) => commit(ed.selectSupport(stateRef.current, key))
  const clearSupport = () => commit(ed.clearSupport(stateRef.current))
  const selectTarget = (id: string | null) => commit(ed.selectTarget(stateRef.current, id))

  useEffect(() => () => abortDrag.current(), [])

  // ---- errors
  const payload = toPayload(state, allowsSupport)
  const clientErrors = validateTeam(payload, options, roster ?? undefined)
    .filter((e) => showAll || !QUIET_UNTIL_VALIDATED.has(e.code))
    // Several still-empty slots all have stockId 0 and would be reported as duplicates of each other.
    .filter((e) => e.code !== 'duplicate_hero' || !String(e.params?.slots ?? '').split(',').every((n) => state.slots[Number(n) - 1]?.stockId === 0))
  const seen = new Set<string>()
  const errors = [...serverErrors, ...clientErrors].filter((e) => !seen.has(errKey(e)) && !!seen.add(errKey(e)))
  const sorted = sortErrors(errors)

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
      {allowsSupport && <p class="cms-lah-hint">{t(mode === 'optional' ? 'supportHelpOptional' : 'supportHelp')}</p>}
      {mode === 'optional' && (
        <label class="cms-lah-check cms-lah-support-radio cms-lah-support-none">
          <input type="radio" name={`cms-lah-support-${uid}`} checked={state.supportKey === null} onChange={clearSupport} />
          <span>{t('supportNone')}</span>
        </label>
      )}
      {roster === undefined && <p class="cms-lah-hint">{t('rosterLoading')}</p>}
      {roster === null && <p class="cms-lah-hint cms-lah-hint-warn">{t('rosterFailed')}</p>}

      <div class="cms-lah-team-errors" aria-live="polite">
        {[...sorted.team, ...sorted.support].map((e) => (
          <p key={errKey(e)} class="cms-lah-error">
            {errorText(t, e)}
          </p>
        ))}
      </div>

      <ol class="cms-lah-slots-editor" ref={listRef} aria-label={t('slotsHeading')}>
        {state.slots.map((slot, i) => (
          <SlotEditor
            key={slot.key}
            slot={slot}
            index={i}
            total={state.slots.length}
            idBase={`cms-lah-${uid}-${slot.key}`}
            support={allowsSupport && state.supportKey === slot.key}
            allowsSupport={allowsSupport}
            supportName={`cms-lah-support-${uid}`}
            roster={roster}
            lang={lang}
            t={t}
            focus={focus}
            errs={sorted.slots.get(i)}
            onPatch={(p) => patchSlot(slot.key, p)}
            onSupport={() => selectSupport(slot.key)}
            onRemove={() => removeSlot(slot.key)}
            onMove={(dir) => moveSlot(i, i + dir, dir < 0 ? 'up' : 'down')}
            onGrip={(e) => {
              if (e.pointerType === 'mouse' && e.button !== 0) return
              const grip = e.currentTarget as HTMLElement
              const item = grip.closest<HTMLElement>('[data-cms-slot]')
              if (!item || !listRef.current) return
              e.preventDefault()
              abortDrag.current = startDrag(e, { list: listRef.current, item, grip, onDrop: (from, to) => moveSlot(from, to, 'drag') })
            }}
          />
        ))}
      </ol>

      <button type="button" class="cms-lah-btn cms-lah-btn-add" disabled={state.slots.length >= MAX_SLOTS} onClick={addSlot}>
        + {t('addSlot')} ({state.slots.length}/{MAX_SLOTS})
      </button>

      <div class="cms-lah-sr" aria-live="polite" aria-atomic="true">
        {live.text}
        {live.n % 2 ? '​' : ''}
      </div>
    </div>
  )
}

// ---- one slot ---------------------------------------------------------------------------------------

interface SlotProps {
  slot: Slot
  index: number
  total: number
  idBase: string
  support: boolean
  allowsSupport: boolean
  supportName: string
  roster: Roster | null | undefined
  lang: PluginContext['uiLang']
  t: T
  focus: Focus | null
  errs: Map<string, FieldError[]> | undefined
  onPatch(p: Partial<TeamSlot>): void
  onSupport(): void
  onRemove(): void
  onMove(dir: -1 | 1): void
  onGrip(e: PointerEvent): void
}

function SlotEditor({ slot, index, total, idBase, support, allowsSupport, supportName, roster, lang, t, errs, onPatch, onSupport, onRemove, onMove, onGrip }: SlotProps) {
  const n = index + 1
  const hero = slot.stockId ? roster?.hero(slot.stockId) : undefined
  const treeUnavailable = !!hero && !hero.hasSkillTree
  const maxPassives = ed.MAX_PASSIVES

  const errorsOf = (field: string) => errs?.get(field) ?? []
  const fieldErrors = (field: string, id: string) => {
    const list = errorsOf(field)
    return {
      invalid: list.length > 0,
      describedBy: list.length ? id : undefined,
      node: list.length ? (
        <p class="cms-lah-error" id={id}>
          {list.map((e) => errorText(t, e)).join(' ')}
        </p>
      ) : null,
    }
  }
  const heroErr = fieldErrors('stockId', `${idBase}-e-hero`)
  const activeErr = fieldErrors('active', `${idBase}-e-active`)
  const passErr = fieldErrors('passives', `${idBase}-e-passives`)
  const slotErrs = errorsOf('')

  return (
    <li class={'cms-lah-card cms-lah-slot' + (support ? ' cms-lah-support' : '')} data-cms-slot={slot.key}>
      <div class="cms-lah-card-head">
        <span class="cms-lah-grip" aria-hidden="true" title={t('dragSlot', { n })} onPointerDown={onGrip}>
          <svg viewBox="0 0 12 18" width="14" height="20" fill="currentColor" focusable="false">
            <circle cx="3" cy="3" r="1.6" />
            <circle cx="9" cy="3" r="1.6" />
            <circle cx="3" cy="9" r="1.6" />
            <circle cx="9" cy="9" r="1.6" />
            <circle cx="3" cy="15" r="1.6" />
            <circle cx="9" cy="15" r="1.6" />
          </svg>
        </span>
        <span class="cms-lah-slot-no">{t('slotN', { n })}</span>
        {support && (
          <span class="cms-lah-tag" title={t('supportTitle')}>
            {t('support')}
          </span>
        )}
        <span class="cms-lah-spacer" />
        <button type="button" class="cms-lah-btn cms-lah-btn-icon" data-focus="up" disabled={index === 0} aria-label={t('moveUp', { n })} title={t('moveUp', { n })} onClick={() => onMove(-1)}>
          <span aria-hidden="true">▲</span>
        </button>
        <button type="button" class="cms-lah-btn cms-lah-btn-icon" data-focus="down" disabled={index === total - 1} aria-label={t('moveDown', { n })} title={t('moveDown', { n })} onClick={() => onMove(1)}>
          <span aria-hidden="true">▼</span>
        </button>
        <button type="button" class="cms-lah-btn cms-lah-btn-icon cms-lah-btn-danger" data-focus="remove" disabled={total <= 1} aria-label={t('removeSlot', { n })} title={t('removeSlot', { n })} onClick={onRemove}>
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      {slotErrs.map((e) => (
        <p key={e.code} class="cms-lah-error">
          {errorText(t, e)}
        </p>
      ))}

      {allowsSupport && (
        <label class="cms-lah-check cms-lah-support-radio">
          <input type="radio" name={supportName} checked={support} onChange={onSupport} />
          <span>{t('supportSlotRadio')}</span>
        </label>
      )}

      <div class="cms-lah-field">
        <CardPicker kind="hero" dataFocus="hero" roster={roster} value={slot.stockId || null} onChange={(id) => onPatch({ stockId: id ?? 0, ...(id && roster?.hero(id)?.hasSkillTree === false ? { skillTree: false } : {}) })} lang={lang} t={t} label={t('heroField')} placeholder={t('heroPlaceholder')} invalid={heroErr.invalid} describedBy={heroErr.describedBy} />
        {heroErr.node}
      </div>

      <div class="cms-lah-nums">
        <NumField id={`${idBase}-lv`} label={t('lv')} value={slot.lv} def={60} min={1} max={60} t={t} errors={errorsOf('lv')} onChange={(v) => onPatch({ lv: v })} />
        <NumField id={`${idBase}-plv`} label={t('plv')} value={slot.plv} def={0} min={0} max={100} t={t} errors={errorsOf('plv')} onChange={(v) => onPatch({ plv: v })} />
        <NumField id={`${idBase}-fans`} label={t('fans')} value={slot.fans} def={0} min={0} max={1000} t={t} errors={errorsOf('fans')} onChange={(v) => onPatch({ fans: v })} />
        <NumField id={`${idBase}-engrave`} label={t('engrave')} value={slot.engrave} def={0} min={0} max={1000} t={t} errors={errorsOf('engrave')} onChange={(v) => onPatch({ engrave: v })} />
      </div>

      {slot.plv > 0 && (
        <div class="cms-lah-field cms-lah-pwform-field">
          <label class="cms-lah-label" for={`${idBase}-pwform`}>
            {t('pwForm')} <span class="cms-lah-muted cms-lah-small">{t('pwFormRequired')}</span>
          </label>
          <div class="cms-lah-pwform-row">
            <PwFormIcon itemId={slot.pwForm ?? DEFAULT_PW_FORM} size="md" />
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
          {errorsOf('pwForm').map((e) => (
            <p key={e.path + e.code} class="cms-lah-error">
              {errorText(t, e)}
            </p>
          ))}
        </div>
      )}

      <div class="cms-lah-checks">
        <label class={'cms-lah-check' + (treeUnavailable ? ' cms-lah-disabled' : '')} title={treeUnavailable ? t('skillTreeUnavailable') : undefined}>
          <input type="checkbox" checked={slot.skillTree} disabled={treeUnavailable} onChange={(e) => onPatch({ skillTree: e.currentTarget.checked })} />
          <span>{t('skillTreeCheck')}</span>
        </label>
        {treeUnavailable && <span class="cms-lah-muted cms-lah-small">{t('skillTreeUnavailable')}</span>}
      </div>
      {errorsOf('skillTree').map((e) => (
        <p key={e.path + e.code} class="cms-lah-error">
          {errorText(t, e)}
        </p>
      ))}

      <div class="cms-lah-field">
        <CardPicker kind="sidekick" roster={roster} value={slot.active} onChange={(id) => onPatch({ active: id })} exclude={slot.stockId || null} excludeCharacter={hero?.characterId ?? null} clearable lang={lang} t={t} label={t('activeField')} placeholder={t('activePlaceholder')} invalid={activeErr.invalid} describedBy={activeErr.describedBy} />
        {activeErr.node}
      </div>

      <div class="cms-lah-field">
        <PassivePicker roster={roster} values={slot.passives} max={maxPassives} excludeCharacter={hero?.characterId ?? null} onAdd={(id) => onPatch({ passives: [...slot.passives, id] })} onRemove={(id) => onPatch({ passives: slot.passives.filter((x) => x !== id) })} lang={lang} t={t} label={t('passivesField', { count: slot.passives.length, max: maxPassives })} placeholder={t('passivesPlaceholder')} invalid={passErr.invalid} describedBy={passErr.describedBy} />
        {passErr.node}
      </div>
    </li>
  )
}

// ---- number field -----------------------------------------------------------------------------------

interface NumProps {
  id: string
  label: string
  value: number
  def: number
  min: number
  max: number
  t: T
  errors: FieldError[]
  onChange(v: number): void
}

function NumField({ id, label, value, def, min, max, errors, onChange, t }: NumProps) {
  const [draft, setDraft] = useState(String(value))
  const emitted = useRef(value)
  useEffect(() => {
    if (value !== emitted.current) {
      emitted.current = value
      setDraft(String(value))
    }
  }, [value])
  const errId = `${id}-err`
  return (
    <div class="cms-lah-num">
      <label class="cms-lah-label" for={id}>
        {label} <span class="cms-lah-muted cms-lah-small">{t('range', { min, max })}</span>
      </label>
      <input
        id={id}
        class="cms-lah-input"
        type="number"
        inputMode="numeric"
        step={1}
        min={min}
        max={max}
        value={draft}
        aria-invalid={errors.length ? true : undefined}
        aria-describedby={errors.length ? errId : undefined}
        onInput={(e) => {
          const raw = e.currentTarget.value
          setDraft(raw)
          const v = raw === '' ? def : Number(raw)
          emitted.current = v
          onChange(v)
        }}
        onBlur={() => setDraft(String(value))}
      />
      {errors.length > 0 && (
        <p class="cms-lah-error" id={errId}>
          {errors.map((e) => errorText(t, e)).join(' ')}
        </p>
      )}
    </div>
  )
}
