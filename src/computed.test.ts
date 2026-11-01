import { describe, expect, it, vi } from 'vitest'
import { computed } from './computed'
import { signal } from './signal'

describe('computed', () => {
  it('derives its value from a signal', () => {
    const count = signal(1)
    const double = computed(() => count.value * 2)
    expect(double.value).toBe(2)
  })

  it('does not run until it is read', () => {
    const count = signal(1)
    const fn = vi.fn(() => count.value * 2)
    computed(fn)
    expect(fn).not.toHaveBeenCalled()
  })

  it('caches the result between reads', () => {
    const count = signal(1)
    const fn = vi.fn(() => count.value * 2)
    const double = computed(fn)

    double.value
    double.value

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('recomputes on read after a dependency changes', () => {
    const count = signal(1)
    const double = computed(() => count.value * 2)

    expect(double.value).toBe(2)
    count.value = 5
    expect(double.value).toBe(10)
  })

  it('recomputes once for several changes before a read', () => {
    const count = signal(1)
    const fn = vi.fn(() => count.value * 2)
    const double = computed(fn)

    double.value
    count.value = 2
    count.value = 3
    count.value = 4
    expect(double.value).toBe(8)

    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('works in a chain of computeds', () => {
    const count = signal(1)
    const double = computed(() => count.value * 2)
    const plusOne = computed(() => double.value + 1)

    expect(plusOne.value).toBe(3)
    count.value = 5
    expect(plusOne.value).toBe(11)
  })
})