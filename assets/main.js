function setupMenu() {
  const menuButton = document.querySelector('.menu-button')
  const sidebar = document.querySelector('.sidebar')
  const contentOverlay = document.querySelector('.content__overlay')

  menuButton.addEventListener('click', function () {
    sidebar.classList.toggle('sidebar--is-visible')
    contentOverlay.classList.toggle('content__overlay--is-active')
  })

  contentOverlay.addEventListener('click', function () {
    sidebar.classList.toggle('sidebar--is-visible')
    contentOverlay.classList.toggle('content__overlay--is-active')
  })
}

// The language skill names and descriptions are shown in (_includes/js/skill-lang.js picks the first
// one before paint; the picker only has to switch it and show it).
function setupSkillLangPicker() {
  const picker = document.querySelector(".skill-lang-picker");
  if (!picker || !window.setSkillLang) return;
  picker.disabled = false;
  picker.addEventListener("change", () => window.setSkillLang(picker.value));
  document.addEventListener("skilllangchange", e => { picker.value = e.detail.lang });
}

// The community team formations (docs/CMS.md) show their UI in the language the reader picked for skill
// names (<html data-skill-lang>: en, zh-Hans, zh-Hant or ja, the four languages of the embed too).
// Tell every embed on the page: data-cms-lang is what it reads first, and a language change is
// announced with a cms:lang event on the embed's element.
function setupCmsLang() {
  const hosts = document.querySelectorAll(".cms-submissions");
  if (hosts.length === 0) return;
  const apply = lang => {
    if (!lang) return;
    hosts.forEach(el => {
      el.setAttribute("data-cms-lang", lang);
      el.dispatchEvent(new CustomEvent("cms:lang", { detail: lang }));
    });
  };
  apply(document.documentElement.getAttribute("data-skill-lang"));
  document.addEventListener("skilllangchange", e => apply(e.detail.lang));
}

function setupExpiry() {
  const today = new Date();
  document.querySelectorAll("[data-expiry]").forEach(d => {
    const dd = new Date(d.dataset.expiry);
    if (dd < today) d.classList.add("expired");
  });
}

function sortTable(table, column, btn) {
  const oldOrder = parseInt(btn.dataset.order || '-1', 10);
  const newOrder = 0 - oldOrder;
  btn.dataset.order = newOrder;

  const array = [], rows = table.rows;
  for (let i = 0; i < rows.length; i++) {
    if (i == 0) continue;
    const s = rows[i].cells[column].textContent;
    const value = btn.dataset.type == "string" ? s : parseInt(s, 10);
    array.push({ value: value, element: rows[i] });
  }
  array.sort((lhs, rhs) => {
    return lhs.value > rhs.value ? newOrder : lhs.value < rhs.value ? oldOrder : 0;
  });

  for (const x of array) {
    table.tBodies[0].appendChild(x.element);
  }
}

function setupSortTable() {
  document.querySelectorAll(".sort-table").forEach(T => {
    const heads = T.querySelectorAll("th");
    let i = 0;
    heads.forEach(h => {
      const k = i++;
      h.tabIndex = 0;
      h.addEventListener("keydown", (e) => {
        if (e.key == 'Enter') {
          e.preventDefault();
          sortTable(T, k, h);
        }
      });
      h.addEventListener("click", () => sortTable(T, k, h));
    })
    heads[0].dataset.order = "1";
  });
}

function setupWikiTabs() {
  document.querySelectorAll("wiki-tabs").forEach(setupWikiTab)
}

