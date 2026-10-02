// Port of _plugins/image.rb: `image_dimension` returned FastImage.size, i.e. [width, height]
// or nil if the file is missing (cdn/ is not present in CI builds, so those come back empty).

import fs from "node:fs";
import { imageSize } from "image-size";

const cache = new Map();

/** @param {string} path a site path ("/assets/img/a.png") or a path relative to the project root */
export function imageDimension(path) {
  if (path === null || path === undefined) return null;
  let file = String(path);
  if (file[0] === "/") file = `.${file}`;

  if (!cache.has(file)) {
    let result = null;
    try {
      const buffer = fs.readFileSync(file);
      if (file.toLowerCase().endsWith(".svg")) {
        result = svgSize(buffer.toString("utf8"));
      } else {
        const { width, height } = imageSize(buffer);
        if (width && height) result = [width, height];
      }
    } catch {
      // missing or unreadable file
    }
    cache.set(file, result);
  }
  return cache.get(file);
}

/**
 * FastImage's SVG rule: the numbers in the width/height attributes, units ignored (so "1147pt"
 * is 1147; image-size would convert it to px), else the size of the viewBox.
 */
function svgSize(text) {
  const tag = /<svg\b[^>]*>/i.exec(text)?.[0];
  if (!tag) return null;
  const num = (name) => {
    const m = new RegExp(`\\s${name}\\s*=\\s*["']\\s*(-?[\\d.]+)`, "i").exec(tag);
    return m ? Number.parseFloat(m[1]) : null;
  };
  let width = num("width");
  let height = num("height");
  if (width === null || height === null) {
    const box = /\sviewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(tag);
    if (box) {
      width ??= Number.parseFloat(box[1]);
      height ??= Number.parseFloat(box[2]);
    }
  }
  return width && height ? [width, height] : null;
}
