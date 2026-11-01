import { describe, expect, it } from 'vitest'
import { effect } from './effect'
import { signal } from './signal'

describe('effect loops', () => {
  it('throws instead of looping forever when an effect retriggers itself', () => {
    const count = signal(0)
    expect(() =>
      effect(() => {
        count.value = count.value + 1
      }),
    ).toThrow(/loop/i)
  })

  it('keeps working after a loop was detected', () => {
    const looping = signal(0)
    expect(() =>
      effect(() => {
        looping.value = looping.value + 1
      }),
    ).toThrow(/loop/i)

    const other = signal(0)
    const seen: number[] = []
    effect(() => {
      seen.push(other.value)
    })
    other.value = 1

    expect(seen).toEqual([0, 1])
  })
})
