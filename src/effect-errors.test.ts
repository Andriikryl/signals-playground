import { describe, expect, it } from 'vitest'
import { effect } from './effect'
import { signal } from './signal'

describe('errors inside effects', () => {
  it('still runs the other effects when one of them throws', () => {
    const count = signal(0)
    const seen: number[] = []
    effect(() => {
      if (count.value === 1) throw new Error('boom')
    })
    effect(() => {
      seen.push(count.value)
    })

    expect(() => {
      count.value = 1
    }).toThrow('boom')

    expect(seen).toEqual([0, 1])
  })

  it('reports every error when several effects throw', () => {
    const count = signal(0)
    effect(() => {
      if (count.value === 1) throw new Error('first')
    })
    effect(() => {
      if (count.value === 1) throw new Error('second')
    })

    let caught: unknown
    try {
      count.value = 1
    } catch (error) {
      caught = error
    }

    expect(caught).toBeInstanceOf(AggregateError)
    expect((caught as AggregateError).errors).toHaveLength(2)
  })

  it('keeps working after an effect threw', () => {
    const count = signal(0)
    const seen: number[] = []
    effect(() => {
      if (count.value === 1) throw new Error('boom')
    })
    effect(() => {
      seen.push(count.value)
    })

    expect(() => {
      count.value = 1
    }).toThrow('boom')
    count.value = 2

    expect(seen).toEqual([0, 1, 2])
  })
})
