// Standalone harness: pnpm dev:cms-plugin, then open http://localhost:5191/dev.html
import { h, render } from 'preact'
import plugin from '../index.ts'
import { FilterPanel } from '../FilterPanel.tsx'
import { loadRoster, setRosterSource, type Roster } from '../roster.ts'
import { ensureStyles } from '../style.ts'
import { validateTeam } from '../validate.ts'
import type { EditorHandle, FieldError, PluginContext } from '../plugin-api.ts'
import { activeCount, defaultFilterState, limitedCount, parseParams, testPayload, toParams, type FilterState } from '../filters.ts'
import type { Lang } from '../i18n.ts'
import type { RosterFile, TeamPayload, TeamSlot } from '../types.ts'
import fixture from './team-roster.fixture.json'

const slot = (stockId: number, extra: Partial<TeamSlot> = {}): TeamSlot => ({
  stockId, lv: 60, plv: 0, fans: 0, engrave: 0, bloom: false, skillTree: false, active: null, passives: [], ...extra,
})

interface Scenario {
  label: string
  options: Record<string, unknown>
  /** undefined = start from defaultPayload(). */
  payload?: TeamPayload
}

const TARGETS = [
  { id: 'quest-616001', label: { en: 'Simulator - Lantern-type Kaibutsu (SSS)', ja: 'シミュレーター 提灯型怪物 (SSS)' }, url: '/guide/challenge_simulator/' },
  { id: 'quest-617001', label: { en: 'Simulator - Another SSS' }, url: '/guide/challenge_simulator/' },
  { id: 'rogue-2609', label: { en: 'Unexplored: final boss' } },
  { id: 'quest-605001', label: { en: 'Old simulator' }, url: '/guide/challenge_simulator/', retired: true },
]

const SCENARIOS: Record<string, Scenario> = {
  'quest-support': { label: 'Quest group, support true (default)', options: { support: true } },
  'optional-targets': {
    label: 'support optional + targets (Team Creator "all" group)',
    options: { support: 'optional', targets: TARGETS },
    payload: { v: 1, supportIndex: null, target: 'quest-616001', heroes: [slot(10011), slot(10021)] },
  },
  'retired-target': {
    label: 'support optional, current target retired / unlisted',
    options: { support: 'optional', targets: TARGETS },
    payload: { v: 1, supportIndex: 1, target: 'quest-605001', heroes: [slot(10011), slot(10021)] },
  },
  'unlisted-target': {
    label: 'support optional, unlisted target id (target_unknown)',
    options: { support: 'optional', targets: TARGETS },
    payload: { v: 1, supportIndex: null, target: 'gone-1', heroes: [slot(10011)] },
  },
  'items': {
    label: 'Part-time hero 10431 + skill-book items as passives (same item on two heroes is fine)',
    options: { support: 'optional' },
    payload: {
      v: 1,
      supportIndex: null,
      heroes: [slot(10431, { active: 10021, passives: [65, 80, 10031], bloom: true }), slot(10011, { passives: [65, 113] })],
    },
  },
  'quest-nosupport': { label: 'Quest group, support false', options: { support: false } },
  'focus-hero': { label: 'Hero focus 10011 (prefill)', options: { support: true, focus: { kind: 'hero', stockId: 10011 } } },
  'focus-sidekick': { label: 'Sidekick focus 10021 (hint + focus_missing)', options: { support: true, focus: { kind: 'sidekick', stockId: 10021 } } },
  'five-slots': {
    label: '5 slots, bloom, support in the middle',
    options: { support: true },
    payload: {
      v: 1,
      supportIndex: 2,
      heroes: [
        slot(10011, { lv: 55, skillTree: true, bloom: true, active: 10021, passives: [10031, 10041, 10051], plv: 120, fans: 300, engrave: 40 }),
        slot(10021, { active: 10011, passives: [10031] }),
        slot(10031, { active: 10021, passives: [10051, 10061], skillTree: false }),
        slot(10041, { active: 10051 }),
        slot(10051, { bloom: true, passives: [10061, 10071, 10081], lv: 59 }),
      ],
    },
  },
  'bad-payload': {
    label: 'Invalid payload (duplicates, bloom off with 3 passives)',
    options: { support: true },
    payload: {
      v: 1,
      supportIndex: 0,
      heroes: [slot(10011), slot(10021, { passives: [10031, 10041, 10051] }), slot(10021, { active: 10021 })],
    },
  },
  'unknown-ids': {
    label: 'Unknown card ids (roster soft check, id chips)',
    options: { support: false },
    payload: { v: 1, supportIndex: null, heroes: [slot(99991, { active: 99992, passives: [99993] }), slot(10011)] },
  },
}

