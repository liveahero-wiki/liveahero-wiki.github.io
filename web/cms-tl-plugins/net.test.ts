import { afterEach, beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  GithubError,
  apiUrl,
  bioJp,
  decodeBase64Utf8,
  fetchBlobText,
  fetchCurrentSha,
  githubFileUrl,
  githubHttpError,
  loadAllowedIncludes,
  loadBioRoster,
  loadVoiceRoster,
  resetNetCache,
  setBaseUrl,
  voiceJp,
  wikiOrigin,
} from './net.ts'

const realFetch = globalThis.fetch
type Handler = (url: string) => Response | Promise<Response>
let calls: string[] = []
const mock = (h: Handler) => {
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input)
    calls.push(url)
    return h(url)
  }) as typeof fetch
}
const json = (body: unknown, init: ResponseInit = {}) => new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' }, ...init })
const b64 = (s: string) => Buffer.from(s, 'utf8').toString('base64')

beforeEach(() => {
  calls = []
  resetNetCache()
  setBaseUrl('https://liveahero-wiki.github.io/assets/cms/lah-voice-tl.js')
})
afterEach(() => {
  globalThis.fetch = realFetch
})

describe('wiki urls', () => {
  it('derives /api/ from the module url', () => {
    assert.equal(apiUrl('voice-roster.json'), 'https://liveahero-wiki.github.io/api/voice-roster.json')
    assert.equal(wikiOrigin(), 'https://liveahero-wiki.github.io')
    setBaseUrl('http://localhost:8080/assets/cms/lah-bio-tl.js')
    assert.equal(apiUrl('bio-roster.json'), 'http://localhost:8080/api/bio-roster.json')
  })
  it('has no origin for a file: url', () => {
    setBaseUrl('file:///x/y.js')
    assert.equal(wikiOrigin(), '')
  })
})

describe('rosters', () => {
  it('fetches the voice roster once and shares the promise', async () => {
    mock(() => json({ version: '1', resources: { ryekie: { voice_ryekie_a: { jp: 'こんにちは', en: 'Hi' } } } }))
    const [a, b] = await Promise.all([loadVoiceRoster(), loadVoiceRoster()])
    assert.equal(calls.length, 1)
    assert.equal(a, b)
    assert.equal(voiceJp(a, 'ryekie', 'voice_ryekie_a'), 'こんにちは')
  })
  it('voiceJp is "" for anything unknown (shown as a dash), including inherited properties', () => {
    const r = { ryekie: { voice_ryekie_a: { jp: 'x' } } }
    assert.equal(voiceJp(r, 'ryekie', 'voice_ryekie_zzz'), '')
    assert.equal(voiceJp(r, 'nobody', 'k'), '')
    assert.equal(voiceJp(r, 'constructor', 'k'), '')
    assert.equal(voiceJp(r, 'ryekie', 'toString'), '')
    assert.equal(voiceJp(null, 'ryekie', 'k'), '')
  })
  it('a failed fetch resolves to null (not an error) and is retried next time', async () => {
    mock(() => new Response('nope', { status: 404 }))
    assert.equal(await loadVoiceRoster(), null)
    mock(() => json({ resources: { r: {} } }))
    assert.deepEqual(await loadVoiceRoster(), { r: {} })
    assert.equal(calls.length, 2)
  })
  it('a network error and a malformed body also give null', async () => {
    mock(() => {
      throw new TypeError('network down')
    })
    assert.equal(await loadBioRoster(), null)
    mock(() => json({ bios: 'x' }))
    assert.equal(await loadBioRoster(), null)
  })
  it('bio roster', async () => {
    mock(() => json({ version: '1', bios: { DETAIL_CEPH_H01: { jp: '博士' } } }))
    const r = await loadBioRoster()
    assert.equal(bioJp(r, 'DETAIL_CEPH_H01'), '博士')
    assert.equal(bioJp(r, 'DETAIL_NOPE'), '')
    assert.equal(bioJp(r, 'constructor'), '')
    assert.equal(bioJp(null, 'x'), '')
  })
  it('contrib includes: names only; null on failure', async () => {
    mock(() => json({ includes: ['item.html', 5, 'quest-group.html'] }))
    assert.deepEqual(await loadAllowedIncludes(), ['item.html', 'quest-group.html'])
    resetNetCache()
    mock(() => new Response('', { status: 500 }))
    assert.equal(await loadAllowedIncludes(), null)
  })
})

