// Embeds the tier list JSON in an exported PNG (an `iTXt` chunk) and reads it back, so the image doubles as a save file.
// Hand-written: a PNG is a signature plus length/type/data/CRC chunks. No DOM, so `node --test` can import it.

export const KEYWORD = 'lah-tier-list'

/** Largest file `readTierList` will scan; an exported tier list is far smaller. */
export const MAX_PNG_BYTES = 30 * 1024 * 1024

const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

let table: Uint32Array | null = null

export function crc32(bytes: Uint8Array): number {
  if (!table) {
    table = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      table[n] = c >>> 0
    }
  }
  let crc = 0xffffffff
  for (const b of bytes) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

const hasSignature = (b: Uint8Array): boolean => b.length >= 8 && SIGNATURE.every((v, i) => b[i] === v)

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length)
  const view = new DataView(out.buffer)
  view.setUint32(0, data.length)
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i)
  out.set(data, 8)
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)))
  return out
}

/** The `iTXt` chunk (uncompressed, UTF-8): keyword, NUL, flag 0, method 0, empty language tag, NUL, empty translated keyword, NUL, text. */
function textChunk(text: string): Uint8Array {
  const enc = new TextEncoder()
  const key = enc.encode(KEYWORD)
  const body = enc.encode(text)
  const data = new Uint8Array(key.length + 5 + body.length)
  data.set(key, 0)
  // bytes after the keyword: NUL, compression flag 0, method 0, language tag NUL, translated keyword NUL (all zero)
  data.set(body, key.length + 5)
  return chunk('iTXt', data)
}

/** Reads each chunk header; the callback gets the type and the data range, and may return a value to stop early. */
function eachChunk<T>(png: Uint8Array, fn: (type: string, start: number, end: number, chunkStart: number) => T | undefined): T | undefined {
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength)
  let pos = 8
  while (pos + 12 <= png.length) {
    const len = view.getUint32(pos)
    const dataStart = pos + 8
    const dataEnd = dataStart + len
    if (dataEnd + 4 > png.length) return undefined
    const type = String.fromCharCode(png[pos + 4], png[pos + 5], png[pos + 6], png[pos + 7])
    const r = fn(type, dataStart, dataEnd, pos)
    if (r !== undefined) return r
    if (type === 'IEND') return undefined
    pos = dataEnd + 4
  }
  return undefined
}

/** Returns a copy of `png` with the tier list embedded right after IHDR (an older copy of it is replaced). Throws on a non-PNG. */
export function embedTierList(png: Uint8Array, json: string): Uint8Array {
  if (!hasSignature(png)) throw new Error('not a PNG')
  const without = stripTierList(png)
  const insertAt = 8 + 12 + 13 // signature + the fixed 13-byte IHDR chunk
  const add = textChunk(json)
  const out = new Uint8Array(without.length + add.length)
  out.set(without.subarray(0, insertAt), 0)
  out.set(add, insertAt)
  out.set(without.subarray(insertAt), insertAt + add.length)
  return out
}

function keywordOf(png: Uint8Array, start: number, end: number): string {
  let i = start
  while (i < end && png[i] !== 0) i++
  return new TextDecoder().decode(png.subarray(start, i))
}

function stripTierList(png: Uint8Array): Uint8Array {
  const cuts: [number, number][] = []
  eachChunk(png, (type, start, end, chunkStart) => {
    if (type === 'iTXt' && keywordOf(png, start, end) === KEYWORD) cuts.push([chunkStart, end + 4])
    return undefined
  })
  if (!cuts.length) return png
  const parts: Uint8Array[] = []
  let at = 0
  for (const [from, to] of cuts) {
    parts.push(png.subarray(at, from))
    at = to
  }
  parts.push(png.subarray(at))
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0))
  let o = 0
  for (const p of parts) {
    out.set(p, o)
    o += p.length
  }
  return out
}

/** The embedded tier list JSON text, or null when `bytes` is not a PNG, is too large, or carries none. */
export function readTierList(bytes: Uint8Array): string | null {
  if (bytes.length > MAX_PNG_BYTES || !hasSignature(bytes)) return null
  return (
    eachChunk(bytes, (type, start, end) => {
      if (type !== 'iTXt' || keywordOf(bytes, start, end) !== KEYWORD) return undefined
      let i = start + KEYWORD.length + 1
      const compressed = bytes[i]
      i += 2 // compression flag + method
      while (i < end && bytes[i] !== 0) i++ // language tag
      i++
      while (i < end && bytes[i] !== 0) i++ // translated keyword
      i++
      if (compressed !== 0 || i > end) return undefined
      return new TextDecoder().decode(bytes.subarray(i, end))
    }) ?? null
  )
}
