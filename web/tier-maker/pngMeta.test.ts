import assert from 'node:assert/strict'
import { deflateSync } from 'node:zlib'
import test from 'node:test'
import { crc32, embedTierList, KEYWORD, readTierList } from './pngMeta.ts'

function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length)
  const view = new DataView(out.buffer)
  view.setUint32(0, data.length)
  out.set(new TextEncoder().encode(type), 4)
  out.set(data, 8)
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)))
  return out
}

/** A valid 1x1 grayscale PNG. */
function tinyPng(): Uint8Array {
  const ihdr = new Uint8Array(13)
  new DataView(ihdr.buffer).setUint32(0, 1)
  new DataView(ihdr.buffer).setUint32(4, 1)
  ihdr[8] = 8 // bit depth; color type 0 = grayscale
  const parts = [
    Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(Uint8Array.from([0, 128]))),
    pngChunk('IEND', new Uint8Array()),
  ]
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0))
  let at = 0
  for (const p of parts) {
    out.set(p, at)
    at += p.length
  }
  return out
}

test('crc32 of the standard check string', () => {
  assert.equal(crc32(new TextEncoder().encode('123456789')), 0xcbf43926)
})

test('embedded tier list reads back, including non-ASCII text', () => {
  const json = JSON.stringify({ v: 1, title: 'ヒーロー ティアリスト ✨', tiers: [] })
  const png = embedTierList(tinyPng(), json)
  assert.equal(readTierList(png), json)
})

test('the result is still a well-formed PNG: IHDR first, the chunk right after it, IEND last', () => {
  const png = embedTierList(tinyPng(), '{}')
  const types: string[] = []
  const view = new DataView(png.buffer)
  for (let pos = 8; pos < png.length; ) {
    const len = view.getUint32(pos)
    types.push(String.fromCharCode(...png.subarray(pos + 4, pos + 8)))
    const crc = view.getUint32(pos + 8 + len)
    assert.equal(crc, crc32(png.subarray(pos + 4, pos + 8 + len)))
    pos += 12 + len
  }
  assert.deepEqual(types, ['IHDR', 'iTXt', 'IDAT', 'IEND'])
})

test('embedding twice replaces the first copy', () => {
  const once = embedTierList(tinyPng(), '{"a":1}')
  const twice = embedTierList(once, '{"b":2}')
  assert.equal(readTierList(twice), '{"b":2}')
  assert.equal(twice.length, embedTierList(tinyPng(), '{"b":2}').length)
})

test('a PNG without the chunk reads null, a non-PNG reads null and refuses to embed', () => {
  assert.equal(readTierList(tinyPng()), null)
  assert.equal(readTierList(new TextEncoder().encode('not a png at all')), null)
  assert.throws(() => embedTierList(new Uint8Array([1, 2, 3]), '{}'))
})

test('other iTXt chunks are ignored and a truncated file does not throw', () => {
  const png = embedTierList(tinyPng(), '{"x":1}')
  assert.equal(readTierList(png.subarray(0, png.length - 30)), '{"x":1}')
  assert.equal(readTierList(png.subarray(0, 40)), null)
  assert.ok(KEYWORD.length > 0)
})
