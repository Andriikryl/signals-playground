import { stack, trackDependency } from './context'

export const computed = <T>(fn: () => T) => {
  const dependents = new Set<() => void>()
  const sources = new Set<() => void>()
  let cached: T
  let dirty = true
  let computing = false

  const markDirty = () => {
    if (dirty) return
    dirty = true
    for (const dependent of Array.from(dependents)) dependent()
  }

  const subscribe = (listener: () => void) => {
    dependents.add(listener)
    return () => {
      dependents.delete(listener)
    }
  }

  const recompute = () => {
    if (computing) throw new Error('Cycle detected in computed')
    computing = true
    sources.forEach((cleanup) => cleanup())
    sources.clear()
    stack.push({ markDirty, addSource: (cleanup) => sources.add(cleanup) })
    try {
      cached = fn()
      dirty = false
    } finally {
      stack.pop()
      computing = false
    }
  }

  return {
    get value(): T {
      trackDependency(subscribe)
      if (dirty) recompute()
      return cached
    },
  }
}