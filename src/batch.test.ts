import { describe, expect, it } from 'vitest'
import { batch } from './context'
import { effect } from './effect'
import { signal } from './signal'

describe('batch', () => {
  it('runs an effect once for several writes', () => {
    const a = signal(1)
    const b = signal(1)
    const seen: number[] = []
    effect(() => {
      seen.push(a.value + b.value)
    })

    batch(() => {
      a.value = 2
      b.value = 3
    })

    expect(seen).toEqual([2, 5])
  })

  it('returns the result of the function', () => {
    expect(batch(() => 42)).toBe(42)
  })

  it('waits for the outermost batch to finish', () => {
    const a = signal(0)
    const seen: number[] = []
    effect(() => {
      seen.push(a.value)
    })

    batch(() => {
      batch(() => {
        a.value = 1
      })
      expect(seen).toEqual([0])
      a.value = 2
    })

    expect(seen).toEqual([0, 2])
  })

  it('lets an effect write to another signal and settles', () => {
    const a = signal(0)
    const b = signal(0)
    const seen: number[] = []
    effect(() => {
      b.value = a.value * 2
    })
    effect(() => {
      seen.push(b.value)
    })

    a.value = 3

    expect(seen).toEqual([0, 6])
  })
})