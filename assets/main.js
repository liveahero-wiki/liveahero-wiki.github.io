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