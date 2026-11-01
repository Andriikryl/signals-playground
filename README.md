# signals-playground

A learning project: a small signals library (`signal`, `computed`, `effect`, `batch`) written from scratch in TypeScript, test first, to understand how reactivity in Solid, Vue, Preact and similar frameworks works under the hood.

It is not published to npm and not meant for production. The goal is to understand the push-pull algorithm, not to compete with `alien-signals` or `@preact/signals`.

## How it works

- **Push:** when a `signal` changes, it synchronously marks everything that depends on it as stale. Nothing is recomputed yet.
- **Pull:** a `computed` recomputes lazily, only when it is read and only if it is stale. The result is cached.
- **Automatic dependency tracking:** while a `computed` or `effect` runs, it sits on top of a global stack. Any signal read at that moment subscribes the item on top of the stack. Dependencies are dropped and re-collected on every run, so they can change dynamically.
- **Two phases:** marking and running are separate. Effects are queued while the graph is being marked and run afterwards, so a "diamond" dependency (`a → b`, `a → c`, `d = b + c`) runs its effect once and never sees an inconsistent value.

## API

```ts
import { computed } from './src/computed'
import { batch } from './src/context'
import { effect } from './src/effect'
import { signal } from './src/signal'
```

### `signal(initial)`

A value that can be read and written. Writing the same value is a no-op.

```ts
const count = signal(0)

count.value
count.value = 1

const unsubscribe = count.subscribe((value) => console.log(value))
unsubscribe()
```

### `computed(fn)`

A lazy, cached, read-only derived value. Dependencies are tracked automatically.

```ts
const count = signal(1)
const double = computed(() => count.value * 2)

double.value
count.value = 5
double.value
```

It recomputes only on read after a dependency changed. A computed that reads itself, directly or through other computeds, throws `Cycle detected in computed`. If its function throws, the error is rethrown on read and the computed recovers on the next successful run.

### `effect(fn)`

Runs `fn` immediately and again whenever any signal or computed it read changes. Returns a function that stops it.

```ts
const count = signal(0)
const stop = effect(() => console.log(count.value))

count.value = 1
stop()
```

### `batch(fn)`

Groups several writes into one pass: effects run once, after the outermost `batch` finishes. Returns whatever `fn` returns. Every signal write already runs inside a `batch` internally.

If effects throw while the queue is running, the remaining effects still run. Afterwards the single error is rethrown from the write (or `batch`), or an `AggregateError` if several effects failed.

```ts
batch(() => {
  a.value = 2
  b.value = 3
})
```

## Project layout

| File | Purpose |
| --- | --- |
| `src/context.ts` | The tracking stack, `trackDependency`, the effect queue, `batch` |
| `src/signal.ts` | `signal` |
| `src/computed.ts` | `computed` |
| `src/effect.ts` | `effect` |
| `src/*.test.ts` | Tests, one file per concern (`diamond`, `batch`, `errors`, ...) |

## Development

Requires Node and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm test        # vitest in watch mode
pnpm test:run    # run once
pnpm typecheck   # tsc --noEmit
```

## Known limitations

- Effects that keep retriggering each other are cut off after 100 passes with `Effect loop detected`. The limit is a fixed constant, not configurable.
- Updates are synchronous. There is no async scheduling and no `untracked`.
- No custom equality: values are compared with `===`.
- No cleanup callbacks inside effects and no ownership tree for nested effects.

## Roadmap

- Bind signals to the DOM (`bind`, a tiny `h()` helper) and build a small app on top.
- Compare against `@vue/reactivity` and `alien-signals`.

## References

- Willy Brauner, [Signals, the push-pull based algorithm](https://willybrauner.com/journal/signal-the-push-pull-based-algorithm)
- Milo Mighdoll, [Reactivity](https://milomg.dev/2022-12-01/reactivity)
- [TC39 Signals proposal](https://github.com/tc39/proposal-signals)
