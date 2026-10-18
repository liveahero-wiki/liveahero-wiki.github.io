// Standalone harness: vite --config vite.cms-tl-plugins.config.ts --port 5192, then open http://localhost:5192/dev.html
// Mounts each plugin's summary / detail / editor with realistic payloads. `fetch` is mocked for the wiki rosters,
// /api/contrib-includes.json and the two GitHub API calls (blobs, contents).
import bio from '../bio.ts'
import { resetNetCache, setBaseUrl } from '../net.ts'
import page from '../page-edit.ts'
import voice from '../voice.ts'
import type { EditorHandle, FieldError, PluginContext, SubmissionPlugin } from '../../cms-plugin/plugin-api.ts'

const SHA_A = 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678'
const SHA_BIG = 'b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0'
const SHA_CURRENT = 'c0ffee00c0ffee00c0ffee00c0ffee00c0ffee00'
const SHA_MISSING = 'dead0000dead0000dead0000dead0000dead0000'

// ---- fixtures

const FRONT = '---\ntitle: Ryekie\ncharacterId: 4\ntype: anthro\n---\n'
const PAGE_BASE = `## Profile

Ryekie works in the Hero Office as a salesperson. He is friendly with everybody, and never says no to a customer.

## Skills

{% include skill-table-manual.html id=101 %}

{% for quest in site.data.quests %}
* {{ quest.name }}: {{ quest.stamina }} stamina
{% endfor %}

## Gameplay

He is a good opener and a fine support. His active skill hits the whole row and applies a damage-over-time effect for three turns.
Pair him with a hero that can trigger passives for more value.

* Best with Dr. Ceph
* Works fine in the simulator
* Avoid in the arena

## Notes

* His birthday is 10/22.
* He appears in the second chapter.
* He sells the best coffee in the office.

## Trivia

The name comes from an internal joke.
Nobody remembers which one.

## Gallery

<table>
  <tr><td>Concept art</td><td>Sprite</td></tr>
</table>
`

const PAGE_AFTER = `## Profile

Ryekie works in the Hero Office as a salesperson. He is friendly with everybody, and never says no to a customer. He often stays late to help the others.

## Skills

{% include skill-table-manual.html id=101 %}

{% for quest in site.data.quests %}
* {{ quest.name }}: {{ quest.stamina }} stamina
{% endfor %}

## Gameplay

He is a good opener and a fine support. His active skill hits the whole row and applies a damage-over-time effect for three turns.
Pair him with a hero that can trigger passives for more value.

* Best with Dr. Ceph
* Works fine in the simulator
* Avoid in the arena

## Usage guide

1. Open with the active skill on turn one.
2. Keep two passives ready for the third turn.
3. Swap him out when the damage-over-time effect expires.

## Notes

* His birthday is 10/22.
* He appears in the second chapter.

## Trivia

The name comes from an internal joke.
Nobody remembers which one.

## Gallery

<table>
  <tr><td>Concept art</td><td>Sprite</td></tr>
</table>
`

// A protected template changed and a script added: the advisory guard must complain.
const PAGE_BAD = PAGE_AFTER.replace('{% for quest in site.data.quests %}', '{% for quest in site.data.events %}') + '\n<script>alert(1)</script>\n{% include header.html %}\n'

// ~35 KB page with scattered edits (the biggest real page, guide/sale.md, is 35 KB).
function bigPage(edited: boolean): string {
  const lines: string[] = []
  for (let i = 1; i <= 900; i++) {
    let l = i % 15 === 0 ? `## Section ${i / 15}` : i % 15 === 1 ? '' : `Paragraph ${i}: the quick brown fox jumps over the lazy dog, sale item ${i * 7} costs ${i * 13} coins.`
    if (edited && i % 97 === 0) l += ' (corrected)'
    lines.push(l)
  }
  if (edited) lines.splice(450, 0, 'A brand new paragraph about the weekly reset.', '')
  return lines.join('\n') + '\n'
}

