// Where the editor finds the wiki-cms API and the GitHub repository. Both are build-time site values
// (`site.cms_url`, `site.github_repo`), put on the clicked element or an ancestor as `data-cms-api` /
// `data-github-repo`; failing that, on any element of the page or a <meta name="cms-api"> tag.

export const DEFAULT_REPO = 'liveahero-wiki/liveahero-wiki.github.io'
export const DEFAULT_BRANCH = 'master'

export interface EditorConfig {
  /** wiki-cms origin, no trailing slash; '' when the page does not say. */
  api: string
  /** `owner/repo`. */
  repo: string
}

interface AttrSource {
  closest(selector: string): { getAttribute(name: string): string | null } | null
}
interface DocLike {
  querySelector(selector: string): { getAttribute(name: string): string | null } | null
}

/** `https://github.com/owner/repo(.git)(/)` or `owner/repo` -> `owner/repo`, else null. */
export function parseRepo(value: string | null | undefined): string | null {
  const v = (value ?? '').trim().replace(/\/+$/, '').replace(/\.git$/, '')
  const m = /^(?:https:\/\/github\.com\/)?([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)$/.exec(v)
  if (!m || m[1]!.split('/').some((p) => p === '.' || p === '..')) return null
  return m[1]!
}

export function readConfig(el: AttrSource, doc: DocLike): EditorConfig {
  const attr = (name: string): string | null => {
    const sel = `[${name}]`
    return el.closest(sel)?.getAttribute(name) || doc.querySelector(sel)?.getAttribute(name) || null
  }
  const api = (attr('data-cms-api') || doc.querySelector('meta[name="cms-api"]')?.getAttribute('content') || '').trim().replace(/\/+$/, '')
  const repo = parseRepo(attr('data-github-repo')) ?? parseRepo(doc.querySelector('meta[name="github-repo"]')?.getAttribute('content')) ?? DEFAULT_REPO
  return { api, repo }
}
