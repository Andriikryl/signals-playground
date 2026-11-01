import { computed } from '../computed'
import { effect } from '../effect'
import { signal } from '../signal'

const byId = (id: string): HTMLElement => {
  const element = document.getElementById(id)
  if (!element) throw new Error(`Missing element #${id}`)
  return element
}

const count = signal(0)
const double = computed(() => {
  console.log('double recomputed')
  return count.value * 2
})
const plusOne = computed(() => double.value + 1)

byId('inc').addEventListener('click', () => {
  count.value += 1
})

effect(() => {
  byId('count').textContent = String(count.value)
})
effect(() => {
  byId('double').textContent = String(double.value)
})
effect(() => {
  byId('plus-one').textContent = String(plusOne.value)
})
