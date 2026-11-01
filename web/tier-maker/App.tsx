// The Tier Maker page: a title, the tier rows, and the pool of characters not yet ranked (with the variant / mob toggles).
// The tier list is autosaved to localStorage and can be exported to a PNG that carries it (export.ts, pngMeta.ts).

import { Component, Fragment, type ComponentChildren } from 'preact'
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { loadRoster, SITE } from '../cms-plugin/roster.ts'
import { onLangChange, pageLang, type Lang } from '../shared/lang.ts'
import { buildCandidates, candidateName, DEFAULT_FILTER, filterCandidates, type Candidate, type Filter } from './candidates.ts'
import { POOL_ZONE, useDnd, type DropTarget } from './dnd.ts'
import { download, exportPng, fileName, iconUrl } from './export.ts'
import {
  addTier, defaultList, isPristine, MAX_TIERS, MAX_TIER_NAME, MAX_TITLE, moveTier, placedKeys, placeItem, removeItem, removeTier, sanitize, setTitle,
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

function TierRow({ tier, first, last, canRemove, byKey, lang, selected, drag, overIndex, startDrag, onSelect, onPlace, onChange, onMove, onRemove }: TierRowProps) {
  const items = tier.items.map((k) => byKey.get(k)).filter((c): c is Candidate => !!c)
  return (
    <div class="lah-tm-tier">
      <div class="lah-tm-label" style={{ background: tier.color }}>
        <input
          class="lah-tm-label-name"
          type="text"
          value={tier.name}
          maxLength={MAX_TIER_NAME}
          aria-label="Tier name"
          onInput={(e) => onChange({ name: e.currentTarget.value })}
        />
        <input class="lah-tm-color" type="color" value={tier.color} aria-label="Tier color" onInput={(e) => onChange({ color: e.currentTarget.value })} />
      </div>
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
        <button type="button" class="lah-tm-mini" disabled={first} onClick={() => onMove(-1)} aria-label="Move tier up">
          ▲
        </button>
        <button type="button" class="lah-tm-mini" disabled={last} onClick={() => onMove(1)} aria-label="Move tier down">
          ▼
        </button>
        <button type="button" class="lah-tm-mini" disabled={!canRemove} onClick={onRemove} aria-label="Delete tier">
          ✕
        </button>
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
