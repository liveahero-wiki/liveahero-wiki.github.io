// The Tier Maker page: a title, the tier rows, and the pool of characters not yet ranked (with the variant / mob toggles).
// The tier list is autosaved to localStorage and can be exported to a PNG that carries it (export.ts, pngMeta.ts).

import { Component, Fragment, type ComponentChildren, type JSX } from 'preact'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks'
import { loadRoster, SITE } from '../cms-plugin/roster.ts'
import { onLangChange, pageLang, type Lang } from '../shared/lang.ts'
import { buildCandidates, candidateName, DEFAULT_FILTER, filterCandidates, type Candidate, type Filter } from './candidates.ts'
import { POOL_ZONE, useDnd, type DropTarget } from './dnd.ts'
import { download, exportPng, fileName, iconUrl, textOn } from './export.ts'
import {
  addTier, defaultList, isPristine, MAX_TIERS, MAX_TIER_NAME, MAX_TITLE, moveTier, normalizeTierName, PALETTE, placedKeys, placeItem, removeItem, removeTier, sanitize, setTitle,
  updateTier, type Tier, type TierList,
} from './model.ts'
import { MAX_PNG_BYTES, readTierList } from './pngMeta.ts'

const DRAFT_KEY = 'lahTierMaker:v1'

type Notice = { kind: 'ok' | 'warn' | 'error'; text: string } | null

function readDraft(): unknown {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeDraft(list: TierList): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(list))
  } catch {
    // private window / blocked storage: the page works without a draft
  }
}

function useUiLang(): Lang {
  const [lang, setLang] = useState(pageLang)
  useEffect(() => onLangChange(setLang), [])
  return lang
}

interface TileProps {
  c: Candidate
  lang: Lang
  selected: boolean
  dragging: boolean
  onPointerDown: (e: PointerEvent) => void
  onSelect: () => void
}

function Tile({ c, lang, selected, dragging, onPointerDown, onSelect }: TileProps) {
  const name = candidateName(c, lang)
  return (
    <button
      type="button"
      class={`lah-tm-tile${selected ? ' is-selected' : ''}${dragging ? ' is-dragging' : ''}`}
      data-key={c.key}
      title={name}
      aria-pressed={selected}
      aria-label={`${name}${c.kind === 'sidekick' ? ' (sidekick)' : ''}`}
      onPointerDown={onPointerDown}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
    >
      <img src={iconUrl(c)} alt="" draggable={false} loading="lazy" width={56} height={56} />
      {c.kind === 'sidekick' && <span class="lah-tm-badge">SK</span>}
    </button>
  )
}

