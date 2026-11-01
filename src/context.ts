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