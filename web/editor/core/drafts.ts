// Unsent drafts of the page editor, kept in localStorage per page and base version (cleared on success).
// Every access is wrapped in try/catch: storage can be blocked or throw. `storage` is injectable for tests.

export interface Draft {
  body: string
  summary: string
  savedAt: number
}

export const draftKey = (path: string, baseSha: string): string => `lah-edit-draft:${path}:${baseSha}`

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function defaultStore(): Store | null {
  try {
    return localStorage
  } catch {
    return null
  }
}

export function readDraft(path: string, baseSha: string, store: Store | null = defaultStore()): Draft | null {
  try {
    const raw = store?.getItem(draftKey(path, baseSha))
    if (!raw) return null
    const d = JSON.parse(raw) as Partial<Draft>
    return typeof d.body === 'string' ? { body: d.body, summary: typeof d.summary === 'string' ? d.summary : '', savedAt: Number(d.savedAt) || 0 } : null
  } catch {
    return null
  }
}

/** Saves the draft, or removes it when `d` is null. Never throws. */
export function writeDraft(path: string, baseSha: string, d: { body: string; summary: string } | null, store: Store | null = defaultStore(), now = Date.now()): void {
  try {
    if (!store) return
    if (d) store.setItem(draftKey(path, baseSha), JSON.stringify({ ...d, savedAt: now }))
    else store.removeItem(draftKey(path, baseSha))
  } catch {
    /* quota or blocked storage: the draft is a convenience only */
  }
}