const VOICE_ROSTER = {
  version: 'dev',
  resources: {
    ryekie: {
      voice_ryekie_action: { jp: 'いくぞ！', en: "Let's go!" },
      voice_ryekie_win: { jp: 'やったぜ、大勝利だ！\nみんなのおかげだな。' },
      voice_ryekie_skill_1: { jp: 'これでどうだ！' },
      voice_ryekie_lose: { jp: '悔しいな……次こそは。' },
    },
  },
}
const BIO_ROSTER = {
  version: 'dev',
  bios: {
    DETAIL_CEPH_H01: { jp: 'ヒーロー事務所に勤める医師。\n穏やかな性格で、患者からの信頼も厚い。趣味は園芸。' },
  },
}
const INCLUDES = { includes: ['item.html', 'item-icon.html', 'quest-group.html', 'shop-table.html', 'skill-table-manual.html', 'apache-chart.html'] }

const BLOBS: Record<string, string> = {
  [SHA_A]: FRONT + PAGE_BASE,
  [SHA_BIG]: FRONT + bigPage(false),
  // master moved on after the contributor started: someone added a trivia sentence
  [SHA_CURRENT]: FRONT + PAGE_BASE.replace('Nobody remembers which one.', 'Nobody remembers which one. (Added on master.)'),
}

// ---- scenarios

interface Scenario {
  label: string
  payload: unknown
}

const longLines = Array.from({ length: 24 }, (_, i) => ({
  key: `voice_ryekie_extra_${i + 1}`,
  base: i % 3 === 0 ? '' : `Existing text ${i + 1}`,
  text: `Suggested wording number ${i + 1}, a bit longer so that the cell wraps over a couple of lines in the narrow layout.`,
}))

const SCENARIOS: Record<string, Record<string, Scenario>> = {
  voice: {
    typical: {
      label: 'Typical: 4 lines (one multi-line, one with no current EN, one without JP in the roster)',
      payload: {
        resourceName: 'ryekie',
        lines: [
          { key: 'voice_ryekie_action', base: "Let's go!", text: 'Here we go!' },
          { key: 'voice_ryekie_win', base: '', text: 'We did it, a great victory!\nThanks to everyone.' },
          { key: 'voice_ryekie_skill_1', base: 'Try this!', text: 'How about this one!' },
          { key: 'voice_ryekie_not_in_roster', base: 'Hmm.', text: 'Hmm, interesting.' },
        ],
        note: 'Translated by ear from the voice clip; the second line is two sentences.',
      },
    },
    many: { label: '28 lines (scrolling, narrow layout)', payload: { resourceName: 'ryekie', lines: [{ key: 'voice_ryekie_action', base: "Let's go!", text: 'Here we go!' }, ...longLines, { key: 'voice_ryekie_lose', base: '', text: 'So frustrating... next time.' }, { key: 'voice_ryekie_win', base: 'x', text: 'We won!' }, { key: 'voice_ryekie_skill_1', base: 'Try this!', text: 'How about this!' }] } },
    bad: {
      label: 'Invalid: markup, same as base, empty, too long, foreign key',
      payload: {
        resourceName: 'ryekie',
        lines: [
          { key: 'voice_ryekie_action', base: "Let's go!", text: '<b>Go</b> now!' },
          { key: 'voice_ryekie_win', base: 'Same', text: 'Same' },
          { key: 'voice_ryekie_skill_1', base: '', text: '' },
          { key: 'voice_ryekie_lose', base: '', text: 'x'.repeat(2100) },
          { key: 'voice_other_action', base: '', text: 'Wrong resource' },
        ],
      },
    },
    single: { label: 'One short line, no note', payload: { resourceName: 'ryekie', lines: [{ key: 'voice_ryekie_action', base: '', text: 'Let us begin.' }] } },
  },
  bio: {
    typical: {
      label: 'Typical (JP 2 paragraphs, no current EN, with note)',
      payload: { key: 'DETAIL_CEPH_H01', base: '', text: 'A doctor working at the Hero Office.\nHe is gentle, and trusted by his patients. His hobby is gardening.', note: 'Used the wiki glossary: "Hero Office".' },
    },
    base: { label: 'Has a current (machine) EN', payload: { key: 'DETAIL_CEPH_H01', base: 'A doctor at the hero office. He gentle.', text: 'A doctor working at the Hero Office. He is gentle and trusted by his patients.' } },
    bad: { label: 'Invalid: markup and a template in the text', payload: { key: 'DETAIL_CEPH_H01', base: 'Same', text: '<i>Doctor</i> {{ site.title }}', note: 'x'.repeat(600) } },
    unknown: { label: 'Key not in the roster (JP shows a dash)', payload: { key: 'DETAIL_NOBODY_H02', base: '', text: 'Someone.' } },
  },
  page: {
    edit: { label: 'Normal edit: sentence added, usage guide added, a note removed', payload: { path: '_charas/ryekie.md', baseSha: SHA_A, after: PAGE_AFTER, summary: 'Add usage guide and expand the profile' } },
    violation: { label: 'Guard violations (changed {% for %}, new <script>, denied include)', payload: { path: '_charas/ryekie.md', baseSha: SHA_A, after: PAGE_BAD, summary: 'Tweak the quest list' } },
    noop: { label: 'No changes', payload: { path: '_charas/ryekie.md', baseSha: SHA_A, after: PAGE_BASE, summary: 'No-op edit' } },
    big: { label: '~35 KB page, scattered edits', payload: { path: 'guide/sale.md', baseSha: SHA_BIG, after: bigPage(true), summary: 'Fix typos across the sale guide' } },
    missing: { label: 'Base blob missing on GitHub (404)', payload: { path: 'mobs.md', baseSha: SHA_MISSING, after: 'New text\n', summary: 'Stale base' } },
    invalid: { label: 'Invalid: bad path/sha, front matter fence, short summary', payload: { path: '_posts/x.md', baseSha: 'xyz', after: '---\ntitle: nope\n---\nbody', summary: 'a' } },
  },
}

