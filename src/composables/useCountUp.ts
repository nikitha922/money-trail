import { onUnmounted, ref, watch, type Ref } from 'vue'

/** Smoothly tweens a number whenever its source changes. */
export function useCountUp(source: Ref<number>, ms = 700) {
  const shown = ref(source.value)
  let raf = 0
  watch(source, (to) => {
    const from = shown.value
    const t0 = performance.now()
    cancelAnimationFrame(raf)
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / ms)
      const eased = 1 - Math.pow(1 - p, 3)
      shown.value = from + (to - from) * eased
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
  })
  onUnmounted(() => cancelAnimationFrame(raf))
  return shown
}
