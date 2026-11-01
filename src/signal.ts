type Listener<T> = (value: T) => void

export const signal = <T>(initial: T) => {
  let current = initial
  const listeners = new Set<Listener<T>>()

  return {
    get value(): T {
      return current
    },
    set value(next: T) {
      if (current === next) return
      current = next
      for (const listener of Array.from(listeners)) listener(next)
    },
    subscribe(listener: Listener<T>) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}