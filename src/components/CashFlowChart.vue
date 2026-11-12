<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import { GRID, gradient, tooltipStyle } from '../chartSetup'
import { compact, signed, usd } from '../utils'

const props = defineProps<{ buckets: { label: string; income: number; spending: number }[] }>()

const data = computed<ChartData<'bar' | 'line'>>(() => ({
  labels: props.buckets.map((b) => b.label),
  datasets: [
    {
      type: 'bar',
      label: 'Income',
      data: props.buckets.map((b) => b.income),
      backgroundColor: (c: { chart: any }) => gradient(c.chart, [[0, '#8cc63f'], [1, 'rgba(140,198,63,.35)']]),
      hoverBackgroundColor: '#6fae2b',
      borderRadius: 6,
      maxBarThickness: 26,
      order: 2,
    },
    {
      type: 'bar',
      label: 'Spending',
      data: props.buckets.map((b) => b.spending),
      backgroundColor: (c: { chart: any }) => gradient(c.chart, [[0, '#f6b26b'], [1, 'rgba(244,162,89,.35)']]),
      hoverBackgroundColor: '#f08c3a',
      borderRadius: 6,
      maxBarThickness: 26,
      order: 2,
    },
    {
      type: 'line',
      label: 'Net',
      data: props.buckets.map((b) => b.income - b.spending),
      borderColor: '#1c2417',
      backgroundColor: '#1c2417',
      borderWidth: 2,
      tension: 0.35,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      order: 1,
    },
  ],
}))

const options = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      ...tooltipStyle,
      callbacks: {
        label: (i) => ` ${i.dataset.label}  ${i.dataset.label === 'Net' ? signed(i.parsed.y ?? 0, 0) : usd(i.parsed.y ?? 0)}`,
      },
    },
  },
  scales: {
    x: { grid: { display: false }, border: { display: false } },
    y: { grid: { color: GRID }, border: { display: false }, ticks: { callback: (v) => compact(Number(v)), maxTicksLimit: 5 } },
  },
}))
</script>

<template>
  <section class="card pad">
    <header class="card-head">
      <div>
        <h3>Cash flow</h3>
        <p class="muted small">Income vs. spending</p>
      </div>
      <div class="legend">
        <span><i style="background:#8cc63f" />Income</span>
        <span><i style="background:#f4a259" />Spending</span>
        <span><i style="background:#1c2417" />Net</span>
      </div>
    </header>
    <div class="chart"><Bar :data="data as ChartData<'bar'>" :options="options" /></div>
  </section>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.chart {
  position: relative;
  flex: 1;
  min-height: 260px;
  margin-top: 14px;
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
