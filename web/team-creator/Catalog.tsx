// The Team Creator list: search, tag/language filters, the plugin's hero/target filters, sorting and "show more".
// All filtering happens in memory on the one blob; the filter state lives in the URL hash (deep links such as
// #hero=12641). Ported from wiki-cms `embed/src/catalog.tsx`, with the plugin filters called directly.

import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import type { PublicBlob } from '../cms-plugin/api-types.ts'
import { FilterPanel } from '../cms-plugin/FilterPanel.tsx'
import { activeCount, limitedCount, parseParams, testPayload, toParams, type FilterState } from '../cms-plugin/filters.ts'
import { makeT } from '../cms-plugin/i18n/t.ts'
import type { PluginContext } from '../cms-plugin/plugin-api.ts'
import { loadRoster, type Roster } from '../cms-plugin/roster.ts'
import { Card, Chip } from './Card.tsx'
import {
  SORT_LIMITED,
  SORT_NEWEST,
  SORT_OLDEST,
  activeCoreCount,
  emptyState,
  filterItems,
  parseHash,
  serializeHash,
  sortItems,
  type CatalogState,
  type PluginSort,
} from './catalog.ts'
import { pickText, type Lang } from './lang.ts'

const PAGE = 20
const SEARCH_DEBOUNCE_MS = 200

