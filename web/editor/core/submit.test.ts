import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { makeT } from '../i18n/t.ts'
import { SubmitError, errorText, fieldName, fieldText, lineIndexOf, needsSignIn, postSubmission, signInErrorText } from './submit.ts'

const t = makeT('en')

function fakeFetch(status: number, body: unknown, calls: Array<{ url: string; init: RequestInit }> = []): typeof fetch {
  return (async (url: string, init: RequestInit) => {
    calls.push({ url, init })
    return new Response(typeof body === 'string' ? body : JSON.stringify(body), { status })
  }) as unknown as typeof fetch
}

const args = { api: 'https://cms.example/', type: 'lah-voice-tl', payload: { a: 1 }, token: 'tok', turnstileToken: 'ts' } as const

describe('postSubmission', () => {
  it('posts the contract body with the bearer token', async () => {
    const calls: Array<{ url: string; init: RequestInit }> = []
    const r = await postSubmission({ ...args, fetchImpl: fakeFetch(201, { id: 'abc', state: 'pending' }, calls) })
    assert.deepEqual(r, { id: 'abc' })
    assert.equal(calls[0]!.url, 'https://cms.example/api/contrib/submissions/lah-voice-tl/all')
    assert.equal(calls[0]!.init.method, 'POST')
    const headers = calls[0]!.init.headers as Record<string, string>
    assert.equal(headers.authorization, 'Bearer tok')
    assert.deepEqual(JSON.parse(calls[0]!.init.body as string), { payload: { a: 1 }, tags: {}, lang: 'en', turnstileToken: 'ts', website: '' })
  })

  const fail = async (status: number, body: unknown) => {
    try {
      await postSubmission({ ...args, fetchImpl: fakeFetch(status, body) })
    } catch (e) {
      return e as SubmitError
    }
    assert.fail('expected a failure')
  }

  it('maps every documented failure', async () => {
    const e401 = await fail(401, { error: { code: 'unauthenticated', message: 'x' } })
    assert.ok(needsSignIn(e401))
    assert.equal(errorText(t, e401), t('errExpired'))
    assert.ok(needsSignIn(await fail(401, 'not json')))

    const e400 = await fail(400, { error: { code: 'validation_failed', message: 'bad', fields: [{ path: 'payload.lines.1.text', code: 'text_invalid', message: 'Plain' }] } })
    assert.equal(e400.code, 'validation_failed')
    assert.equal(e400.fields.length, 1)
    assert.equal(errorText(t, e400), t('errValidation'))

    assert.equal(errorText(t, await fail(403, { error: { code: 'turnstile_failed', message: 'x' } })), t('errTurnstile'))
    assert.equal(errorText(t, await fail(413, { error: { code: 'too_large', message: 'x' } })), t('errTooLarge'))
    assert.equal(errorText(t, await fail(413, 'proxy page')), t('errTooLarge'))
    assert.equal(errorText(t, await fail(429, { error: { code: 'daily_cap', message: 'x' } })), t('errDailyCap'))
    assert.equal(errorText(t, await fail(429, { error: { code: 'pending_cap', message: 'x' } })), t('errPendingCap'))
    assert.equal(errorText(t, await fail(429, { error: { code: 'rate_limited', message: 'x' } })), t('errRateLimited'))
    assert.equal(errorText(t, await fail(429, 'slow down')), t('errRateLimited'))
    assert.equal(errorText(t, await fail(500, 'oops')), t('errUnknown'))
  })

  it('reports a network failure', async () => {
    const boom = (async () => {
      throw new TypeError('Failed to fetch')
    }) as unknown as typeof fetch
    const e = await postSubmission({ ...args, fetchImpl: boom }).catch((x) => x as SubmitError)
    assert.equal((e as SubmitError).code, 'network')
    assert.equal(errorText(t, e), t('errNetwork'))
  })

  it('anything that is not a SubmitError is unknown', () => assert.equal(errorText(t, new Error('x')), t('errUnknown')))
})

describe('field paths', () => {
  it('lineIndexOf and fieldName', () => {
    assert.equal(lineIndexOf('payload.lines.12.text'), 12)
    assert.equal(lineIndexOf('payload.lines.0'), 0)
    assert.equal(lineIndexOf('payload.note'), null)
    assert.equal(fieldName('payload.lines.2.text'), 'text')
    assert.equal(fieldName('summary'), 'summary')
  })
  it('fieldText localizes known codes with params', () => {
    assert.equal(fieldText(t, { path: 'summary', code: 'summary_length', params: { min: 3, max: 120 } }), 'The summary needs 3 to 120 characters.')
  })
})

describe('signInErrorText', () => {
  it('maps popup_blocked, closed and the account age rule', () => {
    assert.equal(signInErrorText(t, 'en', { code: 'popup_blocked' }), t('popupBlocked'))
    assert.equal(signInErrorText(t, 'en', { code: 'closed' }), t('signInClosed'))
    assert.match(signInErrorText(t, 'en', { code: 'account_too_young', eligibleAt: Date.UTC(2026, 10, 20) }), /at least 30 days old/)
    assert.equal(signInErrorText(t, 'en', { code: 'account_too_young' }), t('tooYoungNoDate', { days: 30 }))
    assert.equal(signInErrorText(t, 'en', new Error('x')), t('signInFailed'))
    assert.equal(signInErrorText(t, 'en', null), t('signInFailed'))
  })
})
