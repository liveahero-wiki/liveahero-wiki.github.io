// Shared number control: a slider with graduation marks, a number input for exact values and a "Max" button.

import { useEffect, useRef, useState } from 'preact/hooks'
import { errorText, type T } from './i18n/t.ts'
import type { FieldError } from './plugin-api.ts'
import { choiceTicks, indexOfChoice, pctOf, tickValues } from './slider.ts'

export interface NumSliderProps {
  id: string
  label: string
  value: number
  /** Value used when the number input is emptied. */
  def: number
  min: number
  max: number
  /** A graduation mark every `every` (plus both ends). */
  every: number
  /** Step of the slider only (default 1); the number input still takes any whole number. */
  step?: number
  /** Ascending list of the only valid values: the slider then moves between them, and up/down in the number input jumps through them. */
  choices?: number[]
  disabled?: boolean
  hint?: string
  errors?: FieldError[]
  t: T
  onChange(v: number): void
}

export function NumSlider({ id, label, value, def, min, max, every, step = 1, choices, disabled, hint, errors = [], t, onChange }: NumSliderProps) {
  const [draft, setDraft] = useState(String(value))
  const emitted = useRef(value)
  useEffect(() => {
    if (value !== emitted.current) {
      emitted.current = value
      setDraft(String(value))
    }
  }, [value])

  const list = choices && choices.length > 1 ? choices : null
  const top = list ? list[list.length - 1] : max
  const rangeMax = list ? list.length - 1 : max
  const rangeMin = list ? 0 : min
  const rangeValue = list ? indexOfChoice(list, value) : Math.min(max, Math.max(min, value))
  const ticks = list ? choiceTicks(list).map((v) => ({ v, at: pctOf(indexOfChoice(list, v), 0, rangeMax) })) : tickValues(min, max, every).map((v) => ({ v, at: pctOf(v, min, max) }))

  const emit = (v: number) => {
    emitted.current = v
    setDraft(String(v))
    onChange(v)
  }
  const errId = `${id}-err`

  return (
    <div class={'cms-lah-slider' + (disabled ? ' cms-lah-slider-off' : '')}>
      <div class="cms-lah-slider-head">
        <label class="cms-lah-label" for={`${id}-num`}>
          {label}
        </label>
        <input
          id={`${id}-num`}
          class="cms-lah-input cms-lah-slider-num"
          type="number"
          inputMode="numeric"
          step={list ? list[1] - list[0] : 1}
          min={min}
          max={max}
          value={draft}
          disabled={disabled}
          aria-invalid={errors.length ? true : undefined}
          aria-describedby={errors.length ? errId : undefined}
          // Typing only edits the draft; the value is applied on change (blur, Enter, spinner), so a half-typed number
          // ("7" on the way to "70") never reaches the editor state, where a Lv below the max would drop the Lv seed.
          onInput={(e) => setDraft(e.currentTarget.value)}
          onChange={(e) => {
            const raw = e.currentTarget.value
            const v = raw === '' ? def : Number(raw)
            emitted.current = v
            onChange(v)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              e.currentTarget.blur()
              return
            }
            if (!list || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return
            // The native step cannot reach a maximum that is off the step grid (96 -> 100), so jump through the choices.
            e.preventDefault()
            const cur = Number(e.currentTarget.value)
            const next = e.key === 'ArrowUp' ? list.find((c) => c > cur) : [...list].reverse().find((c) => c < cur)
            if (next !== undefined) emit(next)
          }}
          onBlur={() => setDraft(String(emitted.current))}
        />
        <button type="button" class="cms-lah-btn cms-lah-slider-max" disabled={disabled || value === top} aria-label={`${label}: ${t('max')}`} onClick={() => emit(top)}>
          {t('max')}
        </button>
      </div>
      <div class="cms-lah-slider-track">
        <input
          class="cms-lah-slider-range"
          type="range"
          min={rangeMin}
          max={rangeMax}
          step={list ? 1 : step}
          value={rangeValue}
          disabled={disabled}
          aria-label={label}
          aria-valuetext={String(value)}
          onInput={(e) => emit(list ? list[Number(e.currentTarget.value)] : Number(e.currentTarget.value))}
        />
        <div class="cms-lah-slider-ticks" aria-hidden="true">
          {ticks.map(({ v, at }) => (
            <span key={v} class="cms-lah-slider-tick" style={{ left: `${at}%` }}>
              {v}
            </span>
          ))}
        </div>
      </div>
      {hint && <p class="cms-lah-muted cms-lah-small">{hint}</p>}
      {errors.length > 0 && (
        <p class="cms-lah-error" id={errId}>
          {errors.map((e) => errorText(t, e)).join(' ')}
        </p>
      )}
    </div>
  )
}
