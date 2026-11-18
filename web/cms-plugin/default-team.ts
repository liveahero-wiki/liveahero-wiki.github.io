// The team a fresh builder starts with (no draft): Akashi in row 1, the other rows empty (a borrowed support, if any, sits
// in row 4 but stays empty until a hero is picked). Kept apart from editor-state.ts so the page bundle can use it without
// pulling the plugin in; a test keeps it equal to what the editor emits for its own default state.

import type { TeamPayload } from './types.ts'
import { emptySlot } from './view.ts'

export const DEFAULT_HERO_ID = 10011
/** Row (0-based) that carries the borrowed support role in a fresh editor. */
export const DEFAULT_SUPPORT_ROW = 3

export const defaultTeamPayload = (): TeamPayload => ({ v: 1, supportIndex: null, heroes: [{ ...emptySlot(), stockId: DEFAULT_HERO_ID }] })
