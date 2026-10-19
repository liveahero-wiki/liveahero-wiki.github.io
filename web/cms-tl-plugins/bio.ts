// lah-bio-tl: moderator views for one bio translation suggestion, in the submission's `lang` (shown by the admin card),
// so the headings are language-neutral.
// Built (with dom.ts / styles.css) into the self-contained assets/cms/lah-bio-tl.js by vite.cms-tl-plugins.config.ts.

import type { EditorHandle, FieldError, PluginContext, SubmissionPlugin } from '../cms-plugin/plugin-api.ts'
import { append, clear, errorBox, errorsAt, h, mountRoot, nextId, relPath, showErrors, textBlock } from './dom.ts'
import { bioJp, loadBioRoster, type BioRoster } from './net.ts'
import { clip, readBio, type BioPayload } from './payload.ts'
import { NOTE_MAX, TEXT_MAX } from './text-rules.ts'
import { validateBio } from './validate.ts'

const TYPE = 'lah-bio-tl'

function withRoster(use: (r: BioRoster | null) => void): () => void {
  let alive = true
  void loadBioRoster().then((r) => alive && use(r))
  return () => {
    alive = false
  }
}

const dt = (label: string, id?: string) => h('dt', id ? { id } : null, label)

function summary(el: HTMLElement, raw: unknown): () => void {
  const p = readBio(raw)
  const { root, unmount } = mountRoot(el)
  append(
    root,
    h('div', { class: 'cms-lah-tl-row' }, h('strong', { class: 'cms-lah-tl-mono' }, p.key || '(no key)')),
    p.text ? h('div', { class: 'cms-lah-tl-quote cms-lah-tl-text' }, clip(p.text, 80)) : null,
  )
  return unmount
}

function jpBlock(): { dd: HTMLElement; fill(jp: string): void } {
  const dd = h('dd', { lang: 'ja' }, h('span', { class: 'cms-lah-tl-muted' }, '...'))
  return {
    dd,
    fill(jp) {
      clear(dd)
      dd.append(textBlock(jp, { lang: 'ja', empty: 'Japanese text not available' }))
    },
  }
}

function detail(el: HTMLElement, raw: unknown): () => void {
  const p = readBio(raw)
  const { root, unmount } = mountRoot(el)
  const jp = jpBlock()
  append(
    root,
    h(
      'dl',
      { class: 'cms-lah-tl-pair' },
      dt('Key'),
      h('dd', { class: 'cms-lah-tl-mono' }, p.key),
      dt('JP'),
      jp.dd,
      dt('Current text'),
      h('dd', null, textBlock(p.base, { empty: 'no current text' })),
      dt('Suggested text'),
      h('dd', null, h('div', { class: 'cms-lah-tl-text' }, p.text)),
      p.note ? dt('Note') : null,
      p.note ? h('dd', null, h('div', { class: 'cms-lah-tl-text' }, p.note)) : null,
    ),
  )
  const stop = withRoster((r) => jp.fill(bioJp(r, p.key)))
  return () => {
    stop()
    unmount()
  }
}

function editor(el: HTMLElement, init: { value: unknown; onChange(p: unknown): void; errors: FieldError[] }): EditorHandle {
  const initial = readBio(init.value)
  const cur: BioPayload = { ...initial }
  let note = initial.note ?? ''
  let shown: FieldError[] = init.errors
  const emit = (): void => {
    const out: BioPayload = { key: cur.key, base: cur.base, text: cur.text }
    if (note.trim()) out.note = note
    init.onChange(out)
  }

  const { root, unmount } = mountRoot(el)
  const jp = jpBlock()
  const keyErrs = errorBox()
  const baseErrs = errorBox()
  const textErrs = errorBox()
  const noteErrs = errorBox()
  const generalErrs = errorBox()
  const count = h('div', { class: 'cms-lah-tl-count' })
  const textId = nextId('cms-lah-tl-bio')
  const noteId = nextId('cms-lah-tl-bio')
  const area = h('textarea', { class: 'cms-lah-tl-textarea', id: textId, rows: 6, value: cur.text })
  const noteArea = h('textarea', { class: 'cms-lah-tl-textarea', id: noteId, rows: 2, value: note })

  const updateCount = () => {
    const n = area.value.replace(/\r\n?/g, '\n').trim().length
    count.textContent = `${n} / ${TEXT_MAX}`
    count.className = n > TEXT_MAX ? 'cms-lah-tl-count cms-lah-tl-count-over' : 'cms-lah-tl-count'
  }
  updateCount()

  function applyErrors(): void {
    showErrors(generalErrs, shown.filter((e) => relPath(e.path) === ''))
    showErrors(keyErrs, errorsAt(shown, 'key'))
    showErrors(baseErrs, errorsAt(shown, 'base'))
    showErrors(textErrs, errorsAt(shown, 'text'), [area])
    showErrors(noteErrs, errorsAt(shown, 'note'), [noteArea])
  }

  area.addEventListener('input', () => {
    cur.text = area.value
    updateCount()
    shown = shown.filter((e) => relPath(e.path) !== 'text')
    showErrors(textErrs, [], [area])
    emit()
  })
  noteArea.addEventListener('input', () => {
    note = noteArea.value
    shown = shown.filter((e) => relPath(e.path) !== 'note')
    showErrors(noteErrs, [], [noteArea])
    emit()
  })

  append(
    root,
    generalErrs,
    h(
      'dl',
      { class: 'cms-lah-tl-pair' },
      dt('Key'),
      h('dd', null, h('span', { class: 'cms-lah-tl-mono' }, cur.key), keyErrs),
      dt('JP'),
      jp.dd,
      dt('Current text'),
      h('dd', null, textBlock(cur.base, { empty: 'no current text' }), baseErrs),
      h('dt', null, h('label', { for: textId }, 'Suggested text')),
      h('dd', null, area, count, textErrs),
      h('dt', null, h('label', { for: noteId }, 'Note')),
      h('dd', null, noteArea, h('p', { class: 'cms-lah-tl-hint' }, `Optional, from the contributor. Plain text, at most ${NOTE_MAX} characters.`), noteErrs),
    ),
  )
  applyErrors()
  const stop = withRoster((r) => jp.fill(bioJp(r, cur.key)))

  return {
    destroy() {
      stop()
      unmount()
    },
    validate() {
      const errors = validateBio({ key: cur.key, base: cur.base, text: cur.text, ...(note.trim() ? { note } : {}) })
      shown = errors
      applyErrors()
      return errors
    },
    setErrors(errors) {
      shown = errors
      applyErrors()
    },
  }
}

const plugin: SubmissionPlugin<BioPayload> = {
  apiVersion: 1,
  type: TYPE,
  defaultPayload: () => ({ key: '', base: '', text: '' }),
  mountSummary: (el: HTMLElement, payload: BioPayload, _ctx: PluginContext) => summary(el, payload),
  mountDetail: (el: HTMLElement, payload: BioPayload, _ctx: PluginContext) => detail(el, payload),
  mountEditor: (el, init, _ctx) => editor(el, init),
}

export default plugin
