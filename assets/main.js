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

function toggleTranslate(e) {
  const tmp = this.dataset.translate;
  if (tmp.length === 0) return;
  this.dataset.translate = this.innerHTML;
  this.innerHTML = tmp;
}

function setupTranslate() {
  document.querySelectorAll(".translate").forEach(t => t.addEventListener('click', toggleTranslate));
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
    table.appendChild(x.element);
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
  });
}

function setupWikiTabs() {
  // grab and stash elements
  const tabgroup = document.querySelector('wiki-tabs')
  if (tabgroup == null) return
  const tabsection = tabgroup.querySelector(':scope > wiki-tabcontent')
  const tabnav = tabgroup.querySelector(':scope nav')
  const tabnavitems = tabnav.querySelectorAll(':scope a')

  const setActiveTab = tabbtn => {
    const t = tabnav.querySelector(':scope a[aria-selected="true"]')
    if (t !== null) t.removeAttribute('aria-selected')

    tabbtn.setAttribute('aria-selected', 'true')
    tabbtn.scrollIntoView()
  }

  const determineActiveTabSection = () => {
    const i = tabsection.scrollLeft / tabsection.clientWidth
    const matchingNavItem = tabnavitems[i]

    matchingNavItem && setActiveTab(matchingNavItem)
  }

  tabnav.addEventListener('click', e => {
    if (e.target.nodeName !== "A") return
    setActiveTab(e.target)
  })

  tabsection.addEventListener('scroll', (e) => {
    clearTimeout(tabsection.scrollEndTimer)
    tabsection.scrollEndTimer = setTimeout(determineActiveTabSection, 100)
  })

  if (location.hash) {
    const tab = document.querySelector(location.hash)
    if (tab !== null) tabsection.scrollLeft = tab.offsetLeft
  }
  determineActiveTabSection()
}

const tasks = [setupWikiTabs, setupMenu, setupTranslate, setupExpiry, setupSortTable];
for (const t of tasks) {
  setTimeout(t, 100)
}
