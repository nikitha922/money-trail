<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import type { ChartOptions, Plugin } from 'chart.js'
import { tooltipStyle } from '../chartSetup'
import { pctText } from '../utils'

const props = defineProps<{ rate: number; prev: number | null }>()
// 40% savings rate = a perfect score.
const score = computed(() => Math.max(0, Math.min(100, Math.round((props.rate / 40) * 100))))
const label = computed(() => (score.value >= 75 ? 'Excellent' : score.value >= 50 ? 'Healthy' : score.value >= 25 ? 'Fair' : 'Needs work'))

const center: Plugin<'doughnut'> = {
  id: 'gaugeCenter',
  afterDraw(chart) {
    const { ctx, chartArea } = chart
    const x = (chartArea.left + chartArea.right) / 2
    const y = chartArea.bottom - 6
    ctx.save()
    ctx.textAlign = 'center'
    ctx.fillStyle = '#14171a'
    ctx.font = `700 30px ${chart.options.font?.family ?? 'sans-serif'}`
    ctx.fillText(`${score.value}%`, x, y)
    ctx.fillStyle = '#8a9099'
    ctx.font = `12px ${chart.options.font?.family ?? 'sans-serif'}`
    ctx.fillText(label.value, x, y + 20)
    ctx.restore()
  },
}

// Ten segments, like the reference gauge.
const SEGMENTS = 10
const data = computed(() => ({
  datasets: [
    {
      data: new Array(SEGMENTS).fill(1),
      backgroundColor: Array.from({ length: SEGMENTS }, (_, i) =>
        (i + 1) * 10 <= score.value + 5 ? `hsl(${78 + i * 3}, ${55 + i * 2}%, ${62 - i * 2.2}%)` : 'rgba(20,23,26,0.07)',
      ),
      borderColor: '#fff',
      borderWidth: 3,
      borderRadius: 5,
    },
  ],
}))
const options = computed<ChartOptions<'doughnut'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  rotation: -90,
  circumference: 180,
  cutout: '68%',
  layout: { padding: { top: 6, left: 8, right: 8, bottom: 30 } },
  plugins: { legend: { display: false }, tooltip: { ...tooltipStyle, enabled: false } },
}))
</script>

<template>
  <section class="card pad">
    <header class="card-head">
      <div>
        <h3>Financial health</h3>
        <p class="muted small">Based on your savings rate</p>
      </div>
    </header>
    <div class="big">
      {{ rate.toFixed(1) }}%
      <span v-if="prev !== null" class="chip" :class="rate >= prev ? 'chip-good' : 'chip-bad'">{{ pctText(rate - prev) }} pts</span>
    </div>
    <div class="gauge"><Doughnut :data="data" :options="options" :plugins="[center]" /></div>
    <p class="muted small">Share of income saved over the selected period. 40% earns a perfect score.</p>
  </section>
</template>

<style scoped>
.big {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.02em;
}
.gauge {
  height: 180px;
  margin: 4px 0 8px;
}
</style>