const SAMPLE_SERVER_ERRORS: FieldError[] = [
  { path: 'payload.heroes.0.lv', code: 'int_range', message: 'Must be an integer from 1 to 60.', params: { min: 1, max: 60 } },
  { path: 'payload.heroes', code: 'duplicate_hero', message: 'Slots 1, 2 use the same hero.', params: { slots: '1,2' } },
  { path: 'payload.supportIndex', code: 'support_required', message: 'Choose which slot is the borrowed support.' },
  { path: 'payload.heroes.0.passives.1', code: 'unknown_sidekick', message: 'Unknown sidekick.', params: { stockId: 424242 } },
  { path: 'heroes.1.active', code: 'brand_new_code', message: 'Server says: English fallback message for an unknown code.' },
]

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T

const state = {
  scenario: 'quest-support',
  lang: 'en' as Lang,
  theme: 'light',
  roster: 'fixture',
  payload: null as TeamPayload | null,
  handle: null as EditorHandle | null,
  cleanups: [] as (() => void)[],
}

const ctx = (): PluginContext => ({
  uiLang: state.lang,
  theme: state.theme === 'dark' ? 'dark' : 'light',
  group: { id: 'dev-group', options: SCENARIOS[state.scenario].options },
})

function applyRoster() {
  if (state.roster === 'fixture') setRosterSource(fixture as unknown as RosterFile)
  else if (state.roster === 'real') setRosterSource(new URL('/api/team-roster.json', location.href))
  else setRosterSource(new URL('/api/does-not-exist.json', location.href))
}

function showPayload() {
  $('payload').textContent = JSON.stringify(state.payload, null, 2)
}
function showValidation(errors: FieldError[]) {
  $('validation').textContent = errors.length ? JSON.stringify(errors, null, 2) : '[] (valid)'
}

function mountViews() {
  state.cleanups.forEach((c) => c())
  state.cleanups = [
    plugin.mountSummary($('summary'), state.payload!, ctx()),
    plugin.mountDetail($('detail'), state.payload!, ctx()),
  ]
}

function mountEditor() {
  state.handle?.destroy()
  const sc = SCENARIOS[state.scenario]
  state.payload = structuredClone(sc.payload ?? plugin.defaultPayload())
  state.handle = plugin.mountEditor(
    $('editor'),
    {
      value: state.payload,
      errors: [],
      onChange: (p) => {
        state.payload = p
        showPayload()
        mountViews()
        // Pure validation: handle.validate() would also reveal the quiet errors inside the editor.
        showValidation(validateTeam(p, SCENARIOS[state.scenario].options))
      },
    },
    ctx(),
  )
  showPayload()
  mountViews()
  showValidation([])
}

function remountAll() {
  document.documentElement.setAttribute('data-theme', state.theme)
  if (!state.theme) document.documentElement.removeAttribute('data-theme')
  applyRoster()
  mountEditor()
  void mountFilter()
}

