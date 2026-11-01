export type Observer = {
  markDirty: () => void
  addSource: (cleanup: () => void) => void
}

export const stack: Observer[] = []

export const trackDependency = (
  subscribe: (markDirty: () => void) => () => void,
) => {
  const observer = stack[stack.length - 1]
  if (!observer) return
  observer.addSource(subscribe(observer.markDirty))
}

const pending = new Set<() => void>()
let depth = 0
let flushing = false

const MAX_FLUSH_PASSES = 100

export const schedule = (job: () => void) => {
  pending.add(job)
}

const flush = () => {
  if (flushing) return
  flushing = true
  const errors: unknown[] = []
  let passes = 0
  while (pending.size > 0) {
    if (++passes > MAX_FLUSH_PASSES) {
      pending.clear()
      errors.push(new Error('Effect loop detected'))
      break
    }
    const jobs = Array.from(pending)
    pending.clear()
    for (const job of jobs) {
      try {
        job()
      } catch (error) {
        errors.push(error)
      }
    }
  }
  flushing = false
  if (errors.length === 1) throw errors[0]
  if (errors.length > 1) {
    throw new AggregateError(errors, 'Multiple effects failed')
  }
}

export const batch = <T>(fn: () => T): T => {
  depth++
  try {
    return fn()
  } finally {
    depth--
    if (depth === 0) flush()
  }
}