export function App() {
  const lang = useUiLang()
  const [cands, setCands] = useState<Candidate[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [list, setList] = useState<TierList>(defaultList)
  const [filter, setFilter] = useState<Filter>(DEFAULT_FILTER)
  const [selected, setSelected] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice>(null)
  const [busy, setBusy] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [fileOver, setFileOver] = useState(false)
  const loaded = useRef(false)

  useEffect(() => {
    let dead = false
    setLoadError(false)
    loadRoster().then(
      (roster) => {
        if (dead) return
        const all = buildCandidates(roster)
        const draft = sanitize(readDraft(), new Set(all.map((c) => c.key)))
        if (draft) {
          setList(draft.list)
          if (draft.skipped) {
            setNotice({ kind: 'warn', text: `${draft.skipped} character${draft.skipped === 1 ? '' : 's'} in your saved tier list are no longer in the roster and were removed.` })
          }
        }
        loaded.current = true
        setCands(all)
      },
      (e) => {
        console.warn('[tier-maker] could not load the roster', e)
        if (!dead) setLoadError(true)
      },
    )
    return () => {
      dead = true
    }
  }, [attempt])

  useEffect(() => {
    if (loaded.current) writeDraft(list)
  }, [list])

  const byKey = useMemo(() => new Map((cands ?? []).map((c) => [c.key, c])), [cands])
  const placed = useMemo(() => placedKeys(list), [list])
  const pool = useMemo(() => filterCandidates(cands ?? [], filter).filter((c) => !placed.has(c.key)), [cands, filter, placed])
  const unplacedTotal = (cands?.length ?? 0) - placed.size

  const drop = (key: string, t: DropTarget) => {
    setList((l) => (t.zone === POOL_ZONE ? removeItem(l, key) : placeItem(l, key, t.zone, t.index)))
    setSelected(null)
  }
  const { drag, over, startDrag, ghostRef, wasDrag } = useDnd(drop)

  const select = (key: string) => {
    if (!wasDrag()) setSelected((s) => (s === key ? null : key))
  }
  // The pool can hold ~1000 tiles; reusing the same vnodes lets Preact skip diffing them when only the drop position changed.
  const poolTiles = useMemo(
    () => pool.map((c) => <Tile key={c.key} c={c} lang={lang} selected={selected === c.key} dragging={drag === c.key} onPointerDown={startDrag(c.key)} onSelect={() => select(c.key)} />),
    // select and startDrag only touch refs and state setters, so they are left out of the deps
    [pool, lang, selected, drag],
  )
  /** Click on an empty part of a tier row / the pool: put the selected character there. */
  const placeSelected = (zone: string) => {
    if (selected) drop(selected, { zone, index: zone === POOL_ZONE ? 0 : Infinity })
  }

  const doExport = async () => {
    setBusy(true)
    setNotice(null)
    try {
      const { blob, failed } = await exportPng(list, byKey)
      download(blob, fileName(list.title))
      setNotice(
        failed
          ? { kind: 'warn', text: `Exported, but ${failed} icon${failed === 1 ? '' : 's'} could not be loaded and show as placeholders.` }
          : { kind: 'ok', text: 'Exported. Keep the PNG: you can import it here later to keep editing.' },
      )
    } catch (e) {
      console.error('[tier-maker] export failed', e)
      setNotice({ kind: 'error', text: 'Could not create the image. Check your connection (the icons are loaded from the wiki) and try again.' })
    } finally {
      setBusy(false)
    }
  }

  const importFile = async (file: File) => {
    setNotice(null)
    let json: string | null = null
    try {
      // the size check comes first: readTierList's own cap only runs after the whole file is in memory
      json = file.size > MAX_PNG_BYTES ? null : readTierList(new Uint8Array(await file.arrayBuffer()))
    } catch {
      json = null
    }
    let parsed: ReturnType<typeof sanitize> = null
    try {
      if (json) parsed = sanitize(JSON.parse(json), new Set(byKey.keys()))
    } catch {
      parsed = null
    }
    if (!parsed) {
      setNotice({ kind: 'error', text: 'This image has no tier list in it. Only PNGs exported from this page can be imported (re-saved or re-uploaded copies lose it).' })
      return
    }
    if (!isPristine(list) && !confirm('Replace your current tier list with the imported one?')) return
    setList(parsed.list)
    setSelected(null)
    setNotice(
      parsed.skipped
        ? { kind: 'warn', text: `Imported. ${parsed.skipped} character${parsed.skipped === 1 ? '' : 's'} in the file are not in the current roster and were skipped.` }
        : { kind: 'ok', text: 'Imported.' },
    )
  }

  const onFileDrop = (e: DragEvent) => {
    e.preventDefault()
    setFileOver(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) void importFile(file)
  }
  const hasFiles = (e: DragEvent) => !!e.dataTransfer?.types.includes('Files')

  const reset = () => {
    if (!isPristine(list) && !confirm('Clear the whole tier list?')) return
    setList(defaultList())
    setSelected(null)
    setNotice(null)
  }

  if (loadError) {
    return (
      <div class="lah-tm-status" role="alert">
        <p>Could not load the character list.</p>
        <button type="button" class="lah-tm-btn" onClick={() => setAttempt((n) => n + 1)}>
          Retry
        </button>
      </div>
    )
  }
  if (!cands) return <p class="lah-tm-status">Loading characters…</p>

  const dragCand = drag ? byKey.get(drag) : undefined
  const selectedCand = selected ? byKey.get(selected) : undefined

  return (
    <div
      class={`lah-tm${fileOver ? ' is-file-over' : ''}`}
      onDragOver={(e) => {
        if (!hasFiles(e)) return
        e.preventDefault()
        setFileOver(true)
      }}
      onDragLeave={(e) => {
        // dragleave also fires when moving between children; only clear once the pointer is outside the page app
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFileOver(false)
      }}
      onDrop={onFileDrop}
    >
      <div class="lah-tm-bar">
        <input
          class="lah-tm-title"
          type="text"
          value={list.title}
          maxLength={MAX_TITLE}
          placeholder="Tier list title"
          aria-label="Tier list title"
          onInput={(e) => setList((l) => setTitle(l, e.currentTarget.value))}
        />
        <div class="lah-tm-actions">
          <button type="button" class="lah-tm-btn is-primary" disabled={busy} onClick={doExport}>
            {busy ? 'Exporting…' : 'Export PNG'}
          </button>
          <label class="lah-tm-btn">
            Import PNG
            <input
              type="file"
              accept="image/png"
              hidden
              onChange={(e) => {
                const f = e.currentTarget.files?.[0]
                e.currentTarget.value = ''
                if (f) void importFile(f)
              }}
            />
          </label>
          <button type="button" class="lah-tm-btn" onClick={() => setList((l) => addTier(l))} disabled={list.tiers.length >= MAX_TIERS}>
            Add tier
          </button>
          <button type="button" class="lah-tm-btn" onClick={reset}>
            Reset
          </button>
        </div>
      </div>
      {notice && (
        <p class={`lah-tm-notice is-${notice.kind}`} role="status">
          {notice.text}
        </p>
      )}
      <p class="lah-tm-hint">
        Click or tap a character, then a tier row, to place it. With a mouse you can also drag. You can drop a PNG exported from here onto this page to import it.
      </p>

      <div class="lah-tm-tiers">
        {list.tiers.map((t, i) => (
          <TierRow
            key={t.id}
            tier={t}
            first={i === 0}
            last={i === list.tiers.length - 1}
            canRemove={list.tiers.length > 1}
            byKey={byKey}
            lang={lang}
            selected={selected}
            drag={drag}
            overIndex={over?.zone === t.id ? over.index : null}
            startDrag={startDrag}
            onSelect={select}
            onPlace={() => placeSelected(t.id)}
            onChange={(patch) => setList((l) => updateTier(l, t.id, patch))}
            onMove={(d) => setList((l) => moveTier(l, t.id, d))}
            onRemove={() => setList((l) => removeTier(l, t.id))}
          />
        ))}
      </div>

      <section class="lah-tm-poolbox" aria-label="Characters">
        <div class="lah-tm-filter">
          <div class="lah-tm-seg" role="group" aria-label="Show">
            {(['all', 'hero', 'sidekick'] as const).map((type) => (
              <button key={type} type="button" class={`lah-tm-seg-btn${filter.type === type ? ' is-on' : ''}`} aria-pressed={filter.type === type} onClick={() => setFilter((f) => ({ ...f, type }))}>
                {type === 'all' ? 'All' : type === 'hero' ? 'Heroes' : 'Sidekicks'}
              </button>
            ))}
          </div>
          <label class="lah-tm-check">
            <input type="checkbox" checked={filter.hideVariants} onChange={(e) => setFilter((f) => ({ ...f, hideVariants: e.currentTarget.checked }))} /> Hide variants
          </label>
          <label class="lah-tm-check">
            <input type="checkbox" checked={filter.hideMobs} onChange={(e) => setFilter((f) => ({ ...f, hideMobs: e.currentTarget.checked }))} /> Hide mobs
          </label>
          <input
            class="lah-tm-search"
            type="search"
            value={filter.query}
            placeholder="Search name"
            aria-label="Search characters"
            onInput={(e) => setFilter((f) => ({ ...f, query: e.currentTarget.value }))}
          />
          <span class="lah-tm-count">
            {pool.length} shown, {unplacedTotal} unranked
          </span>
        </div>
        <div class={`lah-tm-pool${over?.zone === POOL_ZONE ? ' is-over' : ''}`} data-zone={POOL_ZONE} onClick={() => placeSelected(POOL_ZONE)}>
          {poolTiles}
          {!pool.length && <p class="lah-tm-empty">{unplacedTotal ? 'No unranked character matches the filters.' : 'Every character is ranked.'}</p>}
        </div>
        {selectedCand && (
          <p class="lah-tm-selected">
            Selected: <strong>{candidateName(selectedCand, lang)}</strong>
            {selectedCand.page && (
              <>
                {' '}
                (<a href={`${selectedCand.page}#${selectedCand.key}`} target="_blank" rel="noopener">page</a>)
              </>
            )}
            . {placed.has(selectedCand.key) ? 'Click a tier to move it, or the list above to unrank it.' : 'Click a tier row to place it.'}
          </p>
        )}
      </section>

      {drag && dragCand && <img class="lah-tm-ghost" ref={ghostRef} src={iconUrl(dragCand)} alt="" />}
      <p class="lah-tm-foot">
        Characters are the ones listed on <a href="/charas/">Characters</a>. Icons: <a href={SITE}>{SITE.replace('https://', '')}</a>.
      </p>
    </div>
  )
}

interface TierRowProps {
  tier: Tier
  first: boolean
  last: boolean
  canRemove: boolean
  byKey: ReadonlyMap<string, Candidate>
  lang: Lang
  selected: string | null
  drag: string | null
  overIndex: number | null
  startDrag: (key: string) => (e: PointerEvent) => void
  onSelect: (key: string) => void
  onPlace: () => void
  onChange: (patch: Partial<Pick<Tier, 'name' | 'color'>>) => void
  onMove: (delta: -1 | 1) => void
  onRemove: () => void
}

/**
 * The tier's name, editable in place. Plain text only: formatting commands, drops and pastes are blocked, and `sync` flattens
 * anything that still gets in. The text is written to the DOM by hand: re-rendering a text child would reset the caret while typing.
 */
function TierLabel({ name, color, onName }: { name: string; color: string; onName: (name: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (el && el.textContent !== name) el.textContent = name
  }, [name])
  const sync = (el: HTMLElement) => {
    const text = normalizeTierName(el.textContent ?? '')
    if (el.childElementCount || el.textContent !== text) {
      el.textContent = text
      const sel = getSelection()
      sel?.selectAllChildren(el)
      sel?.collapseToEnd()
    }
    onName(text)
  }
  return (
    <div
      ref={ref}
      class="lah-tm-label"
      style={{ background: color, color: textOn(color) }}
      contentEditable="true"
      spellcheck={false}
      role="textbox"
      aria-multiline="false"
      aria-label="Tier name"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          e.currentTarget.blur()
        }
      }}
      onBeforeInput={(e) => {
        if (e.inputType.startsWith('format')) e.preventDefault()
      }}
      onDrop={(e) => e.preventDefault()}
      onPaste={(e) => {
        e.preventDefault()
        const range = getSelection()?.getRangeAt(0)
        if (!range) return
        range.deleteContents()
        range.insertNode(document.createTextNode(e.clipboardData?.getData('text/plain') ?? ''))
        range.collapse(false)
        sync(e.currentTarget)
      }}
      onInput={(e) => sync(e.currentTarget)}
    />
  )
}

