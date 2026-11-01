import { describe, expect, it, vi } from 'vitest'
import { signal } from './signal'

describe('signal', () => {
  it('returns the initial value', () => {
    const count = signal(0)
    expect(count.value).toBe(0)
  })

  it('returns the new value after it is set', () => {
    const count = signal(0)
    count.value = 5
    expect(count.value).toBe(5)
  })

  it('calls a subscriber with the new value when it changes', () => {
    const count = signal(0)
    const listener = vi.fn()
    count.subscribe(listener)

    count.value = 1

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith(1)
  })

  it('does not call a subscriber when the value is the same', () => {
    const count = signal(0)
    const listener = vi.fn()
    count.subscribe(listener)

    count.value = 0

    expect(listener).not.toHaveBeenCalled()
  })

  it('stops calling a subscriber after it unsubscribes', () => {
    const count = signal(0)
    const listener = vi.fn()
    const unsubscribe = count.subscribe(listener)

    unsubscribe()
    count.value = 1

    expect(listener).not.toHaveBeenCalled()
  })
})