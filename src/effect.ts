import { schedule, stack } from './context'

export const effect = (fn: () => void) => {
  const sources = new Set<() => void>()
  let disposed = false

  const cleanup = () => {
    sources.forEach((unsubscribe) => unsubscribe())
    sources.clear()
  }

  const run = () => {
    if (disposed) return
    cleanup()
    stack.push({
      markDirty: () => schedule(run),
      addSource: (unsubscribe) => sources.add(unsubscribe),
    })
    try {
      fn()
    } finally {
      stack.pop()
    }
  }

  run()

  return () => {
    disposed = true
    cleanup()
  }
}