function sortList(list, column, btn) {
  const oldOrder = parseInt(btn.dataset.order || '-1', 10);
  const newOrder = 0 - oldOrder;
  btn.dataset.order = newOrder;

  const array = [];
  for (const item of list.children) {
    const value = column == "name" ? item.dataset.name : parseInt(item.dataset[column], 10);
    array.push({ value: value, element: item });
  }
  array.sort((lhs, rhs) => {
    return lhs.value > rhs.value ? newOrder : lhs.value < rhs.value ? oldOrder : 0;
  });

  for (const x of array) {
    list.appendChild(x.element);
  }
}
document.querySelectorAll(".chara-sort").forEach(ele => {
  const list = document.querySelector(ele.dataset.list);
  const buttons = ele.querySelectorAll("button[data-sort]");
  for (const btn of buttons) {
    btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", () => {
      for (const b of buttons) {
        if (b !== btn) {
          b.dataset.order = "-1";
          b.setAttribute("aria-pressed", "false");
        }
      }
      sortList(list, btn.dataset.sort, btn);
      btn.setAttribute("aria-pressed", "true");
    });
  }
});

// The /charas/ page (charas.html): a sticky panel (.chara-panel) with Heroes/Sidekicks tabs, the name
// search and filters (assets/filter.js), and the collection controls.
//
// Collection mode: readers mark the heroes/sidekicks they own and share them as a link.
// The "My Collection" button goes into #float-btns (_includes/wiki-msg.html) and opens
// #collection-bar in the panel. The reader's own collection is saved in localStorage and mirrored
// into the URL hash, which is also the share link:
//   #collection/h:<compressed_ids>/s:<compressed_ids>
// compressed_ids is computed by taking difference of array[i]-array[i-1] for i>1
// do one run-length encoding, converted to base32, then joined by ','
// A link holding a different collection than the saved one opens read-only (the "shared" view),
// where it can be compared with or saved as the reader's own.
(function () {
  const base = 32;
  const storageKey = "lah-collection";
  const seenKey = "lah-collection-seen";
  const tabKey = "lah-charas-tab";
  const hasUnit = "has-unit";
  const kinds = ["h", "s"];
  const nouns = { h: ["hero", "heroes"], s: ["sidekick", "sidekicks"] };
  const lists = { h: document.querySelector("#hero-list"), s: document.querySelector("#sidekick-list") };
  const units = { h: Array.from(lists.h.children), s: Array.from(lists.s.children) };
  const tabs = { h: document.querySelector("#tab-heroes"), s: document.querySelector("#tab-sidekicks") };
  const tabpanels = { h: document.querySelector("#heroes"), s: document.querySelector("#sidekicks") };
  const browser = document.querySelector("#chara-browser");
  const panel = browser.querySelector(".chara-panel");
  const search = panel.querySelector(".chara-search");
  const filtersToggle = panel.querySelector(".chara-filters-toggle");
  const filtersBox = panel.querySelector("#chara-filters");
  const bar = panel.querySelector("#collection-bar");
  const moreToggle = bar.querySelector(".collection-more-toggle");
  const more = bar.querySelector("#collection-more");
  const display = bar.querySelector("select[name=collectionDisplay]");
  const compareOptions = Array.from(display.querySelectorAll("option[data-compare]"));
  const notes = browser.querySelector(".collection-notes");
  const announcer = browser.querySelector(".collection-announcer");
  const copyBtn = bar.querySelector("[data-action=copy]");

  const state = {
    tab: "h",
    open: false,
    view: "mine", // "mine" (editable) or "shared" (read-only, opened from someone's link)
    compare: false,
    display: "0", // the "Show" filter, see isShown()
    mine: emptySets(),
    shared: emptySets(),
  };

  function emptySets() {
    return { h: new Set(), s: new Set() };
  }

  function copySets(sets) {
    return { h: new Set(sets.h), s: new Set(sets.s) };
  }

  function setsEqual(a, b) {
    return kinds.every(k => a[k].size === b[k].size && [...a[k]].every(id => b[k].has(id)));
  }

  function compressIds(input) {
    if (input.length <= 1) return input;

    let prev = input[0];
    for (let i = 1; i < input.length; i++) {
      const now = input[i];
      input[i] = now - prev;
      prev = now;
    }
    return input
  }

  function decompressIds(input) {
    for (let i = 1; i < input.length; i++) {
      input[i] += input[i - 1];
    }
    return input
  }

  function encodeOneRunLength(prev, count) {
    return count > 1 ? `${count.toString(base)}$${prev}` : prev;
  }

  function runLengthCompress(input) {
    if (input.length <= 1) return input;

    let result = [];
    let prev = input[0];
    let count = 1;
    for (let i = 1; i < input.length; i++) {
      if (prev == input[i]) {
        count++;
      } else {
        result.push(encodeOneRunLength(prev, count))
        prev = input[i];
        count = 1;
      }
    }
    result.push(encodeOneRunLength(prev, count))
    return result
  }

  function runLengthDecompress(input) {
    let result = [];
    for (const code of input) {
      if (code.indexOf("$") != -1) {
        const [count, c] = code.split("$");
        for (let i = 0; i < parseInt(count, base); i++) {
          result.push(c);
        }
      } else {
        result.push(code);
      }
    }
    return result
  }

  function encodeIds(set) {
    const ids = [...set].map(id => parseInt(id, 10)).sort((a, b) => a - b);
    return runLengthCompress(compressIds(ids).map(i => i.toString(base))).join(",");
  }

  function decodeIds(text) {
    if (!text) return new Set();
    const ids = runLengthDecompress(text.split(",")).map(s => parseInt(s, base));
    if (ids.some(isNaN)) throw new Error(`Invalid collection ids: ${text}`);
    return new Set(decompressIds(ids).map(i => i.toString()));
  }

  // "h:<ids>/s:<ids>" <-> sets
  function encode(sets) {
    return kinds.map(k => `${k}:${encodeIds(sets[k])}`).join("/");
  }

  function decode(text) {
    const sets = emptySets();
    for (const part of text.split("/")) {
      if (!part) continue;
      const [prefix, ids] = part.split(":");
      sets[prefix == "h" ? "h" : "s"] = decodeIds(ids);
    }
    return sets;
  }

  // null when the hash is not a collection link, { sets: null } for a bare "#collection"
  function readHash() {
    const hash = decodeURIComponent(location.hash);
    if (!hash.startsWith("#collection")) return null;
    const rest = hash.slice("#collection".length).replace(/^\//, "");
    return { sets: rest ? decode(rest) : null };
  }

  function writeHash() {
    let hash = "";
    if (state.open) {
      hash = "#collection/" + encode(state.view == "shared" ? state.shared : state.mine);
    } else if (!location.hash.startsWith("#collection")) {
      return; // leave other anchors alone
    }
    history.replaceState(history.state, "", location.pathname + location.search + hash);
  }

  function shareUrl() {
    const sets = state.view == "shared" ? state.shared : state.mine;
    return location.origin + location.pathname + "#collection/" + encode(sets);
  }

  function loadMine() {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return decode(saved);
    } catch (e) {
      console.log(e);
    }
    return emptySets();
  }

  function saveMine() {
    try {
      localStorage.setItem(storageKey, encode(state.mine));
    } catch (e) {
      console.log(e);
    }
  }

  function announce(text) {
    announcer.textContent = "";
    setTimeout(() => announcer.textContent = text, 50);
  }

  function isEditing() {
    return state.open && state.view == "mine";
  }

  // Mirrors the CSS that hides units: .filtered (search and filters) and the "Show" filter
  // ([data-radio-filter] in _sass/_collection.scss). Works for the hidden tab too.
  function isShown(li) {
    if (li.classList.contains("filtered")) return false;
    if (!state.open) return true;
    const has = li.classList.contains(hasUnit);
    const mine = li.classList.contains("mine");
    switch (state.display) {
      case "1": return has;
      case "2": return !has;
      case "3": return has && !mine;
      case "4": return mine && !has;
      default: return true;
    }
  }

  // ---- Tabs, counts and the filters panel ----

  function selectTab(k, { focus = false, scroll = true } = {}) {
    state.tab = k;
    for (const kk of kinds) {
      const on = kk == k;
      tabs[kk].setAttribute("aria-selected", on);
      tabs[kk].tabIndex = on ? 0 : -1;
      tabpanels[kk].hidden = !on;
      filtersBox.querySelector(`[data-tab="${kk}"]`).hidden = !on;
    }
    if (focus) tabs[k].focus();
    try {
      sessionStorage.setItem(tabKey, k);
    } catch (e) { }
    updateCounts();
    renderBar();
    if (scroll) revealList();
  }

  function narrowedFields(k) {
    const box = filtersBox.querySelector(`[data-tab="${k}"]`);
    return new Set(Array.from(box.querySelectorAll(".chara-filter .filter-on"), b => b.dataset.field)).size;
  }

  function clearSearchAndFilters() {
    if (search.value) {
      search.value = "";
      search.dispatchEvent(new Event("input"));
    }
    for (const btn of filtersBox.querySelectorAll(`[data-tab="${state.tab}"] .chara-filter button[data-reset]`)) {
      btn.click();
    }
  }

  function updateCounts() {
    const shown = {};
    for (const k of kinds) {
      shown[k] = units[k].filter(isShown).length;
      tabs[k].querySelector(".chara-tab-count").textContent = shown[k];
      tabs[k].classList.toggle("is-narrowed", shown[k] != units[k].length);
    }

    for (const k of kinds) {
      const empty = tabpanels[k].querySelector(".chara-empty");
      empty.hidden = shown[k] > 0;
      if (shown[k] > 0) continue;
      const other = k == "h" ? "s" : "h";
      empty.replaceChildren();
      const p = document.createElement("p");
      p.textContent = `No ${nouns[k][1]} match.`;
      empty.append(p);
      if (shown[other] > 0) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = `Show ${shown[other]} ${nouns[other][shown[other] == 1 ? 0 : 1]}`;
        btn.addEventListener("click", () => selectTab(other, { focus: true }));
        empty.append(btn);
      }
      if (search.value || narrowedFields(k)) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = "Clear search and filters";
        btn.addEventListener("click", () => {
          clearSearchAndFilters();
          search.focus();
        });
        empty.append(btn);
      }
    }

    const n = narrowedFields(state.tab);
    const badge = filtersToggle.querySelector(".chara-filters-badge");
    badge.hidden = n == 0;
    badge.textContent = n;
    filtersToggle.setAttribute("aria-label", n ? `Filters, ${n} active` : "Filters");
  }

  // After the list changes under a stuck panel, bring the top of the list back into view
  function revealList() {
    const list = tabpanels[state.tab];
    if (list.getBoundingClientRect().top < panel.getBoundingClientRect().bottom - 1) {
      list.scrollIntoView({ block: "start" });
    }
  }

  function initialTab() {
    if (location.hash == "#sidekicks") return "s";
    if (location.hash == "#heroes") return "h";
    try {
      return sessionStorage.getItem(tabKey) == "s" ? "s" : "h";
    } catch (e) {
      return "h";
    }
  }

  function onTabKeydown(e) {
    const order = { ArrowLeft: -1, ArrowRight: 1, Home: "h", End: "s" }[e.key];
    if (order === undefined) return;
    e.preventDefault();
    const k = typeof order == "string" ? order : kinds[(kinds.indexOf(state.tab) + order + kinds.length) % kinds.length];
    selectTab(k, { focus: true });
  }

  function toggleDisclosure(btn, box, open = box.hidden) {
    box.hidden = !open;
    btn.setAttribute("aria-expanded", open);
  }

  // ---- Collection ----

  function setDisplay(value) {
    state.display = value;
    display.value = value;
    for (const k of kinds) lists[k].dataset.radioFilter = value;
    updateCounts();
  }

  function renderUnit(k, li) {
    const id = li.dataset.id;
    const owned = (state.view == "shared" ? state.shared : state.mine)[k].has(id);
    li.classList.toggle(hasUnit, state.open && owned);
    li.classList.toggle("mine", state.open && state.compare && state.mine[k].has(id));

    // While editing, the name link toggles the unit instead of opening the page
    const link = li.querySelector("a");
    if (isEditing()) {
      link.setAttribute("role", "button");
      link.setAttribute("aria-pressed", owned);
    } else {
      link.removeAttribute("role");
      link.removeAttribute("aria-pressed");
    }
  }

  function renderBar() {
    const shared = state.view == "shared";
    const shown = shared ? state.shared : state.mine;
    const k = state.tab;
    bar.querySelector(".collection-count-n").textContent = `${shown[k].size}/${units[k].length}`;
    bar.querySelector(".collection-shared-tag").hidden = !shared;
    more.querySelector(".collection-edit").hidden = shared;
    more.querySelector(".collection-shared-actions").hidden = !shared;
    notes.hidden = !state.open;
    notes.querySelector(".collection-shared").hidden = !shared;
    notes.querySelector(".collection-hint").hidden = shared;
    for (const btn of browser.querySelectorAll("[data-action=compare]")) btn.setAttribute("aria-pressed", state.compare);
    for (const el of browser.querySelectorAll(".collection-compare-only")) el.hidden = !state.compare;
    for (const opt of compareOptions) {
      if (state.compare && !opt.parentElement) display.append(opt);
      else if (!state.compare) opt.remove();
    }
    display.value = state.display;
  }

  function render() {
    document.body.classList.toggle("collection-on", state.open);
    document.body.classList.toggle("collection-readonly", state.open && state.view == "shared");
    bar.hidden = !state.open;
    fab.hidden = state.open;
    for (const k of kinds) {
      for (const li of units[k]) renderUnit(k, li);
    }
    renderBar();
    updateCounts();
  }

  function open() {
    state.open = true;
    try {
      localStorage.setItem(seenKey, "1");
    } catch (e) { }
    fab.classList.add("compact");
    writeHash();
    render();
    const rect = panel.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > innerHeight) browser.scrollIntoView({ block: "start" });
    bar.focus({ preventScroll: true });
  }

  function close() {
    state.open = false;
    state.view = "mine";
    state.compare = false;
    toggleDisclosure(moreToggle, more, false);
    setDisplay("0");
    writeHash();
    render();
    fab.focus();
  }

  function setCompare(on) {
    state.compare = on;
    if (!on && compareDisplayOn()) setDisplay("0");
    render();
  }

  function compareDisplayOn() { // the "They have, I don't" / "I have, they don't" filters
    return ["3", "4"].includes(state.display);
  }

  function showMine() {
    state.view = "mine";
    state.compare = false;
    if (compareDisplayOn()) setDisplay("0");
    toggleDisclosure(moreToggle, more, false);
    writeHash();
    render();
  }

  // Bulk actions apply to the units shown in the current tab (after the search, the filters and the
  // "Show" filter), e.g. filter to rarity 1, then "Mark shown". The reader confirms before many
  // units change at once.
  function bulk(action) {
    const k = state.tab;
    const changes = [];
    for (const li of units[k]) {
      if (!isShown(li)) continue;
      const has = state.mine[k].has(li.dataset.id);
      const want = action == "mark" ? true : action == "unmark" ? false : !has;
      if (want != has) changes.push(li.dataset.id);
    }

    const n = changes.length;
    if (n == 0) {
      announce("Nothing to change");
      return;
    }
    if (n > 5) {
      const verb = { mark: "Mark", unmark: "Unmark", invert: "Change" }[action];
      if (!window.confirm(`${verb} ${n} ${nouns[k][1]}?`)) return;
    }

    for (const id of changes) {
      state.mine[k].has(id) ? state.mine[k].delete(id) : state.mine[k].add(id);
    }
    saveMine();
    writeHash();
    render();
    announce(`${n} ${nouns[k][n == 1 ? 0 : 1]} changed`);
  }

  async function copyLink() {
    const url = shareUrl();
    try {
      await navigator.clipboard.writeText(url);
    } catch (e) {
      window.prompt("Copy this link to share your collection:", url);
      return;
    }
    const icon = copyBtn.querySelector(".collection-copy-icon");
    const label = copyBtn.querySelector(".collection-copy-label");
    icon.textContent = "✓";
    label.textContent = " Copied!";
    announce("Link copied");
    clearTimeout(copyLink.timer);
    copyLink.timer = setTimeout(() => {
      icon.textContent = "🔗";
      label.textContent = " Copy link";
    }, 2000);
  }

  function onListClick(e) {
    if (!isEditing()) return;
    // ctrl/shift/cmd-click still opens the character page in a new tab/window
    if (e.button != 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    const li = e.target.closest(".card-list > li");
    if (!li) return;
    e.preventDefault();

    const k = li.parentElement == lists.h ? "h" : "s";
    const id = li.dataset.id;
    state.mine[k].has(id) ? state.mine[k].delete(id) : state.mine[k].add(id);
    saveMine();
    writeHash();
    renderUnit(k, li);
    renderBar();
    updateCounts();
  }

  function onListKeydown(e) {
    // links acting as toggle buttons should also respond to Space
    if (e.key == " " && isEditing() && e.target.matches("a[role=button]")) {
      e.preventDefault();
      e.target.click();
    }
  }

  function onActionClick(e) {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    switch (btn.dataset.action) {
      case "done":
        close();
        break;
      case "copy":
        copyLink();
        break;
      case "mark":
      case "unmark":
      case "invert":
        bulk(btn.dataset.action);
        break;
      case "compare":
        setCompare(!state.compare);
        break;
      case "save-shared": {
        const mineCount = state.mine.h.size + state.mine.s.size;
        if (mineCount > 0 && !window.confirm(`Replace your saved collection (${mineCount} units) with this one?`)) return;
        state.mine = copySets(state.shared);
        saveMine();
        showMine();
        announce("Saved as your collection");
        break;
      }
      case "back-to-mine":
        showMine();
        break;
    }
  }

  // Opens the collection from a "#collection..." link, or a tab from "#heroes"/"#sidekicks";
  // called on load and when the hash changes.
  function applyHash() {
    if (location.hash == "#heroes" || location.hash == "#sidekicks") {
      selectTab(location.hash == "#heroes" ? "h" : "s", { scroll: false });
      tabpanels[state.tab].scrollIntoView({ block: "start" });
      return;
    }

    let parsed;
    try {
      parsed = readHash();
    } catch (e) {
      console.log(e);
      alert("Collection url is invalid");
      return;
    }
    if (!parsed) return;

    state.open = true;
    state.compare = false;
    if (parsed.sets == null || setsEqual(parsed.sets, state.mine)) {
      state.view = "mine";
    } else {
      state.view = "shared";
      state.shared = parsed.sets;
      setDisplay("0");
    }
    writeHash();
    render();
  }

  const fab = document.createElement("button");
  fab.type = "button";
  fab.id = "collection-fab";
  fab.className = "float-btn collection-fab";
  fab.title = "My Collection: mark the units you own and share them";
  fab.innerHTML = '<span class="collection-fab-icon" aria-hidden="true">✓</span><span class="collection-fab-label">My Collection</span>';
  try {
    if (localStorage.getItem(seenKey)) fab.classList.add("compact");
  } catch (e) { }
  fab.addEventListener("click", open);
  document.getElementById("float-btns").appendChild(fab);

  // Anchored lists scroll to just below the stuck panel (scroll-margin-top in _sass/_charas.scss)
  const setPanelHeight = () => browser.style.setProperty("--chara-panel-h", `${panel.offsetHeight}px`);
  setPanelHeight();
  new ResizeObserver(setPanelHeight).observe(panel);

  for (const k of kinds) {
    tabs[k].addEventListener("click", () => selectTab(k));
    tabs[k].addEventListener("keydown", onTabKeydown);
    lists[k].addEventListener("click", onListClick);
    lists[k].addEventListener("keydown", onListKeydown);
    lists[k].addEventListener("listfilter", () => {
      updateCounts();
      revealList();
    });
  }
  filtersToggle.addEventListener("click", () => toggleDisclosure(filtersToggle, filtersBox));
  moreToggle.addEventListener("click", () => toggleDisclosure(moreToggle, more));
  browser.addEventListener("click", onActionClick);
  display.addEventListener("change", () => setDisplay(display.value));
  window.addEventListener("hashchange", applyHash);

  state.mine = loadMine();
  selectTab(initialTab(), { scroll: false });
  applyHash();
  if ((location.hash == "#heroes" || location.hash == "#sidekicks") && document.readyState != "complete") {
    // the browser scrolls to the fragment again as the page finishes loading, before the tabs applied
    addEventListener("load", () => tabpanels[state.tab].scrollIntoView({ block: "start" }), { once: true });
  }
  render();
})();