// ---- list filter harness
const SAMPLES: { name: string; payload: TeamPayload }[] = [
  { name: 'A: sim, heroes 10011+10021', payload: { v: 1, supportIndex: null, target: 'quest-616001', heroes: [slot(10011), slot(10021)] } },
  { name: 'B: rogue, bloom + tree', payload: { v: 1, supportIndex: 0, target: 'rogue-2609', heroes: [slot(10011, { bloom: true, skillTree: true }), slot(10031)] } },
  { name: 'C: general, 4 heroes', payload: { v: 1, supportIndex: null, heroes: [slot(10012), slot(10021, { active: 10011 }), slot(10031), slot(10041)] } },
]
let filterState: FilterState = defaultFilterState()
let filterRoster: Roster | null = null

function showFilter() {
  const matches = SAMPLES.filter((x) => testPayload(x.payload, filterState, filterRoster)).sort((a, b) => limitedCount(a.payload, filterRoster) - limitedCount(b.payload, filterRoster))
  $('filter-state').textContent = JSON.stringify(toParams(filterState)) + ' | activeCount(advanced): ' + activeCount(filterState) + ' | matches: ' + (matches.map((x) => x.name).join(' | ') || '(none)')
}

// The Team Creator page (web/team-creator) renders FilterPanel the same way: the state lives in the host.
function drawFilter() {
  const c = ctx()
  const onChange = (s: FilterState) => {
    filterState = s
    drawFilter()
    showFilter()
  }
  render(h(FilterPanel, { part: 'basic', state: filterState, onChange, ctx: c }), $('filter-basic'))
  render(h(FilterPanel, { part: 'advanced', state: filterState, onChange, ctx: c }), $('filter-advanced'))
}

async function mountFilter() {
  ensureStyles()
  try {
    filterRoster = await loadRoster()
  } catch {
    filterRoster = null
  }
  filterState = parseParams(new URLSearchParams(location.hash.slice(1)))
  drawFilter()
  showFilter()
}

// ---- controls
const scenarioSel = $<HTMLSelectElement>('scenario')
for (const [k, v] of Object.entries(SCENARIOS)) scenarioSel.add(new Option(v.label, k))
const params = new URLSearchParams(location.search)
state.scenario = params.get('scenario') && SCENARIOS[params.get('scenario')!] ? params.get('scenario')! : state.scenario
state.lang = (params.get('lang') as Lang) || 'en'
state.theme = params.get('theme') ?? 'light'
state.roster = params.get('roster') ?? 'fixture'
scenarioSel.value = state.scenario
$<HTMLSelectElement>('lang').value = state.lang
$<HTMLSelectElement>('theme').value = state.theme
$<HTMLSelectElement>('roster').value = state.roster
document.documentElement.lang = state.lang

scenarioSel.onchange = () => { state.scenario = scenarioSel.value; remountAll() }
$<HTMLSelectElement>('lang').onchange = (e) => { state.lang = (e.target as HTMLSelectElement).value as Lang; document.documentElement.lang = state.lang; remountAll() }
$<HTMLSelectElement>('theme').onchange = (e) => { state.theme = (e.target as HTMLSelectElement).value; remountAll() }
$<HTMLSelectElement>('roster').onchange = (e) => { state.roster = (e.target as HTMLSelectElement).value; remountAll() }
$<HTMLInputElement>('hostvars').onchange = (e) => {
  document.documentElement.setAttribute('data-host-vars', (e.target as HTMLInputElement).checked ? 'on' : 'off')
}
$('btn-validate').onclick = () => showValidation(state.handle!.validate())
$('btn-errors').onclick = () => state.handle!.setErrors(SAMPLE_SERVER_ERRORS)
$('btn-clear').onclick = () => state.handle!.setErrors([])
$('btn-remount').onclick = () => mountEditor()
$('btn-filter-reset').onclick = () => { filterState = defaultFilterState(); drawFilter(); showFilter() }

// Test hooks for the browser checks.
;(window as unknown as Record<string, unknown>).__dev = state

remountAll()