function TierSettings({ tier, first, last, canRemove, onChange, onMove, onRemove }: Pick<TierRowProps, 'tier' | 'first' | 'last' | 'canRemove' | 'onChange' | 'onMove' | 'onRemove'>) {
  const popId = `lah-tm-pop-${tier.id}`
  const anchorName = `--${popId}`
  const pop = useRef<HTMLDivElement>(null)
  const reopen = useRef<HTMLElement | null>(null)
  // Moving a row re-inserts its DOM node, which closes the popover; reopen it so the tier can be moved again, and put focus back.
  useLayoutEffect(() => {
    const el = pop.current
    const from = reopen.current
    if (!from || !el) return
    reopen.current = null
    if (!el.matches(':popover-open')) el.showPopover()
    const next = from.isConnected && !(from as HTMLButtonElement).disabled ? from : el.querySelector<HTMLElement>('.lah-tm-pop-actions button:not(:disabled)')
    next?.focus()
  })
  const move = (d: -1 | 1, e: JSX.TargetedMouseEvent<HTMLButtonElement>) => {
    reopen.current = e.currentTarget
    onMove(d)
  }
  return (
    <>
      <button type="button" class="lah-tm-mini lah-tm-gear" popovertarget={popId} style={{ anchorName } as JSX.CSSProperties} aria-label="Tier settings" title="Tier settings">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
      <div id={popId} ref={pop} popover="auto" class="lah-tm-pop" style={{ positionAnchor: anchorName } as JSX.CSSProperties}>
        <label class="lah-tm-pop-field">
          Name
          <input type="text" value={tier.name} maxLength={MAX_TIER_NAME} onInput={(e) => onChange({ name: e.currentTarget.value })} />
        </label>
        <div class="lah-tm-pop-field" role="group" aria-label="Color">
          Color
          <div class="lah-tm-swatches">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                class="lah-tm-swatch"
                style={{ background: c }}
                aria-label={c}
                aria-pressed={tier.color.toLowerCase() === c}
                onClick={() => onChange({ color: c })}
              />
            ))}
          </div>
          <label class="lah-tm-custom">
            <input type="color" value={tier.color} aria-label="Custom color" onInput={(e) => onChange({ color: e.currentTarget.value })} />
            Custom
          </label>
        </div>
        <div class="lah-tm-pop-actions">
          <button type="button" class="lah-tm-btn" disabled={first} onClick={(e) => move(-1, e)}>
            ▲ Move up
          </button>
          <button type="button" class="lah-tm-btn" disabled={last} onClick={(e) => move(1, e)}>
            ▼ Move down
          </button>
          <button type="button" class="lah-tm-btn is-danger" disabled={!canRemove} onClick={onRemove}>
            Delete tier
          </button>
        </div>
      </div>
    </>
  )
}

