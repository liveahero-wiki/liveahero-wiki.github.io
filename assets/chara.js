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
  for (const btn of ele.children) {
    btn.addEventListener("click", () => sortList(list, btn.dataset.sort, btn));
  }
  ele.addEventListener("click", (e) => {
    for (const btn of ele.children) {
      if (e.target.dataset.sort !== btn.dataset.sort) btn.dataset.order = "-1";
    }
  });
});

// Collection mode: readers mark the heroes/sidekicks they own and share them as a link.
// The "My Collection" button goes into #float-btns (_includes/wiki-msg.html) and opens
// #collection-bar (charas.html). The reader's own collection is saved in localStorage and mirrored
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
  const hasUnit = "has-unit";
  const kinds = ["h", "s"];
  const lists = { h: document.querySelector("#hero-list"), s: document.querySelector("#sidekick-list") };
  const units = { h: Array.from(lists.h.children), s: Array.from(lists.s.children) };
  const bar = document.querySelector("#collection-bar");
  const announcer = bar.querySelector(".collection-announcer");
  const copyBtn = bar.querySelector("[data-action=copy]");

  const state = {
    open: false,
    view: "mine", // "mine" (editable) or "shared" (read-only, opened from someone's link)
    compare: false,
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

  function setDisplay(value) {
    bar.querySelector(`input[name=radioFilter][value="${value}"]`).checked = true;
    for (const k of kinds) lists[k].dataset.radioFilter = value;
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
    const shown = state.view == "shared" ? state.shared : state.mine;
    for (const k of kinds) {
      bar.querySelector(`.collection-count-${k}`).textContent = `${shown[k].size}/${units[k].length}`;
    }
    bar.querySelector(".collection-shared").hidden = state.view != "shared";
    bar.querySelector(".collection-hint").hidden = state.view == "shared";
    bar.querySelector(".collection-edit").hidden = state.view == "shared";
    bar.querySelector("[data-action=compare]").setAttribute("aria-pressed", state.compare);
    for (const el of bar.querySelectorAll(".collection-compare-only")) el.hidden = !state.compare;
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
  }

  function open() {
    state.open = true;
    try {
      localStorage.setItem(seenKey, "1");
    } catch (e) { }
    fab.classList.add("compact");
    writeHash();
    render();
    bar.focus();
  }

  function close() {
    state.open = false;
    state.view = "mine";
    state.compare = false;
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
    return ["3", "4"].includes(lists.h.dataset.radioFilter);
  }

  function showMine() {
    state.view = "mine";
    state.compare = false;
    if (compareDisplayOn()) setDisplay("0");
    writeHash();
    render();
  }

  // Bulk actions apply to the units currently visible (after the rarity/element/role filters and
  // the display filter), e.g. filter to rarity 1, then "Mark shown". Both lists count, so the
  // reader confirms with a per-list breakdown before many units change at once.
  function bulk(action) {
    const changes = { h: [], s: [] };
    for (const k of kinds) {
      for (const li of units[k]) {
        if (li.getClientRects().length == 0) continue;
        const has = state.mine[k].has(li.dataset.id);
        const want = action == "mark" ? true : action == "unmark" ? false : !has;
        if (want != has) changes[k].push(li.dataset.id);
      }
    }

    const n = changes.h.length + changes.s.length;
    if (n == 0) {
      announce("Nothing to change");
      return;
    }
    if (n > 5) {
      const verb = { mark: "Mark", unmark: "Unmark", invert: "Change" }[action];
      const parts = [];
      if (changes.h.length) parts.push(`${changes.h.length} heroes`);
      if (changes.s.length) parts.push(`${changes.s.length} sidekicks`);
      if (!window.confirm(`${verb} ${parts.join(" and ")}?`)) return;
    }

    for (const k of kinds) {
      for (const id of changes[k]) {
        state.mine[k].has(id) ? state.mine[k].delete(id) : state.mine[k].add(id);
      }
    }
    saveMine();
    writeHash();
    render();
    announce(n == 1 ? "1 unit changed" : `${n} units changed`);
  }

  async function copyLink() {
    const url = shareUrl();
    try {
      await navigator.clipboard.writeText(url);
    } catch (e) {
      window.prompt("Copy this link to share your collection:", url);
      return;
    }
    copyBtn.textContent = "✓ Copied!";
    announce("Link copied");
    clearTimeout(copyLink.timer);
    copyLink.timer = setTimeout(() => copyBtn.textContent = "🔗 Copy link", 2000);
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
  }

  function onListKeydown(e) {
    // links acting as toggle buttons should also respond to Space
    if (e.key == " " && isEditing() && e.target.matches("a[role=button]")) {
      e.preventDefault();
      e.target.click();
    }
  }

  function onBarClick(e) {
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

  // Opens the collection from a "#collection..." link; called on load and when the hash changes.
  function applyHash() {
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

  // Keep the page and the other corner buttons clear of the bar
  new ResizeObserver(() => {
    document.documentElement.style.setProperty("--collection-bar-h", `${bar.offsetHeight}px`);
  }).observe(bar);

  for (const k of kinds) {
    lists[k].addEventListener("click", onListClick);
    lists[k].addEventListener("keydown", onListKeydown);
  }
  bar.addEventListener("click", onBarClick);
  for (const radio of bar.querySelectorAll("input[name=radioFilter]")) {
    radio.addEventListener("change", () => setDisplay(radio.value));
  }
  window.addEventListener("hashchange", applyHash);

  state.mine = loadMine();
  applyHash();
})();
