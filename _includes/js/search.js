let pagefindAssetsPromise = null;
let pagefindLoaded = false;

const loadPagefindAssets = () => {
  if (pagefindAssetsPromise) return pagefindAssetsPromise;

  pagefindAssetsPromise = new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/pagefind/pagefind-component-ui.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.type = 'module';
    script.src = '/pagefind/pagefind-component-ui.js';
    script.addEventListener('load', () => {
      pagefindLoaded = true;
      resolve();
    }, { once: true });
    document.head.appendChild(script);
  });

  return pagefindAssetsPromise;
};

const openSearch = () => {
  loadPagefindAssets().then(() => {
    document.querySelector('pagefind-modal-trigger')?.querySelector('button')?.click();
  });
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#search-toggle')?.addEventListener('click', openSearch);
});

document.addEventListener('keydown', (event) => {
  // Once Pagefind's own assets have loaded, it registers its own Ctrl+K/Cmd+K
  // handling (see aria-keyshortcuts on its trigger button) - defer to that
  // instead of forwarding, to avoid double-toggling the modal.
  if (pagefindLoaded) return;

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    openSearch();
  }
});
