// `plugin-api.ts` and `api-types.ts` (verbatim copies of wiki-cms/src/shared/) import `Lang` / `I18nText` from here;
// in wiki-cms this module also holds the language helpers, the plugin only needs the types.
export type Lang = 'en' | 'zh-Hans' | 'zh-Hant' | 'ja'
export type I18nText = { en: string } & Partial<Record<Lang, string>>
