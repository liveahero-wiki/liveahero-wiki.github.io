// Picks the language skill names and descriptions are shown in, before the page paints, by setting
// <html data-skill-lang>. _sass/_skill-lang.scss shows the blocks that serve that language; the page
// itself carries every language (wiki_plugins/lib/skill-text.js), so there is nothing to fetch.
//
// This is the only language detection on the wiki: the apps under web/ (Skill Search, Team Creator, the
// editor) read <html data-skill-lang> and change it through setSkillLang (web/shared/lang.ts), so a
// language picked in any of them applies everywhere. Detection never writes anything; only a choice made
// with setSkillLang does. Tested by wiki_plugins/lib/skill-lang.test.js.
(function () {
  var KEY = 'skillSearchLang';
  var LANGS = ['en', 'zh-Hans', 'zh-Hant', 'ja'];

  function detect() {
    var tag = String((navigator && navigator.language) || '').toLowerCase();
    if (tag.indexOf('ja') === 0) return 'ja';
    if (tag.indexOf('zh') === 0) {
      if (tag.indexOf('hant') !== -1 || tag.indexOf('-tw') !== -1 || tag.indexOf('-hk') !== -1 || tag.indexOf('-mo') !== -1) {
        return 'zh-Hant';
      }
      return 'zh-Hans';
    }
    return 'en';
  }

  function initial() {
    try {
      var stored = localStorage.getItem(KEY);
      if (stored && LANGS.indexOf(stored) !== -1) return stored;
    } catch (e) { /* private mode: fall through to detection */ }
    return detect();
  }

  var root = document.documentElement;
  root.setAttribute('data-skill-lang', initial());

  window.setSkillLang = function (lang) {
    if (LANGS.indexOf(lang) === -1) return;
    try { localStorage.setItem(KEY, lang); } catch (e) { /* not fatal: applies to this page view */ }
    root.setAttribute('data-skill-lang', lang);
    document.dispatchEvent(new CustomEvent('skilllangchange', { detail: { lang: lang } }));
  };
})();
