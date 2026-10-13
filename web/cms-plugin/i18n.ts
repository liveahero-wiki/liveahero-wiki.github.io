// `plugin-api.ts` (a verbatim copy of wiki-cms/src/shared/plugin-api.ts) imports `Lang` from here;
// in wiki-cms this module also holds the language helpers, the plugin only needs the type.
export type Lang = 'en' | 'zh-Hans' | 'zh-Hant' | 'ja'
