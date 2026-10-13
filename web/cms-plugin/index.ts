// LAH team-formation plugin for the wiki-cms embed (wiki) and admin portal.
// Built by vite.cms-plugin.config.ts into the single ES module assets/cms/lah-team-formation.js.

import { h, render, type VNode } from 'preact'
import type { EditorHandle, FieldError, PluginContext, SubmissionPlugin } from './plugin-api.ts'
import { listFilter } from './list-filter.ts'
import { ensureStyles } from './style.ts'
import { TeamDetail } from './TeamDetail.tsx'
import { TeamEditor, type EditorBridge } from './TeamEditor.tsx'
import { TeamSummary } from './TeamSummary.tsx'
import type { TeamPayload } from './types.ts'
import { emptySlot } from './view.ts'

const TYPE = 'lah-team-formation'

function mount(el: HTMLElement, vnode: VNode<any>): () => void {
  ensureStyles()
  render(vnode, el)
  return () => render(null, el)
}

const plugin: SubmissionPlugin<TeamPayload> = {
  apiVersion: 1,
  type: TYPE,

  defaultPayload: () => ({ v: 1, supportIndex: null, heroes: [emptySlot()] }),

  mountSummary: (el, payload, ctx: PluginContext) => mount(el, h(TeamSummary, { payload, ctx })),

  mountDetail: (el, payload, ctx: PluginContext) => mount(el, h(TeamDetail, { payload, ctx })),

  listFilter,

  mountEditor(el, init, ctx: PluginContext): EditorHandle {
    const bridge: EditorBridge = { validate: () => [], setErrors: () => {}, abortDrag: () => {} }
    const unmount = mount(el, h(TeamEditor, { init, ctx, bridge }))
    return {
      destroy() {
        bridge.abortDrag()
        unmount()
      },
      validate: () => bridge.validate(),
      setErrors: (errors: FieldError[]) => bridge.setErrors(errors),
    }
  },
}

export default plugin
