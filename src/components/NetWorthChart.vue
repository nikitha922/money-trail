<script setup lang="ts">
import { computed, ref } from 'vue'
import { Line } from 'vue-chartjs'
import type { ChartOptions } from 'chart.js'
import type { NetWorthPoint } from '../data'
import { crosshair, GRID, gradient, tooltipStyle } from '../chartSetup'
import { compact, longDate, pctText, shortDate, usd } from '../utils'

const props = defineProps<{ points: NetWorthPoint[] }>()

const hoverIdx = ref<number | null>(null)
const first = computed(() => props.points[0])
const current = computed(() => (hoverIdx.value === null ? props.points[props.points.length - 1] : props.points[hoverIdx.value]))
const change = computed(() => current.value.total - first.value.total)
const changePct = computed(() => (change.value / first.value.total) * 100)

const data = computed(() => ({
  labels: props.points.map((p) => p.date),
  datasets: [
    {
      label: 'Investments',
      data: props.points.map((p) => p.invest),
      borderColor: '#f2b632',
      backgroundColor: (c: { chart: any }) => gradient(c.chart, [[0, 'rgba(246,215,67,.65)'], [1, 'rgba(246,215,67,.04)']]),
      fill: 'origin',
      tension: 0.35,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: '#f2b632',
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 2,
      borderWidth: 2,
    },
    {
      label: 'Cash',
      data: props.points.map((p) => p.cash + p.invest),
      borderColor: '#6fae2b',
      backgroundColor: (c: { chart: any }) => gradient(c.chart, [[0, 'rgba(140,198,63,.65)'], [1, 'rgba(140,198,63,.05)']]),
      fill: '-1',
      tension: 0.35,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: '#6fae2b',
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 2,
      borderWidth: 2,
    },
  ],
}))

const options = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  onHover: (_e, els) => {
    hoverIdx.value = els.length ? els[0].index : null
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      ...tooltipStyle,
      callbacks: {
        title: (items) => longDate(props.points[items[0].dataIndex].date),
        label: (item) => {
          const p = props.points[item.dataIndex]
          return item.datasetIndex === 0 ? ` Investments  ${usd(p.invest)}` : ` Cash  ${usd(p.cash)}`
        },
        footer: (items) => `Net worth  ${usd(props.points[items[0].dataIndex].total)}`,
      },
      footerColor: '#14171a',
      footerFont: { weight: 600, size: 12 },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { maxTicksLimit: 7, maxRotation: 0, callback: (_v, i) => shortDate(props.points[i].date) },
    },
    y: {
      grid: { color: GRID },
      border: { display: false },
      ticks: { callback: (v) => compact(Number(v)), maxTicksLimit: 5 },
    },
  },
}))
</script>

<template>
  <section class="card pad">
    <header class="card-head">
      <div>
        <h3>Net worth</h3>
        <div class="big">{{ usd(current.total) }}</div>
        <div class="sub">
          <span :class="change >= 0 ? 'up' : 'down'">{{ change >= 0 ? '▲' : '▼' }} {{ usd(Math.abs(change)) }} ({{ pctText(changePct) }})</span>
          <span class="muted"> · {{ hoverIdx === null ? 'this period' : longDate(current.date) }}</span>
        </div>
      </div>
      <div class="legend">
        <span><i style="background:#8cc63f" />Cash</span>
        <span><i style="background:#f6d743" />Investments</span>
      </div>
    </header>
    <div class="chart" @mouseleave="hoverIdx = null">
      <Line :data="data" :options="options" :plugins="[crosshair]" />
    </div>
  </section>
</template>

<style scoped>
.chart {
  height: 300px;
  margin-top: 12px;
}
.big {
  margin-top: 4px;
  font-size: 34px;
  font-weight: 700;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}
.sub {
  margin-top: 2px;
  font-size: 13px;
}
.up {
  color: var(--good);
}
.down {
  color: var(--bad);
}
.legend {
  display: flex;
  gap: 14px;
  font-size: 12px;
  color: var(--muted);
}
.legend i {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 6px;
  border-radius: 50%;
}
</style>
