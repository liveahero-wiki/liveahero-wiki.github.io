// /api/editor-data.json (wiki_plugins/lib/editor-data.js documents its shape) -> what the page editor needs: the character and
// item lists of the pickers and the renderers of the preview, which call the REAL pure functions of the build
// (chara.js charaLink, item.js lahItem / lahItemIcon) on data rebuilt by `editorDataToRenderData`.

import { charaLink } from '../../../wiki_plugins/lib/chara.js'
import { editorDataToRenderData } from '../../../wiki_plugins/lib/editor-data.js'
import { lahItem, lahItemIcon } from '../../../wiki_plugins/lib/item.js'
import { fetchData } from '../core/data.ts'
import type { Renderers } from './preview.ts'

export interface CharaEntry {
  title: string
  url: string
}

export interface ItemEntry {
  id: number
  name: string
}

export interface EditorDataView {
  charas: CharaEntry[]
  items: ItemEntry[]
  renderers: Renderers
}

const obj = (v: unknown): Record<string, unknown> => (typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : {})

/** Picker lists: every chara page title, and the plain items (rewardType 3) by name. */
export function pickerLists(raw: unknown): { charas: CharaEntry[]; items: ItemEntry[] } {
  const o = obj(raw)
  const charas: CharaEntry[] = []
  if (Array.isArray(o.charas)) {
    for (const c of o.charas) {
      const e = obj(c)
      if (typeof e.title === 'string' && e.title) charas.push({ title: e.title, url: typeof e.url === 'string' ? e.url : '' })
    }
  }
  const items: ItemEntry[] = []
  for (const [id, v] of Object.entries(obj(obj(o.items)['3']))) {
    const name = obj(v).name
    const n = Number(id)
    if (Number.isInteger(n) && typeof name === 'string' && name) items.push({ id: n, name })
  }
  items.sort((a, b) => a.id - b.id)
  return { charas, items }
}


export function buildView(raw: unknown): EditorDataView {
  const { charas, items } = pickerLists(raw)
  // the build's functions are typed by JSDoc to their exact master shapes; the rebuilt data has them
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let deps: { charaDeps: any; itemData: any } | null = null
  try {
    deps = editorDataToRenderData(raw)
  } catch (e) {
    console.error('[editor] editor-data.json is not usable for the preview', e)
  }

  const renderers: Renderers = {
    chara(input) {
      if (!deps) return null
      try {
        return charaLink(input, deps.charaDeps) as string
      } catch {
        return null
      }
    },
    item(file, params) {
      if (!deps) return null
      const id = params.id === undefined ? null : Number(params.id)
      const rewardType = params.rewardType === undefined ? undefined : Number(params.rewardType)
      const name = typeof params.name === 'string' ? params.name : undefined
      try {
        // lahItem throws for an id the data does not have (a card without a page): the preview then shows a chip
        return (file === 'item.html' ? lahItem(id, rewardType, name, deps.itemData, deps.charaDeps) : lahItemIcon(id, rewardType, name, deps.itemData)) as string
      } catch {
        return null
      }
    },
  }
  return { charas, items, renderers }
}

export async function loadEditorData(): Promise<EditorDataView> {
  return buildView(await fetchData<unknown>('editor-data.json'))
}
