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
