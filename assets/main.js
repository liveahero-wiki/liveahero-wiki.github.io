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
document.querySelectorAll(".skill-trigger").forEach(trigger => {
  const conds = JSON.parse(trigger.dataset.trigger);
  let f = [];
  for (const c of conds) {
    switch (c.class) {
      case "MinComboTrigger":
        f.push(`${c.value}+ combos`);
        break;
      case "MinHPTrigger":
        f.push(`${c.value}+% HP`);
        break;
      case "MaxHPTrigger":
        f.push(`${value}-% HP`);
        break;
      default:
        f.push("unknown condition");
    }
  }
  trigger.textContent = "triggered when " + f.join(" and ");
});
function toggleTranslate(e) {
  const ele = e.target;
  const tmp = ele.textContent;
  ele.textContent = ele.dataset.translate;
  ele.dataset.translate = tmp;
}
document.querySelectorAll(".translate").forEach(t => t.addEventListener('click', toggleTranslate));