function TierRow({ tier, first, last, canRemove, byKey, lang, selected, drag, overIndex, startDrag, onSelect, onPlace, onChange, onMove, onRemove }: TierRowProps) {
  const items = tier.items.map((k) => byKey.get(k)).filter((c): c is Candidate => !!c)
  return (
    <div class="lah-tm-tier">
      <TierLabel name={tier.name} color={tier.color} onName={(name) => onChange({ name })} />
      <div class={`lah-tm-zone${overIndex !== null ? ' is-over' : ''}`} data-zone={tier.id} onClick={onPlace}>
        {items.map((c, i) => (
          <Fragment key={c.key}>
            {overIndex === i && <span class="lah-tm-caret" />}
            <Tile c={c} lang={lang} selected={selected === c.key} dragging={drag === c.key} onPointerDown={startDrag(c.key)} onSelect={() => onSelect(c.key)} />
          </Fragment>
        ))}
        {overIndex !== null && overIndex >= items.length && <span class="lah-tm-caret" />}
        {!items.length && overIndex === null && <span class="lah-tm-placeholder">Drop characters here</span>}
      </div>
      <div class="lah-tm-ctl">
        {selected && (
          <button type="button" class="lah-tm-mini is-place" onClick={onPlace}>
            Place here
          </button>
        )}
        <TierSettings tier={tier} first={first} last={last} canRemove={canRemove} onChange={onChange} onMove={onMove} onRemove={onRemove} />
      </div>
    </div>
  )
}

export class Boundary extends Component<{ children: ComponentChildren }, { error: boolean }> {
  state = { error: false }
  componentDidCatch(e: unknown) {
    console.error('[tier-maker] crashed', e)
    this.setState({ error: true })
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div class="lah-tm-status" role="alert">
        <p>The tier maker hit an error.</p>
        <button type="button" class="lah-tm-btn" onClick={() => this.setState({ error: false })}>
          Retry
        </button>
      </div>
    )
  }
}
