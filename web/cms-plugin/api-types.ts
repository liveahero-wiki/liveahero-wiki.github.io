// Copied verbatim into lah-wiki `web/cms-plugin/api-types.ts`; the public blob types are a contract with the wiki (docs/TEAM_CREATOR.md, "The blob is a contract with the wiki").
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
  /** Null for types without a markdown explanation (their payload says everything). */
  explanation: { maxLength: number; template: Record<Lang, string> } | null
  /** Null for types without a demo link. */
  demoUrl: { required: boolean; allowedHosts: string[] } | null
  turnstileSiteKey: string
  disclaimer: I18nText | null
  /** 'account': submitting needs a contributor sign-in (see ContribApi below); anonymous POSTs are refused. Absent on older Workers = 'anonymous'. */
  submitAuth?: 'anonymous' | 'account'
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

// ---- contributor API (/api/contrib, bearer token only) ----

/** Messages the sign-in popup (`/api/contrib/auth/done`) posts to `window.opener`. */
export type ContribAuthMessage =
  | { type: 'cms-contrib'; token: string; user: ContribUser; /** New account on a provider that returns a real name: the wiki asks the contributor to choose a display name. */ needsDisplayName?: true }
  | { type: 'cms-contrib-error'; code: 'account_too_young' | 'unauthenticated' | 'unavailable'; eligibleAt?: number | null }

export interface ContribUser {
  id: string
  displayName: string
  image: string | null
}
/** GET /api/contrib/me */
export interface ContribMeResponse {
  user: ContribUser
}

/** Editable fields of a submission or of a proposed revision of it. */
export interface ContribContent {
  title: string
  payload: unknown
  tags: Record<string, string>
  lang: Lang
  explanation: string
  demoUrl: string
}
export interface ContribRevision extends ContribContent {
  state: 'pending' | 'rejected'
  createdAt: number
  decidedAt: number | null
  /** Moderator's note on a rejected edit. */
  rejectReason: string | null
}
/** `state` never exposes 'spam': it is reported as 'pending'. */
export interface ContribSubmission extends ContribContent {
  id: string
  type: string
  groupId: string
  state: 'pending' | 'approved'
  /** Send back as `expectedVersion` when editing. */
  version: number
  createdAt: number
  updatedAt: number
  /** The latest proposed edit while it is pending review, or the latest rejected one. */
  revision: ContribRevision | null
  /** What happened to it after approval (a pull request, the sheet sync), or null. `status` values are owned by the type. */
  outcome: ExternalOutcome | null
}
/** `external.outcome` of a submission: the part the owner may see. */
export interface ExternalOutcome {
  status: string
  /** Where to look (for example the pull request). https only. */
  url?: string
  /** Short human-readable note. */
  label?: string
}
/** GET /api/contrib/submissions?type= */
export interface ContribSubmissionsResponse {
  items: ContribSubmission[]
}
/** POST /api/contrib/submissions/:type/:group (body): same as SubmitRequest. */
export type ContribSubmitRequest = SubmitRequest
/** PUT /api/contrib/submissions/:id (body) */
export interface ContribEditRequest extends Omit<SubmitRequest, 'tags'> {
  tags: Record<string, string>
  expectedVersion: number
}
/** PUT response. `revision_pending`: the edit is queued; the published version stays live until a moderator approves it. */
export interface ContribEditResponse {
  id: string
  state: 'pending' | 'revision_pending'
  version: number
}
/** PATCH /api/contrib/me (body) */
export interface ContribUpdateMeRequest {
  displayName: string
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
  /** The type's own record of what happened after approval (see ExternalOutcome), or null. */
  external: { outcome?: ExternalOutcome; [key: string]: unknown } | null
  externalAt: number | null
  /** Contributor who submitted it; null for legacy anonymous rows. Only set by the list/detail endpoints. */
  owner?: AdminOwner | null
  /** Id of the contributor's pending edit, if any. Only set by the list/detail endpoints. */
  pendingRevisionId?: string | null
}
export interface AdminOwner {
  id: string
  displayName: string
  /** Provider account (e.g. the Discord id), for moderators to recognise the person. */
  provider: string | null
  accountId: string | null
}
/** A contributor's proposed edit, with the submission it would replace. */
export interface AdminRevision {
  id: string
  submissionId: string
  state: 'pending' | 'approved' | 'rejected' | 'withdrawn'
  /** The submission `version` the contributor saw; a larger current version means a moderator changed it since. */
  baseVersion: number
  title: string
  payload: unknown
  tags: Record<string, string>
  lang: Lang
  explanation: string
  explanationHtml: string
  demoUrl: string
  rejectReason: string | null
  createdAt: number
  decidedAt: number | null
  decidedBy: string | null
  owner: AdminOwner | null
  /** The current (published) version. */
  submission: AdminSubmission
}
/** GET /types/:type/revisions?state=&cursor=&limit= */
export interface RevisionsResponse {
  items: AdminRevision[]
  nextCursor: string | null
}
/** POST /revisions/:id/approve (body) */
export interface ApproveRevisionRequest {
  /** The submission's current `version`. */
  expectedVersion: number
}
/** POST /revisions/:id/reject (body) */
export interface RejectRevisionRequest {
  reason?: string
}
/** GET /contributors?q= */
export interface ContributorsResponse {
  contributors: (AdminOwner & { createdAt: number })[]
}
/** POST /submissions/:id/owner (body); `userId: null` clears the owner. */
export interface SetOwnerRequest {
  userId: string | null
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
