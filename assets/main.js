document.querySelectorAll(".hero-gallery").forEach(gallery => {
  const sprites = JSON.parse(gallery.dataset.arts);
  const select = gallery.querySelector(".spriteSelector");
  const img = gallery.querySelector("img");
  for (const s of sprites) {
    const x = s.split("/");
    select.add(new Option(x[x.length - 1], s));
  }
  select.addEventListener("change", e => {
    img.src = select.value;
  });
});
var menuButton = document.querySelector('.menu-button')
var sidebar = document.querySelector('.sidebar')
var contentOverlay = document.querySelector('.content__overlay')

menuButton.addEventListener('click', function () {
  sidebar.classList.toggle('sidebar--is-visible')
  contentOverlay.classList.toggle('content__overlay--is-active')
})

contentOverlay.addEventListener('click', function () {
  sidebar.classList.toggle('sidebar--is-visible')
  contentOverlay.classList.toggle('content__overlay--is-active')
})
function toggleTranslate(e) {
  const tmp = this.dataset.translate;
  if (tmp.length === 0) return;
  this.dataset.translate = this.innerHTML;
  this.innerHTML = tmp;
}
document.querySelectorAll(".translate").forEach(t => t.addEventListener('click', toggleTranslate));
const today = new Date();
document.querySelectorAll("[data-expiry]").forEach(d => {
  const dd = new Date(d.dataset.expiry);
  if (dd < today) d.classList.add("expired");
});
function sortTable(table, column, btn) {
  const oldOrder = parseInt(btn.dataset.order || '-1', 10);
  const newOrder = 0 - oldOrder;
  btn.dataset.order = newOrder;

  const array = [], rows = table.rows;
  for (let i = 0; i < rows.length; i++) {
    if (i == 0) continue;
    const s = rows[i].cells[column].textContent;
    const value = btn.dataset.type == "string" ? s : parseInt(s, 10);
    array.push({value: value, element: rows[i]});
  }
  array.sort((lhs, rhs) => {
    return lhs.value > rhs.value ? newOrder : lhs.value < rhs.value ? oldOrder : 0;
  });

  for (const x of array) {
    table.appendChild(x.element);
  }
}
document.querySelectorAll(".sort-table").forEach(T => {
  const heads = T.querySelectorAll("th");
  let i = 0;
  heads.forEach(h => {
    const k = i++;
    h.tabIndex = 0;
    h.addEventListener("keydown", (e) => { if (e.key == 'Enter') {
      e.preventDefault();
      sortTable(T, k, h);
    }});
    h.addEventListener("click", () => sortTable(T, k, h));
  })
});
