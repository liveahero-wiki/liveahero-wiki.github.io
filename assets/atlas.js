// @compilation_level SIMPLE_OPTIMIZATIONS
// @language_out ECMASCRIPT_2019

class AtlasStitcher {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext('2d');
  }

  draw(img, textureData, atlas_def, dest_img) {
    const atlas_h = img.height;
    const atlas_w = img.width;
    const texture_w = textureData["width"];
    const texture_h = textureData["height"];
    const padding = atlas_def["padding"];
    const cellSize = atlas_def["cellSize"];
    const innerSize = cellSize - 2 * padding;

    const canvas_w = (texture_w + innerSize - 1) - (texture_w + innerSize - 1) % innerSize;
    const canvas_h = (texture_h + innerSize - 1) - (texture_h + innerSize - 1) % innerSize;
    this.canvas.width = texture_w;
    this.canvas.height = texture_h;
    this.ctx.clearRect(0, 0, texture_w, texture_h);

    let i = 0;
    for (const cellIndex of textureData["cellIndexList"]) {
      if (cellIndex != textureData["transparentIndex"]) {
        const dest_x = (i % (canvas_w / innerSize) * innerSize);
        const dest_y = canvas_h - innerSize * (1 + intdiv(i, canvas_w / innerSize)) - (canvas_h - texture_h);
        const src_x = (cellIndex % (atlas_w / cellSize)) * cellSize + padding;
        const src_y = atlas_h - cellSize * (1 + intdiv(cellIndex, atlas_w / cellSize)) + padding;

        this.ctx.drawImage(img, src_x, src_y, innerSize, innerSize, dest_x, dest_y, innerSize, innerSize);
      }
      i++;
    }

    dest_img.src = this.canvas.toDataURL("image/png");
  }
};

async function getJson(sprites) {
  return await Promise.all(sprites.map(s => fetch(`/cdn/MonoBehaviour/${s}.json`)));
}

async function collectSprites(array) {
  const select = document.createElement("select");
  const manifest = {};
  for (const res of array) {
    if (res.status != 200) {
      console.log(res);
      continue;
    }

    const json = await res.json();
    const name = json["m_Name"];
    manifest[name] = json;
    for (const t of json["textureDataList"]) {
      select.add(new Option(t["name"], `${name}:${t["name"]}`));
    }
  }
  return { manifest, select };
}

const atlasObserver = new IntersectionObserver((entries, ob) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      atlasHandler(entry.target);

      ob.unobserve(entry.target);
    }
  });
});

async function atlasHandler(gallery) {
  const sprites = gallery.dataset["sprites"].split(",");
  const dest_img = gallery.querySelector("img");
  const array = await getJson(sprites);
  const { manifest, select } = await collectSprites(array);
  gallery.appendChild(select);
  select.addEventListener("change", () => {
    const comp = select.value.split(":");
    const atlas_json = manifest[comp[0]];
    const textureData = atlas_json["textureDataList"].find(t => t["name"] == comp[1]);
    const img = new Image();
    img.onload = () => {
      window.atlasSticher = window.atlasSticher || new AtlasStitcher();
      atlasSticher.draw(img, textureData, atlas_json, dest_img);
    }
    img.src = `/cdn/Texture2D/${textureData["atlasName"]}.png`;
  });
  select.dispatchEvent(new Event('change'));
}

document.querySelectorAll(".atlas-gallery").forEach(gallery => atlasObserver.observe(gallery));

function intdiv(a, b) {
  return Math.floor(a / b);
}