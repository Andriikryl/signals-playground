import { describe, expect, it } from 'vitest'
import { computed } from './computed'
import { effect } from './effect'
import { signal } from './signal'

describe('errors', () => {
  it('rethrows an error from a computed on read', () => {
    const broken = computed(() => {
      throw new Error('boom')
    })
    expect(() => broken.value).toThrow('boom')
  })

  it('keeps tracking working after a computed threw', () => {
    const broken = computed(() => {
      throw new Error('boom')
    })
    expect(() => broken.value).toThrow('boom')

    const count = signal(0)
    const seen: number[] = []
    effect(() => {
      seen.push(count.value)
    })
    count.value = 1

    expect(seen).toEqual([0, 1])
  })

  it('recovers once the cause of the error is gone', () => {
    const shouldFail = signal(true)
    const value = computed(() => {
      if (shouldFail.value) throw new Error('boom')
      return 'ok'
    })
    expect(() => value.value).toThrow('boom')

    shouldFail.value = false

    expect(value.value).toBe('ok')
  })
})

describe('cycles', () => {
  it('throws a clear error when a computed reads itself', () => {
    const selfish: { value: number } = computed(() => selfish.value + 1)
    expect(() => selfish.value).toThrow(/cycle/i)
  })
})

describe('cycles across computeds', () => {
  it('detects a cycle through two computeds', () => {
    const a: { value: number } = computed(() => b.value + 1)
    const b: { value: number } = computed(() => a.value + 1)
    expect(() => a.value).toThrow(/cycle/i)
  })
})