describe('decodeBase64Utf8', () => {
  it('decodes UTF-8 and ignores the line breaks GitHub inserts', () => {
    const text = '## 日本語 \u{1F600}\nline two\n'
    const wrapped = b64(text).replace(/(.{20})/g, '$1\n')
    assert.equal(decodeBase64Utf8(wrapped), text)
  })
})

describe('GitHub', () => {
  const sha = 'b'.repeat(40)
  it('fetches and decodes a blob, once per sha', async () => {
    mock(() => json({ sha, encoding: 'base64', content: b64('---\ntitle: x\n---\n本文\n') }))
    const [a, b] = await Promise.all([fetchBlobText(sha), fetchBlobText(sha)])
    assert.equal(a, '---\ntitle: x\n---\n本文\n')
    assert.equal(a, b)
    assert.deepEqual(calls, [`https://api.github.com/repos/liveahero-wiki/liveahero-wiki.github.io/git/blobs/${sha}`])
  })
  it('404: a clear message, kind not_found, and not cached', async () => {
    mock(() => new Response('{}', { status: 404 }))
    await assert.rejects(fetchBlobText(sha), (e: GithubError) => e instanceof GithubError && e.kind === 'not_found' && /bbbbbbb.*not found/i.test(e.message))
    mock(() => json({ encoding: 'base64', content: b64('ok') }))
    assert.equal(await fetchBlobText(sha), 'ok')
  })
  it('rate limit: 403 with remaining 0, or 429', async () => {
    mock(() => new Response('{}', { status: 403, headers: { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': '1800000000' } }))
    await assert.rejects(fetchBlobText(sha), (e: GithubError) => e.kind === 'rate_limit' && /rate limit/i.test(e.message) && /resets at/.test(e.message))
    const e429 = githubHttpError(429, new Headers(), 'x')
    assert.equal(e429.kind, 'rate_limit')
    assert.equal(githubHttpError(403, new Headers(), 'x').kind, 'http') // a plain 403 is not a rate limit
    assert.equal(githubHttpError(500, new Headers(), 'x').kind, 'http')
  })
  it('network failure and unexpected bodies', async () => {
    mock(() => {
      throw new TypeError('offline')
    })
    await assert.rejects(fetchBlobText(sha), (e: GithubError) => e.kind === 'network')
    mock(() => json({ encoding: 'none' }))
    await assert.rejects(fetchBlobText(sha), (e: GithubError) => e.kind === 'shape')
  })
  it('current sha of a path on master', async () => {
    const cur = 'c'.repeat(40)
    mock(() => json({ type: 'file', sha: cur, name: 'ryekie.md' }))
    assert.equal(await fetchCurrentSha('_charas/ryekie.md'), cur)
    assert.equal(calls[0], 'https://api.github.com/repos/liveahero-wiki/liveahero-wiki.github.io/contents/_charas/ryekie.md?ref=master')
  })
  it('current sha: errors for a missing path and a directory/garbage answer', async () => {
    mock(() => new Response('{}', { status: 404 }))
    await assert.rejects(fetchCurrentSha('guide/gone.md'), (e: GithubError) => e.kind === 'not_found' && /guide\/gone\.md/.test(e.message))
    mock(() => json([{ type: 'file' }]))
    await assert.rejects(fetchCurrentSha('guide'), (e: GithubError) => e.kind === 'shape')
    mock(() => json({ type: 'file', sha: 'nothex' }))
    await assert.rejects(fetchCurrentSha('mobs.md'), (e: GithubError) => e.kind === 'shape')
  })
  it('file link', () => {
    assert.equal(githubFileUrl('guide/sale.md'), 'https://github.com/liveahero-wiki/liveahero-wiki.github.io/blob/master/guide/sale.md')
  })
})
