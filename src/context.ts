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

export const schedule = (job: () => void) => {
  pending.add(job)
}

const flush = () => {
  if (flushing) return
  flushing = true
  try {
    while (pending.size > 0) {
      const jobs = Array.from(pending)
      pending.clear()
      for (const job of jobs) job()
    }
  } finally {
    flushing = false
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