export function Catalog({ blob, uiLang, ctx }: { blob: PublicBlob; uiLang: Lang; ctx: PluginContext }) {
  const t = useMemo(() => makeT(uiLang), [uiLang])
  const tagDefs = blob.meta.tags

  const [core, setCore] = useState<CatalogState>(() => parseHash(location.hash, tagDefs).core)
  const [qInput, setQInput] = useState(core.q)
  const [pstate, setPstate] = useState<FilterState>(() => parseParams(parseHash(location.hash, tagDefs).rest))
  const [roster, setRoster] = useState<Roster | null>(null)
  const [ready, setReady] = useState(false) // the roster finished loading (or failed): filtering with half the data would flash wrong results
  const [advanced, setAdvanced] = useState(false)
  const [shown, setShown] = useState(PAGE)
  const dirty = useRef(false) // only user changes are written back to the hash

  useEffect(() => {
    let dead = false
    loadRoster().then(
      (r) => !dead && (setRoster(r), setReady(true)),
      (e) => {
        console.warn('[team-creator] roster unavailable; no hero counts as limited', e)
        if (!dead) setReady(true)
      },
    )
    return () => {
      dead = true
    }
  }, [])

  // Back/forward and in-page links to another #hash.
  useEffect(() => {
    const onHash = () => {
      const p = parseHash(location.hash, tagDefs)
      dirty.current = false
      setCore(p.core)
      setQInput(p.core.q)
      setPstate(parseParams(p.rest))
      setShown(PAGE)
    }
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [tagDefs])

  const sorts = useMemo<(PluginSort & { label: string })[]>(
    () => [{ key: SORT_LIMITED, label: t('sortLimited'), compare: (a, b) => limitedCount(a, roster) - limitedCount(b, roster) }],
    [t, roster],
  )
  const sortKey = core.sort === SORT_NEWEST || core.sort === SORT_OLDEST || sorts.some((s) => s.key === core.sort) ? core.sort : SORT_NEWEST

  const results = useMemo(
    () => (ready ? sortItems(filterItems(blob.items, core, { test: (payload) => testPayload(payload, pstate, roster) }), sortKey, sorts) : []),
    [ready, blob.items, core, pstate, roster, sortKey, sorts],
  )

  const pluginParams = useMemo(() => toParams(pstate), [pstate])

  // Mirror the state into the hash (replaceState: no history entries, no hashchange event).
  useEffect(() => {
    if (!ready || !dirty.current) return
    const hash = serializeHash({ ...core, sort: sortKey }, pluginParams)
    if (hash === location.hash || (!hash && !location.hash)) return
    try {
      history.replaceState(history.state, '', location.pathname + location.search + hash)
    } catch {
      /* sandboxed frames may forbid it */
    }
  }, [ready, core, sortKey, pluginParams])

  const updateCore = (patch: Partial<CatalogState>) => {
    dirty.current = true
    setShown(PAGE)
    setCore((c) => ({ ...c, ...patch }))
  }
  const updatePlugin = (s: FilterState) => {
    dirty.current = true
    setShown(PAGE)
    setPstate(s)
  }

  // Debounced search box.
  useEffect(() => {
    if (qInput === core.q) return
    const id = setTimeout(() => updateCore({ q: qInput }), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [qInput])

  const toggleTag = (key: string, value: string) => {
    const cur = core.tags[key] ?? []
    const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]
    const tags = { ...core.tags, [key]: next }
    if (!next.length) delete tags[key]
    updateCore({ tags })
  }

  const clear = () => {
    dirty.current = true
    setShown(PAGE)
    setCore((c) => ({ ...emptyState(), sort: c.sort }))
    setQInput('')
    setPstate(parseParams(new URLSearchParams()))
  }

  const counts = activeCoreCount(core)
  const advancedActive = counts.advanced + activeCount(pstate)
  const anyActive = counts.basic + counts.advanced > 0 || Object.keys(pluginParams).length > 0

  if (!ready) {
    return (
      <div class="lah-tc-skeleton" aria-hidden="true">
        <span /> <span />
      </div>
    )
  }

  const presentLangs = blob.meta.langs.filter((l) => blob.items.some((i) => i.lang === l.value))
  const visible = results.slice(0, shown)

  return (
    <div class="lah-tc-catalog">
      <div class="lah-tc-controls">
        <div class="lah-tc-controls-basic">
          <input
            type="search"
            class="lah-tc-input lah-tc-search"
            value={qInput}
            placeholder={t('tcSearch')}
            aria-label={t('tcSearch')}
            autocomplete="off"
            onInput={(e) => setQInput((e.currentTarget as HTMLInputElement).value)}
          />
          <div class="lah-tc-lf lah-tc-lf-basic">
            <FilterPanel part="basic" state={pstate} onChange={updatePlugin} ctx={ctx} />
          </div>
        </div>
        <div class="lah-tc-controls-row">
          <button type="button" class="lah-tc-btn" aria-expanded={advanced} aria-controls="lah-tc-advanced" onClick={() => setAdvanced((x) => !x)}>
            {t('tcAdvanced')}
            {advancedActive > 0 && (
              <span class="lah-tc-badge" aria-label={t('tcActiveCount', { count: advancedActive })}>
                {advancedActive}
              </span>
            )}
          </button>
          <label class="lah-tc-sort">
            <span>{t('tcSort')}</span>
            <select class="lah-tc-input" value={sortKey} onChange={(e) => updateCore({ sort: (e.currentTarget as HTMLSelectElement).value })}>
              <option value={SORT_NEWEST}>{t('tcSortNewest')}</option>
              <option value={SORT_OLDEST}>{t('tcSortOldest')}</option>
              {sorts.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div id="lah-tc-advanced" class="lah-tc-advanced" hidden={!advanced}>
          {tagDefs.map((def) => (
            <div key={def.key} class="lah-tc-filter-group" role="group" aria-label={pickText(def.label, uiLang)}>
              <span class="lah-tc-filter-label">{pickText(def.label, uiLang)}</span>
              {def.options.map((o) => (
                <Chip key={o.value} active={(core.tags[def.key] ?? []).includes(o.value)} onClick={() => toggleTag(def.key, o.value)}>
                  {pickText(o.label, uiLang)}
                </Chip>
              ))}
            </div>
          ))}
          {presentLangs.length > 1 && (
            <div class="lah-tc-filter-group" role="group" aria-label={t('tcFilterLabel')}>
              <span class="lah-tc-filter-label">{t('tcFilterLabel')}</span>
              <Chip active={core.lang === 'all'} onClick={() => updateCore({ lang: 'all' })}>
                {t('tcFilterAll')}
              </Chip>
              {presentLangs.map((l) => (
                <Chip key={l.value} active={core.lang === l.value} onClick={() => updateCore({ lang: l.value })}>
                  {l.label}
                </Chip>
              ))}
            </div>
          )}
          <div class="lah-tc-lf lah-tc-lf-advanced">
            <FilterPanel part="advanced" state={pstate} onChange={updatePlugin} ctx={ctx} />
          </div>
        </div>
      </div>

      <div class="lah-tc-results-bar" aria-live="polite">
        <span class="lah-tc-results">{t('tcResults', { shown: visible.length, count: results.length })}</span>
        {anyActive && (
          <button type="button" class="lah-tc-link" onClick={clear}>
            {t('tcClear')}
          </button>
        )}
      </div>

      {blob.items.length === 0 ? (
        <p class="lah-tc-empty">{t('tcEmpty')}</p>
      ) : results.length === 0 ? (
        <p class="lah-tc-empty">{t('tcNoMatch')}</p>
      ) : (
        <>
          <ul class="lah-tc-list">
            {visible.map((item) => (
              <li key={item.id} class="lah-tc-card">
                <Card item={item} blob={blob} uiLang={uiLang} ctx={ctx} />
              </li>
            ))}
          </ul>
          {results.length > shown && (
            <button type="button" class="lah-tc-btn lah-tc-more" onClick={() => setShown((n) => n + PAGE)}>
              {t('tcShowMore')}
            </button>
          )}
        </>
      )}
    </div>
  )
}
