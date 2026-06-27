import { useEffect, useMemo, useReducer, useState } from 'preact/hooks'
import { loadIndex } from './data/loadIndex.js'
import { filterEntities, flattenToRows } from './lib/filters.js'
import { FilterPanel } from './components/FilterPanel.jsx'
import { ResultTable } from './components/ResultTable.jsx'

function initialQuery() {
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
function reducer(state, action) {
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
      return { ...initialQuery(), _vcKey: (state._vcKey ?? 0) + 1 }
    default:
      return state
  }
}

export function App() {
  const [index, setIndex] = useState(null)
  const [error, setError] = useState(null)
  const [query, dispatch] = useReducer(reducer, undefined, initialQuery)

  useEffect(() => {
    loadIndex().then(setIndex).catch((e) => setError(String(e)))
  }, [])

  const rows = useMemo(() => {
    if (!index) return []
    const matched = filterEntities(index.entities, query, index.statuses)
    return flattenToRows(matched, query.skillTree)
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
      <ResultTable rows={rows} statuses={index.statuses} />
    </div>
  )
}