const PLUGINS: Record<string, SubmissionPlugin<any>> = { voice, bio, page }

const SAMPLE_ERRORS: Record<string, FieldError[]> = {
  voice: [
    { path: 'payload.lines.0.text', code: 'text_invalid', message: 'HTML is not allowed: remove < and >.' },
    { path: 'payload.lines.1.key', code: 'line_not_translatable', message: 'This line cannot be translated.' },
    { path: 'lines.2.text', code: 'text_required', message: 'A translation is required.' },
    { path: 'payload.note', code: 'note_too_long', message: 'At most 500 characters.' },
    { path: 'payload.lines', code: 'lines_length', message: 'Suggest 1 to 100 lines.' },
  ],
  bio: [
    { path: 'payload.text', code: 'text_same_as_base', message: 'The suggestion is the same as the current text.' },
    { path: 'payload.key', code: 'bio_not_translatable', message: 'This bio cannot be translated.' },
  ],
  page: [
    { path: 'payload.baseSha', code: 'base_sha_invalid', message: 'baseSha must be a 40-character git blob sha.' },
    { path: 'payload.after', code: 'after_front_matter', message: 'The text must not start with a front matter fence (---); front matter cannot be edited here.' },
    { path: 'summary', code: 'summary_length', message: 'The summary must be 3-120 characters.' },
  ],
}

// ---- mocked network

const state = { plugin: 'voice', scenario: 'typical', theme: 'light', net: 'ok', handle: null as EditorHandle | null, payload: null as unknown, cleanups: [] as (() => void)[] }

const utf8b64 = (s: string) => {
  const bytes = new TextEncoder().encode(s)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/(.{60})/g, '$1\n')
}
const json = (body: unknown, status = 200, headers: Record<string, string> = {}) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } })
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

window.fetch = async (input: RequestInfo | URL): Promise<Response> => {
  const url = String(input)
  const u = new URL(url, location.href)
  if (u.hostname === 'api.github.com') {
    if (state.net === 'slow') await sleep(3000)
    if (state.net === 'gh404') return json({ message: 'Not Found' }, 404)
    if (state.net === 'ghrate') return json({ message: 'API rate limit exceeded' }, 403, { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 1500) })
    const blob = /\/git\/blobs\/([0-9a-f]+)$/.exec(u.pathname)
    if (blob) return BLOBS[blob[1]] !== undefined ? json({ sha: blob[1], encoding: 'base64', content: utf8b64(BLOBS[blob[1]]) }) : json({ message: 'Not Found' }, 404)
    if (/\/contents\//.test(u.pathname)) return json({ type: 'file', sha: SHA_CURRENT, path: decodeURIComponent(u.pathname.split('/contents/')[1]) })
    return json({ message: 'unexpected' }, 500)
  }
  if (state.net === 'wikidown') return new Response('Not found', { status: 404 })
  if (u.pathname === '/api/voice-roster.json') return json(VOICE_ROSTER)
  if (u.pathname === '/api/bio-roster.json') return json(BIO_ROSTER)
  if (u.pathname === '/api/contrib-includes.json') return json(INCLUDES)
  return new Response('Not found', { status: 404 })
}
// What the plugin derives its /api/ urls from when it is loaded from assets/cms/<name>.js on the wiki.
setBaseUrl(`${location.origin}/assets/cms/lah-voice-tl.js`)

