// `plugin-api.ts` and `api-types.ts` (verbatim copies of wiki-cms/src/shared/) import `Lang` / `I18nText` from here;
// in wiki-cms this module also holds the language helpers, the plugin only needs the types (web/shared/lang.ts).
export type { I18nText, Lang } from '../shared/lang.ts'
