<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import type { ChartOptions } from 'chart.js'
import { GRID, gradient, tooltipStyle } from '../chartSetup'
import { usd } from '../utils'

const props = defineProps<{ days: { label: string; avg: number }[] }>()
const maxIdx = computed(() => props.days.reduce((m, d, i, a) => (d.avg > a[m].avg ? i : m), 0))

const data = computed(() => ({
  labels: props.days.map((d) => d.label),
  datasets: [
    {
      data: props.days.map((d) => d.avg),
      backgroundColor: (c: { chart: any; dataIndex: number }) =>
        c.dataIndex === maxIdx.value
          ? gradient(c.chart, [[0, '#8cc63f'], [1, 'rgba(140,198,63,.45)']])
          : 'rgba(20,23,26,0.07)',
      borderRadius: 8,
      maxBarThickness: 30,
    },
  ],
}))
const options = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { ...tooltipStyle, displayColors: false, callbacks: { title: (i) => `${i[0].label} average`, label: (i) => ` ${usd(i.parsed.y ?? 0)} per day` } },
  },
  scales: {
    x: { grid: { display: false }, border: { display: false } },
    y: { grid: { color: GRID }, border: { display: false }, ticks: { maxTicksLimit: 4, callback: (v) => `$${v}` } },
  },
}))
</script>

<template>
  <section class="card pad">
    <header class="card-head">
      <div>
        <h3>When you spend</h3>
        <p class="muted small">Average per day — {{ days[maxIdx].label }} is your priciest</p>
      </div>
    </header>
    <div class="chart"><Bar :data="data" :options="options" /></div>
  </section>
</template>

<style scoped>
.chart {
  height: 190px;
  margin-top: 12px;
}
</style>
