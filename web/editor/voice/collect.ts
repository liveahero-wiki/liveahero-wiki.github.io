// Reads the translatable rows of a voice table (markup contract of _includes/voice-table.html):
//   <tr data-voice-key="voice_<resourceName>_<part>" data-translatable>
//     <td class="voice-jp-cell"> <div class="voice-key-badge">…</div> <div class="voice-text">JP or -</div> </td>
//     <td class="voice-translation-cell"> <div data-lang="en|hans|hant">text or -</div> … </td>
//   </tr>
// `data-tl-langs` lists the languages still open for the row (roster codes, e.g. "en hans hant"); missing means all.
// The button is `<button data-contrib="voice-suggest" data-resource-name="…">`.

import { LANG_CODE, langsOf, perLang, type TlLang } from '../core/langs.ts'
import { isPlaceholder, keyBelongs } from '../core/rules.ts'

export interface VoiceRow {
  key: string
  /** The resource (one of the table's names) the key belongs to. */
  resource: string
  /** The badge text of the row (what the page shows as its name). */
  label: string
  /** The Japanese text shown now, '' when the page shows the placeholder '-' (the game and the sheet have none). */
  jp: string
  /** No Japanese text yet: the contributor may transcribe it. */
  jpEditable: boolean
  /** The text shown now per language, '' when the page shows the placeholder '-'. */
  bases: Record<TlLang, string>
  /** The languages a contributor may suggest for this line: open per the roster; a Chinese text is translated from the Japanese, so it needs one. */
  langs: TlLang[]
}

/** Visible text of a cell: <br> become line breaks. */
export function cellText(el: Element): string {
  const clone = el.cloneNode(true) as Element
  clone.querySelectorAll('br').forEach((br) => br.replaceWith('\n'))
  return (clone.textContent ?? '').replace(/\r\n?/g, '\n').trim()
}

/** '-' (the page's "no text yet" mark) means there is no current text. */
export const baseOf = (shown: string): string => (isPlaceholder(shown) ? '' : shown.trim())

export function findTable(button: Element, resourceName: string): Element | null {
  const own = button.closest('.voice-table')
  if (own) return own
  for (const t of document.querySelectorAll('.voice-table')) {
    if ((t.getAttribute('data-resourcename') ?? '').toLowerCase() === resourceName.toLowerCase()) return t
  }
  return null
}

/** `data-resource-name` of a table is a comma list for the multi-name tables (`a,b`). */
export const resourceNames = (attr: string): string[] => attr.split(',').map((s) => s.trim()).filter(Boolean)

/** The name a key belongs to; the longest match wins (`voice_<name>_<part>`, parts can contain underscores). */
export function resourceOf(key: string, names: string[]): string | null {
  let best: string | null = null
  for (const n of names) if (keyBelongs(key, n) && (best === null || n.length > best.length)) best = n
  return best
}

export function collectRows(table: Element, names: string[]): VoiceRow[] {
  const rows: VoiceRow[] = []
  const seen = new Set<string>()
  table.querySelectorAll('tr[data-translatable]').forEach((tr) => {
    const key = tr.getAttribute('data-voice-key') ?? ''
    const resource = resourceOf(key, names)
    if (!resource || seen.has(key)) return
    seen.add(key)
    const jpEl = tr.querySelector('.voice-text')
    const jp = jpEl ? baseOf(cellText(jpEl)) : ''
    const bases = perLang((l) => {
      const cell = tr.querySelector(`[data-lang="${LANG_CODE[l]}"]`)
      return cell ? baseOf(cellText(cell)) : ''
    })
    rows.push({
      key,
      resource,
      label: tr.querySelector('.voice-key-badge')?.textContent?.trim() || key,
      jp,
      jpEditable: jp === '',
      bases,
      langs: langsOf(tr.getAttribute('data-tl-langs')).filter((l) => l === 'en' || jp !== ''),
    })
  })
  return rows
}
