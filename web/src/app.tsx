import { useEffect, useMemo, useReducer, useState } from 'preact/hooks'
import type { Entity, Query, SkillIndex } from './types'
import { clearCache, loadIndex } from './data/loadIndex'
import { filterRows } from './lib/filters'
import { getInitialLang, LANGS, storeLang, type Lang } from './lib/lang'
import { localizeCategories } from './lib/categoryTranslations'
import { t } from './lib/uiTranslations'
import { FilterPanel } from './components/FilterPanel'
import { ResultTable } from './components/ResultTable'
import { SkillKitDialog } from './components/SkillKitDialog'

type SetField = 'types' | 'roles' | 'labels' | 'statusTypes'
type FlagField = 'skillTree' | 'includeMob'
type ViewField = 'viewMin' | 'viewMax'

export type QueryAction =
  | { type: 'toggle'; field: SetField; value: string }
  | { type: 'clear'; field: SetField }
  | { type: 'addStatus'; value: number }
  | { type: 'removeStatus'; value: number }
  | { type: 'setView'; field: ViewField; value: string }
  | { type: 'setCharacterName'; value: string }
  | { type: 'toggleFlag'; field: FlagField }
  | { type: 'reset' }

function initialQuery(): Query {
  return {
    types: new Set(),
    roles: new Set(),
    labels: new Set(),
    statusTypes: new Set(),
    statusIds: new Set(),
    viewMin: '',
    viewMax: '',
    characterName: '',
    skillTree: true,
    includeMob: true,
    _vcKey: 0,
  }
}

// Sets live in state; each reducer branch returns a fresh object/Set so Preact
// re-renders.
function reducer(state: Query, action: QueryAction): Query {
  switch (action.type) {
    case 'toggle': {
      const next = new Set(state[action.field])
      next.has(action.value) ? next.delete(action.value) : next.add(action.value)
      return { ...state, [action.field]: next }
    }
    case 'clear':
      return { ...state, [action.field]: new Set() }
    case 'addStatus': {
      const next = new Set(state.statusIds)
      next.add(action.value)
      return { ...state, statusIds: next }
    }
    case 'removeStatus': {
      const next = new Set(state.statusIds)
      next.delete(action.value)
      return { ...state, statusIds: next }
    }
    case 'setView':
      return { ...state, [action.field]: action.value }
    case 'setCharacterName':
      return { ...state, characterName: action.value }
    case 'toggleFlag':
      return { ...state, [action.field]: !state[action.field] }
    case 'reset':
      return { ...initialQuery(), _vcKey: state._vcKey + 1 }
    default:
      return state
  }
}

export function App() {
  const [lang, setLang] = useState<Lang>(getInitialLang)
  const [index, setIndex] = useState<SkillIndex | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [query, dispatch] = useReducer(reducer, initialQuery())
  const [kitEntity, setKitEntity] = useState<Entity | null>(null)
  const [showLabels, setShowLabels] = useState(false)

  useEffect(() => {
    setIndex(null)
    setError(null)
    loadIndex(lang)
      .then(idx => setIndex({ ...idx, categories: localizeCategories(idx.categories, lang) }))
      .catch((e: unknown) => setError(String(e)))
  }, [lang])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  function forceReload() {
    clearCache(lang)
    setIndex(null)
    setError(null)
    loadIndex(lang)
      .then(idx => setIndex({ ...idx, categories: localizeCategories(idx.categories, lang) }))
      .catch((e: unknown) => setError(String(e)))
  }

  function handleLangChange(next: Lang) {
    storeLang(next)
    setLang(next)
  }

  const rows = useMemo(() => {
    if (!index) return []
    return filterRows(index.entities, query, index.statuses)
  }, [index, query])

  if (error) return <div class="loading">{t(lang, 'load_error')}{error}</div>
  if (!index) return <div class="loading">{t(lang, 'loading')}</div>

  return (
    <div class="app">
      <header class="app-header">
        <h1>LAH Skill Search</h1>
        <select
          class="lang-select"
          value={lang}
          onChange={(e) => handleLangChange(e.currentTarget.value as Lang)}
          title={t(lang, 'lang_title')}
        >
          {LANGS.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
        <span class="ver">index v{index.version}</span>
        <button type="button" class="reload-btn" onClick={forceReload} title={t(lang, 'reload_title')}>↻</button>
      </header>
      <FilterPanel
        index={index}
        query={query}
        dispatch={dispatch}
        resultCount={rows.length}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels((v) => !v)}
        lang={lang}
      />
      <ResultTable
        rows={rows}
        statuses={index.statuses}
        onOpenKit={setKitEntity}
        showLabels={showLabels}
        categories={index.categories}
        lang={lang}
      />
      <SkillKitDialog
        entity={kitEntity}
        skillTree={query.skillTree}
        statuses={index.statuses}
        onClose={() => setKitEntity(null)}
        lang={lang}
      />
    </div>
  )
}
