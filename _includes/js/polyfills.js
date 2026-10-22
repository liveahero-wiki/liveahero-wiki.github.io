// Loads polyfills only in browsers that lack the feature, so everyone else downloads nothing.
//  - popover (Safari < 17, so every iOS 15/16): @oddbird/popover-polyfill
//  - <dialog> (Safari < 15.4): dialog-polyfill. Dialogs are also created by scripts, so they are
//    registered on first show()/showModal() instead of once up front.
// Both come from node_modules (see the passthrough copy in eleventy.config.js). The CSS side is in
// the stylesheets: `:popover-open` is an invalid selector there, so rules use `:where(:popover-open, .\:popover-open)`.
(function () {
  function load(tag, attrs) {
    var el = document.createElement(tag);
    for (var k in attrs) el[k] = attrs[k];
    document.head.appendChild(el);
    return el;
  }

  if (!('popover' in HTMLElement.prototype)) {
    load('script', { src: '/assets/polyfills/popover.js' });
  }

  if (!window.HTMLDialogElement || !HTMLDialogElement.prototype.showModal) {
    load('link', { rel: 'stylesheet', href: '/assets/polyfills/dialog.css' });
    load('script', { src: '/assets/polyfills/dialog.js' }).onload = function () {
      var register = window.dialogPolyfill.forceRegisterDialog; // registerDialog() would skip elements that already have our showModal
      ['show', 'showModal'].forEach(function (method) {
        // forceRegisterDialog() puts the real method on the element, which then shadows this one.
        HTMLElement.prototype[method] = function () {
          register(this);
          return this[method].apply(this, arguments);
        };
      });
      Array.prototype.forEach.call(document.querySelectorAll('dialog'), register);
    };
  }
})();
