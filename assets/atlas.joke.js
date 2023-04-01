// ==ClosureCompiler==
// @compilation_level SIMPLE_OPTIMIZATIONS
// @language_out ECMASCRIPT_2019
// ==/ClosureCompiler==

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

    this.canvas.toBlob(blob => {
      if (dest_img.src.startsWith("blob")) URL.revokeObjectURL(dest_img.src);

      dest_img.src = URL.createObjectURL(blob);
    }, "image/png");
  }
};

async function getJson(sprites) {
  return await Promise.all(sprites.map(s => fetch(`/cdn/MonoBehaviour/${s}.json`)));
}

async function collectSprites(array, select) {
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
  return manifest;
}

const atlasObserver = new IntersectionObserver((entries, ob) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      atlasHandler(entry.target);

      ob.unobserve(entry.target);
    }
  });
});

const aprilFoolSpriteMap = {
  "alphecca": "takemaru01",
  "alchiba": "thunderbird01_skin1",
  "akashi": "gunzou01",
  "andrew": "jacob01",
  "barrel": "tindalos01",
  "exio": "nekros01_skin1",
  "furlong": "xolotl01",
  "gammei": "https@//api.housamo.xyz/housamo/unity/atlas/?mode=png&asset=/housamo/adv/Android/texture/character/fg_kyouma01&name=fg_kyouma01&use_filename=asset.png",
  "gomeisa": "wakantanka01",
  "goro": "kimunkamui01",
  "guardmanFire": "orgus01",
  "hisaki": "cusith01",
  "huckle": "leib01",
  "isaribi": "typhon01",
  "kyoichi": "taurus01_skin1",
  "marfik": "amatsumara01",
  "melide": "alice01",
  "lilac": "sandayu01",
  "loren": "ryouta01",
  "polaris": "aegir01",
  "procy": "shino01_skin2",
  "pubraseer": "breke01",
  "sadayoshi": "seth01",
  "sensettia": "benten01_skin9",
  "suhail": "jormungandr01",
  "sui": "arc01",
  "victom": "algernon01",
}
const APRIL_FOOL = "april_fool"

function addAprilFoolSprite(sprites, select) {
  const resourceName = sprites[0].split("_")[1]; // fg_<resourceName>_*
  const standIn = aprilFoolSpriteMap[resourceName];
  if (standIn !== undefined) {
    const value = `${APRIL_FOOL}:${standIn}`;
    select.prepend(new Option(APRIL_FOOL, value));
    select.value = value;
  }
}

async function atlasHandler(gallery) {
  const sprites = gallery.dataset["sprites"].split(",");
  const dest_img = gallery.querySelector("img");
  const select = gallery.querySelector("select");
  const array = await getJson(sprites);
  const manifest = await collectSprites(array, select);
  addAprilFoolSprite(sprites, select);

  gallery.appendChild(select);
  const h = () => {
    const comp = select.value.split(":");
    if (comp[0] == APRIL_FOOL) {
      if (comp[1].startsWith("http")) {
        dest_img.src = comp[1].replace("@", ":");
      } else {
        dest_img.src = `https://cdn.housamo.xyz/housamo/unity/Android/fg/fg_${comp[1]}.png`;
      }
      return;
    }

    const atlas_json = manifest[comp[0]];
    const textureData = atlas_json["textureDataList"].find(t => t["name"] == comp[1]);
    const img = new Image();
    img.onload = () => {
      window.atlasSticher = window.atlasSticher || new AtlasStitcher();
      atlasSticher.draw(img, textureData, atlas_json, dest_img);
    }
    img.src = `/cdn/Texture2D/${textureData["atlasName"]}.png`;
  };
  h();
  select.addEventListener("change", h);
}

document.querySelectorAll(".atlas-gallery").forEach(gallery => atlasObserver.observe(gallery));

function intdiv(a, b) {
  return Math.floor(a / b);
}
