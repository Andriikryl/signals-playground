import { describe, expect, it, vi } from 'vitest'
import { computed } from './computed'
import { effect } from './effect'
import { signal } from './signal'

describe('effect', () => {
  it('runs once immediately', () => {
    const fn = vi.fn()
    effect(fn)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('runs again when a signal it read changes', () => {
    const count = signal(0)
    const seen: number[] = []
    effect(() => {
      seen.push(count.value)
    })

    count.value = 1
    count.value = 2

    expect(seen).toEqual([0, 1, 2])
  })

  it('runs again when a computed it read changes', () => {
    const count = signal(1)
    const double = computed(() => count.value * 2)
    const seen: number[] = []
    effect(() => {
      seen.push(double.value)
    })

    count.value = 5

    expect(seen).toEqual([2, 10])
  })

  it('does not run again when the value is the same', () => {
    const count = signal(0)
    const fn = vi.fn(() => count.value)
    effect(fn)

    count.value = 0

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('stops running after it is disposed', () => {
    const count = signal(0)
    const fn = vi.fn(() => count.value)
    const dispose = effect(fn)

    dispose()
    count.value = 1

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('follows only the signals it read last time', () => {
    const useA = signal(true)
    const a = signal('a')
    const b = signal('b')
    const seen: string[] = []
    effect(() => {
      seen.push(useA.value ? a.value : b.value)
    })

    useA.value = false
    a.value = 'a2'
    b.value = 'b2'

    expect(seen).toEqual(['a', 'b', 'b2'])
  })
})