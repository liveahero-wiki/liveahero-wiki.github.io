// Copied verbatim into lah-wiki `web/cms-plugin/api-types.ts`; the public blob types are a contract with the wiki (docs/TEAM_CREATOR_WIKI_UI_PLAN.md W8).
// Request/response DTOs shared by the Worker, the embed and the admin portal. Pure types, no runtime imports.
import type { I18nText, Lang } from './i18n.ts'
import type { FieldError } from './plugin-api.ts'

export type { FieldError, I18nText, Lang }

export interface ApiErrorBody {
  error: { code: string; message: string; fields?: FieldError[] }
}

export type SubmissionState = 'pending' | 'approved' | 'spam'

// ---- public API (/api/v1) ----

export interface TagOptionDto {
  value: string
  label: I18nText
}
export interface TagDefDto {
  key: string
  label: I18nText
  required: boolean
  /** Preselected in the submit form. */
  default?: string
  options: TagOptionDto[]
}

/** GET /api/v1/types/:type */
export interface TypeConfig {
  type: string
  name: string
  langs: { value: Lang; label: string }[]
  tags: TagDefDto[]
  /** Present when the type has a per-item name. */
  title: { required: boolean; minLength: number; maxLength: number; label: I18nText; placeholder?: I18nText } | null
  explanation: { maxLength: number; template: Record<Lang, string> }
  demoUrl: { required: boolean; allowedHosts: string[] }
  turnstileSiteKey: string
  disclaimer: I18nText | null
}

export interface PublicItem {
  id: string
  createdAt: number
  /** '' for legacy rows without a name. */
  title: string
  lang: Lang
  tags: Record<string, string>
  demoUrl: string
  explanationHtml: string
  payload: unknown
}

/** GET /api/v1/submissions/:type/:group */
export interface PublicBlob {
  v: 1
  type: string
  group: string
  generatedAt: number
  /** Registry options of the group; pass to the plugin as ctx.group.options. */
  groupOptions: Record<string, unknown>
  /** `title` is true when the type has per-item names (cards then show a name or an "untitled" placeholder). */
  meta: { langs: { value: Lang; label: string }[]; tags: TagDefDto[]; title: boolean }
  items: PublicItem[]
}

/** POST /api/v1/submissions/:type/:group (body) */
export interface SubmitRequest {
  payload: unknown
  tags: Record<string, string>
  title?: string
  lang: Lang
  explanation: string
  demoUrl: string
  turnstileToken: string
  /** Honeypot; must be '' */
  website: string
}
/** 202 response */
export interface SubmitResponse {
  id: string
  state: 'pending'
}

// ---- admin API (/api/admin) ----

export interface AdminUser {
  id: string
  name: string
  image: string | null
}
/** GET /me */
export interface MeResponse {
  user: AdminUser
  types: { id: string; name: string; pluginUrl: string; enabled: boolean; hasCodeDef: boolean }[]
}

export interface AdminGroup {
  groupId: string
  title: string
  url: string | null
  options: Record<string, unknown>
  inRegistry: boolean
  pending: number
  approved: number
  spam: number
  latestAt: number | null
}
/** GET /types/:type/groups[?all=1] */
export interface GroupsResponse {
  groups: AdminGroup[]
}

export interface AdminSubmission {
  id: string
  type: string
  groupId: string
  state: SubmissionState
  version: number
  title: string
  payload: unknown
  tags: Record<string, string>
  lang: Lang
  explanation: string
  explanationHtml: string
  demoUrl: string
  createdAt: number
  updatedAt: number
  stateChangedAt: number
  moderatedBy: string | null
  /** Snapshot of the user-submitted fields before the first moderator edit (payload/tags parsed). */
  original: {
    payload: unknown
    tags: Record<string, string>
    /** Absent in snapshots taken before the title existed. */
    title?: string
    lang: Lang
    explanation: string
    demoUrl: string
    groupId: string
  } | null
  ip: string | null
  ipKey: string
  country: string | null
  aiVerdict: string | null
  aiReason: string | null
}
/** GET /types/:type/submissions?group=&state=&ipKey=&cursor=&limit= */
export interface SubmissionsResponse {
  items: AdminSubmission[]
  nextCursor: string | null
}
/** PATCH /submissions/:id (body) */
export interface EditSubmissionRequest {
  expectedVersion: number
  payload?: unknown
  tags?: Record<string, string>
  title?: string
  lang?: Lang
  explanation?: string
  demoUrl?: string
  groupId?: string
}
/** PATCH /submissions/:id and POST /submissions/:id/state responses */
export interface ModerationResponse {
  item: AdminSubmission
  /** Non-null when the cache purge failed (the action itself succeeded). */
  purgeWarning: string | null
}
export interface InviteDto {
  id: string
  types: string[]
  createdAt: number
  expiresAt: number
  status: 'active' | 'used' | 'expired' | 'revoked'
  usedBy: string | null
  usedAt: number | null
}
export interface AuditEntryDto {
  id: number
  at: number
  actor: string
  actorName: string
  action: string
  type: string | null
  target: string | null
  detail: unknown
}
