// Dev harness only: stands in for `<wiki-cms>/embed/v1.js` (the contributor session part of window.cmsEmbed).
// Behaviour is steered by window.__mock set in fixture.html.
const mock = () => window.__mock ?? {}
const delay = (ms) => new Promise((r) => setTimeout(r, ms))
const key = (api) => `cms-contrib:${api}`
const tell = (api) => window.dispatchEvent(new CustomEvent('cms:contrib', { detail: { api } }))

window.cmsEmbed = {
  contrib: {
    session(api) {
      try {
        return JSON.parse(localStorage.getItem(key(api)) ?? 'null')
      } catch {
        return null
      }
    },
    async signIn(api) {
      await delay(150)
      const err = mock().signInError
      if (err) throw Object.assign(new Error(err), { code: err, eligibleAt: Date.now() + 5 * 86400000 })
      const s = { token: 'mock-token', user: { id: 'u1', displayName: 'Mock Contributor', image: null } }
      localStorage.setItem(key(api), JSON.stringify(s))
      tell(api)
      return s
    },
    async signOut(api) {
      localStorage.removeItem(key(api))
      tell(api)
    },
    async mine(type) {
      return (mock().mine ?? {})[type] ?? []
    },
    onChange() {
      return () => {}
    },
  },
}