// ---- harness

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T
const ctx = (): PluginContext => ({ uiLang: 'en', theme: state.theme === 'dark' ? 'dark' : 'light', group: { id: 'all', options: {} } })
const show = (id: string, v: unknown) => ($(id).textContent = typeof v === 'string' ? v : JSON.stringify(v, null, 2))

function mountViews() {
  state.cleanups.forEach((c) => c())
  const p = PLUGINS[state.plugin]
  const payload = structuredClone(state.payload)
  state.cleanups = [p.mountSummary($('summary'), payload, ctx()), p.mountDetail($('detail'), payload, ctx())]
}

function mountEditor() {
  state.handle?.destroy()
  $('editor').replaceChildren()
  const p = PLUGINS[state.plugin]
  state.payload = structuredClone(SCENARIOS[state.plugin][state.scenario].payload)
  state.handle = p.mountEditor(
    $('editor'),
    {
      value: structuredClone(state.payload),
      errors: [],
      onChange: (v) => {
        state.payload = v
        show('payload', v)
      },
    },
    ctx(),
  )
  show('payload', state.payload)
  show('validation', '(not run)')
  mountViews()
}

function fillScenarios() {
  const sel = $<HTMLSelectElement>('scenario')
  sel.replaceChildren()
  for (const [k, v] of Object.entries(SCENARIOS[state.plugin])) sel.add(new Option(v.label, k))
  if (!SCENARIOS[state.plugin][state.scenario]) state.scenario = Object.keys(SCENARIOS[state.plugin])[0]
  sel.value = state.scenario
}

function remount() {
  resetNetCache()
  document.documentElement.setAttribute('data-theme', state.theme)
  if (!state.theme) document.documentElement.removeAttribute('data-theme')
  mountEditor()
}

const params = new URLSearchParams(location.search)
state.plugin = params.get('plugin') && PLUGINS[params.get('plugin')!] ? params.get('plugin')! : 'voice'
state.scenario = params.get('scenario') ?? Object.keys(SCENARIOS[state.plugin])[0]
state.theme = params.get('theme') ?? 'light'
state.net = params.get('net') ?? 'ok'
fillScenarios()
$<HTMLSelectElement>('plugin').value = state.plugin
$<HTMLSelectElement>('theme').value = state.theme
$<HTMLSelectElement>('net').value = state.net
if (params.get('width')) {
  $('stage').style.width = params.get('width')!
  $<HTMLSelectElement>('width').value = params.get('width')!
}
if (params.get('hostvars') === '1') {
  $<HTMLInputElement>('hostvars').checked = true
  document.documentElement.setAttribute('data-host-vars', 'on')
}

$<HTMLSelectElement>('plugin').onchange = (e) => {
  state.plugin = (e.target as HTMLSelectElement).value
  fillScenarios()
  remount()
}
$<HTMLSelectElement>('scenario').onchange = (e) => {
  state.scenario = (e.target as HTMLSelectElement).value
  remount()
}
$<HTMLSelectElement>('theme').onchange = (e) => {
  state.theme = (e.target as HTMLSelectElement).value
  remount()
}
$<HTMLSelectElement>('net').onchange = (e) => {
  state.net = (e.target as HTMLSelectElement).value
  remount()
}
$<HTMLSelectElement>('width').onchange = (e) => {
  $('stage').style.width = (e.target as HTMLSelectElement).value
}
$<HTMLInputElement>('hostvars').onchange = (e) => document.documentElement.setAttribute('data-host-vars', (e.target as HTMLInputElement).checked ? 'on' : 'off')
$('btn-validate').onclick = () => show('validation', state.handle!.validate().map((e) => `${e.path}  [${e.code}]  ${e.message}`).join('\n') || '[] (valid)')
$('btn-errors').onclick = () => state.handle!.setErrors(SAMPLE_ERRORS[state.plugin])
$('btn-clear').onclick = () => state.handle!.setErrors([])
$('btn-remount').onclick = () => remount()
$('btn-views').onclick = () => mountViews()
;(window as unknown as Record<string, unknown>).__dev = state

remount()
