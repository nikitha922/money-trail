<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { useCountUp } from '../composables/useCountUp'
import { pctText, usd } from '../utils'

const props = defineProps<{
  label: string
  value: number
  format?: 'usd' | 'pct'
  delta: number | null
  /** When true, an increase is bad (e.g. spending). */
  invert?: boolean
  spark: number[]
  color: string
  id: string
}>()

const shown = useCountUp(toRef(props, 'value'))
const text = computed(() => (props.format === 'pct' ? `${shown.value.toFixed(1)}%` : usd(shown.value)))

const W = 220
const H = 54
const points = computed(() => {
  const lo = Math.min(...props.spark)
  const hi = Math.max(...props.spark)
  const span = hi - lo || 1
  return props.spark.map((v, i) => ({
    x: (i / (props.spark.length - 1)) * W,
    y: H - 6 - ((v - lo) / span) * (H - 14),
    v,
  }))
})
const line = computed(() => {
  const p = points.value
  let d = `M${p[0].x},${p[0].y}`
  for (let i = 1; i < p.length; i++) {
    const cx = (p[i - 1].x + p[i].x) / 2
    d += ` C${cx},${p[i - 1].y} ${cx},${p[i].y} ${p[i].x},${p[i].y}`
  }
  return d
})
const area = computed(() => `${line.value} L${W},${H} L0,${H} Z`)

const hover = ref<number | null>(null)
const onMove = (e: MouseEvent) => {
  const r = (e.currentTarget as SVGElement).getBoundingClientRect()
  const x = ((e.clientX - r.left) / r.width) * W
  hover.value = Math.max(0, Math.min(points.value.length - 1, Math.round((x / W) * (points.value.length - 1))))
}

const good = computed(() => (props.delta === null ? null : props.invert ? props.delta <= 0 : props.delta >= 0))
</script>

<template>
  <article class="kpi" :style="{ '--tone': color }">
    <header>
      <span class="kpi-label">{{ label }}</span>
      <span v-if="delta !== null" class="chip" :class="good ? 'chip-good' : 'chip-bad'">
        {{ delta >= 0 ? '▲' : '▼' }} {{ pctText(delta).slice(1) }}
      </span>
    </header>
    <div class="kpi-value">{{ text }}</div>
    <svg :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" class="spark" @mousemove="onMove" @mouseleave="hover = null">
      <defs>
        <linearGradient :id="`sg-${id}`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" :stop-color="color" stop-opacity="0.35" />
          <stop offset="1" :stop-color="color" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path :d="area" :fill="`url(#sg-${id})`" />
      <path :d="line" fill="none" :stroke="color" stroke-width="2" vector-effect="non-scaling-stroke" />
      <template v-if="hover !== null">
        <line :x1="points[hover].x" :x2="points[hover].x" y1="0" :y2="H" stroke="rgba(20,23,26,.3)" stroke-dasharray="3 3" vector-effect="non-scaling-stroke" />
        <circle :cx="points[hover].x" :cy="points[hover].y" r="3.5" :fill="color" stroke="#fff" stroke-width="1.5" vector-effect="non-scaling-stroke" />
      </template>
    </svg>
    <div class="spark-readout" :class="{ on: hover !== null }">
      {{ hover !== null ? (format === 'pct' ? `${points[hover].v.toFixed(1)}%` : usd(points[hover].v)) : ' ' }}
    </div>
  </article>
</template>

<style scoped>
.kpi {
  position: relative;
  padding: 4px 0 6px;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.kpi-label {
  font-size: 13px;
  color: var(--muted);
}
.kpi-value {
  margin: 6px 0 10px;
  font-size: 30px;
  font-weight: 600;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}
.spark {
  display: block;
  width: 100%;
  height: 54px;
  cursor: crosshair;
}
.spark-readout {
  height: 16px;
  margin-top: 4px;
  font-size: 12px;
  color: var(--muted);
  opacity: 0;
  transition: opacity 0.15s;
}
.spark-readout.on {
  opacity: 1;
}
</style>
