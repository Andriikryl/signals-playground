import { describe, expect, it, vi } from 'vitest'
import { computed } from './computed'
import { effect } from './effect'
import { signal } from './signal'

describe('diamond dependency', () => {
  const setup = () => {
    const a = signal(1)
    const b = computed(() => a.value * 2)
    const c = computed(() => a.value * 3)
    const d = computed(() => b.value + c.value)
    return { a, d }
  }

  it('never exposes an inconsistent intermediate value', () => {
    const { a, d } = setup()
    const seen: number[] = []
    effect(() => {
      seen.push(d.value)
    })

    a.value = 2

    expect(seen).toEqual([5, 10])
  })

  it('runs the effect once per change', () => {
    const { a, d } = setup()
    const fn = vi.fn(() => d.value)
    effect(fn)

    a.value = 2

    expect(fn).toHaveBeenCalledTimes(2)
  })
})