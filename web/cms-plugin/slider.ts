// Pure helpers of the number slider (NumSlider.tsx): graduation marks and positions. Free of JSX so they can be unit-tested.

/** Position of `v` on a track from `min` to `max`, in percent (0 when the track has no length). */
export const pctOf = (v: number, min: number, max: number): number => (max > min ? ((v - min) / (max - min)) * 100 : 0)

/** Graduation marks: `min`, every multiple of `every` in between and `max`, ascending, without duplicates. */
export function tickValues(min: number, max: number, every: number): number[] {
  const out = [min]
  if (every > 0) for (let v = Math.ceil((min + 1) / every) * every; v < max; v += every) out.push(v)
  if (max > min) out.push(max)
  return out
}

/** Index of the largest choice at or below `v` (0 when `v` is below all of them). `choices` is ascending. */
export function indexOfChoice(choices: readonly number[], v: number): number {
  let at = 0
  for (let i = 0; i < choices.length; i++) if (choices[i] <= v) at = i
  return at
}

/** Marks for a slider over a list of valid values: all of them when there are few, else those 1 + a multiple of 20, and the last. */
export function choiceTicks(choices: readonly number[]): number[] {
  if (choices.length <= 7) return [...choices]
  return choices.filter((v, i) => i === choices.length - 1 || (v - 1) % 20 === 0)
}
