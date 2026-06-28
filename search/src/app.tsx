import { useEffect, useMemo, useReducer, useState } from 'preact/hooks'
import type { Entity, Query, SkillIndex } from './types'
import { loadIndex } from './data/loadIndex'
import { filterRows } from './lib/filters'
import { FilterPanel } from './components/FilterPanel'
import { ResultTable } from './components/ResultTable'
import { SkillKitDialog } from './components/SkillKitDialog'

type SetField = 'types' | 'labels' | 'statusTypes'
type FlagField = 'skillTree' | 'includeMob'
type ViewField = 'viewMin' | 'viewMax'

export type QueryAction =
  | { type: 'toggle'; field: SetField; value: string }
  | { type: 'clear'; field: SetField }
  | { type: 'clearKeys'; field: SetField; keys: string[] }
  | { type: 'addStatus'; value: number }
  | { type: 'removeStatus'; value: number }
  | { type: 'setView'; field: ViewField; value: string }
  | { type: 'toggleFlag'; field: FlagField }
  | { type: 'reset' }

function initialQuery(): Query {
  return {
    types: new Set(),
    labels: new Set(),
    statusTypes: new Set(),
    statusIds: new Set(),
    viewMin: '',
    viewMax: '',
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
    case 'clearKeys': {
      const next = new Set(state[action.field])
      for (const k of action.keys) next.delete(k)
      return { ...state, [action.field]: next }
    }
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
    case 'toggleFlag':
      return { ...state, [action.field]: !state[action.field] }
    case 'reset':
      return { ...initialQuery(), _vcKey: state._vcKey + 1 }
    default:
      return state
  }
}

export function App() {
  const [index, setIndex] = useState<SkillIndex | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [query, dispatch] = useReducer(reducer, initialQuery())
  // Character whose full skill kit is shown in the modal (null = closed).
  const [kitEntity, setKitEntity] = useState<Entity | null>(null)

  useEffect(() => {
    loadIndex().then(setIndex).catch((e: unknown) => setError(String(e)))
  }, [])

  const rows = useMemo(() => {
    if (!index) return []
    return filterRows(index.entities, query, index.statuses)
  }, [index, query])

  if (error) return <div class="loading">Failed to load index: {error}</div>
  if (!index) return <div class="loading">Loading skill index…</div>

  return (
    <div class="app">
      <header class="app-header">
        <h1>LAH Skill Search</h1>
        <span class="ver">index v{index.version}</span>
      </header>
      <FilterPanel
        index={index}
        query={query}
        dispatch={dispatch}
        resultCount={rows.length}
      />
      <ResultTable rows={rows} statuses={index.statuses} onOpenKit={setKitEntity} />
      <SkillKitDialog
        entity={kitEntity}
        skillTree={query.skillTree}
        statuses={index.statuses}
        onClose={() => setKitEntity(null)}
      />
    </div>
  )
}