function setupWikiTab(tabgroup) {
  const tabsection = tabgroup.querySelector(':scope > wiki-tabcontent')
  const tabheader = tabgroup.querySelector(':scope > wiki-header')
  const tabnav = tabgroup.querySelector(':scope nav')
  const tabnavitems = tabnav.querySelectorAll(':scope a')
  const isMiniTabs = tabgroup.classList.contains('mini-tabs')

  const setActiveTab = (tabbtn, scrollTabSection = false) => {
    const t = tabnav.querySelector(':scope a[aria-selected="true"]')
    if (t !== null) t.removeAttribute('aria-selected')

    tabbtn.setAttribute('aria-selected', 'true')
    tabheader.scrollTo({
      left: tabbtn.offsetLeft,
      behavior: 'smooth'
    })
  
    if (scrollTabSection) tabsection.scrollLeft = tabsection.querySelector(tabbtn.hash).offsetLeft
    if (!isMiniTabs) {
      history.replaceState(null, '', tabbtn.hash)
    }
  }

  const determineActiveTabSection = () => {
    const i = Math.round(tabsection.scrollLeft / tabsection.clientWidth)
    const matchingNavItem = tabnavitems[i]

    matchingNavItem && setActiveTab(matchingNavItem)
  }

  tabnav.addEventListener('click', e => {
    if (e.target.nodeName !== "A") return
    setActiveTab(e.target, true)
    e.preventDefault()
  })

  tabsection.addEventListener('scroll', (e) => {
    clearTimeout(tabsection.scrollEndTimer)
    tabsection.scrollEndTimer = setTimeout(determineActiveTabSection, 100)
  })

  // The panel holding the element the URL fragment names. #h10251 is a panel; #team-hero-10251 (the
  // community team formations, docs/CMS.md) or any other id inside a panel selects the panel it is in.
  const revealHash = () => {
    let id = location.hash.slice(1)
    try { id = decodeURIComponent(id) } catch (e) { /* keep the raw fragment */ }
    const target = id && document.getElementById(id)
    if (!target || !tabsection.contains(target)) return
    let panel = target
    while (panel.parentElement !== tabsection) panel = panel.parentElement
    tabsection.scrollLeft = panel.offsetLeft
    // the browser scrolled to the target before the panel was in view; do it again now
    if (target !== panel) target.scrollIntoView()
  }

  if (location.hash) revealHash()
  window.addEventListener('hashchange', revealHash)
  determineActiveTabSection()
}

function setupVoiceTableTabs() {
  const tables = document.querySelectorAll(".voice-table");
  if (tables.length === 0) return;

  const activeLang = localStorage.getItem("voice_lang") || "en";

  const updateAllTables = (lang) => {
    tables.forEach(table => {
      table.setAttribute("data-active-lang", lang);
      const buttons = table.querySelectorAll(".voice-tab-btn");
      buttons.forEach(btn => {
        if (btn.dataset.langTarget === lang) {
          btn.setAttribute("aria-selected", "true");
        } else {
          btn.removeAttribute("aria-selected");
        }
      });
    });
    localStorage.setItem("voice_lang", lang);
  };

  updateAllTables(activeLang);

  tables.forEach(table => {
    table.querySelectorAll(".voice-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const lang = btn.dataset.langTarget;
        updateAllTables(lang);
      });
    });
  });
}

// Contributor editing (docs/CONTRIBUTOR_EDITING.md): the editor bundle is fetched only when a reader
// clicks an element with data-contrib (page-edit, voice-suggest, bio-suggest); hovering, focusing or touching
// one prefetches it so the sign-in popup can open right inside the click.
function setupContrib() {
  const load = () => import("/assets/cms/editor.js");
  const find = e => e.target.closest && e.target.closest("[data-contrib]");
  for (const type of ["pointerover", "focusin", "touchstart"]) {
    document.addEventListener(type, e => { if (find(e)) load().catch(() => {}); }, { passive: true });
  }
  document.addEventListener("click", e => {
    const el = find(e);
    if (!el) return;
    e.preventDefault();
    load().then(m => m.open(el.dataset.contrib, el), () => {
      const msg = document.createElement("div");
      msg.className = "contrib-toast";
      msg.setAttribute("role", "status");
      msg.textContent = "Could not load the editor. Please try again later.";
      document.body.append(msg);
      setTimeout(() => msg.remove(), 5000);
    });
  });
}

// Close the toolbar's Edit dropdown once an item is chosen (the editor opens over it, the GitHub link navigates away).
function setupToolbarMenu() {
  document.querySelector(".toolbar-menu")?.addEventListener("click", e => {
    if (e.target.closest("[role=menuitem]")) e.currentTarget.hidePopover?.();
  });
}

const tasks = [setupWikiTabs, setupMenu, setupToolbarMenu, setupSkillLangPicker, setupCmsLang, setupExpiry, setupSortTable, setupVoiceTableTabs, setupContrib];
for (const t of tasks) {
  setTimeout(t, 0)
}
