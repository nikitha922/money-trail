<script setup lang="ts">
import { computed, ref } from 'vue'
import { Doughnut } from 'vue-chartjs'
import type { ChartOptions, Plugin } from 'chart.js'
import { tooltipStyle } from '../chartSetup'
import { pctText, usd } from '../utils'

interface Row { id: string; name: string; icon: string; color: string; total: number; share: number; change: number | null }
const props = defineProps<{ rows: Row[]; total: number; selected: string | null }>()
const emit = defineEmits<{ select: [id: string | null] }>()

const chartRef = ref<{ chart: import('chart.js').Chart } | null>(null)
const hovered = ref<number | null>(null)

const focusRow = computed(() => (hovered.value === null ? null : props.rows[hovered.value]))

const setHover = (i: number | null) => {
  hovered.value = i
  const chart = chartRef.value?.chart
  if (!chart) return
  chart.setActiveElements(i === null ? [] : [{ datasetIndex: 0, index: i }])
  chart.tooltip?.setActiveElements(i === null ? [] : [{ datasetIndex: 0, index: i }], { x: 0, y: 0 })
  chart.update()
}

const center: Plugin<'doughnut'> = {
  id: 'center',
  afterDraw(chart) {
    const { ctx, chartArea } = chart
    const x = (chartArea.left + chartArea.right) / 2
    const y = (chartArea.top + chartArea.bottom) / 2
    const row = focusRow.value
    ctx.save()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#8a9099'
    ctx.font = `12px ${chart.options.font?.family ?? 'sans-serif'}`
    ctx.fillText(row ? row.name : 'Total spent', x, y - 18)
    ctx.fillStyle = '#14171a'
    ctx.font = `700 26px ${chart.options.font?.family ?? 'sans-serif'}`
    ctx.fillText(usd(row ? row.total : props.total), x, y + 4)
    ctx.fillStyle = '#8b93a7'
    ctx.font = `12px ${chart.options.font?.family ?? 'sans-serif'}`
    ctx.fillText(row ? `${row.share.toFixed(1)}% of spending` : `${props.rows.length} categories`, x, y + 26)
    ctx.restore()
  },
}

const data = computed(() => ({
  labels: props.rows.map((r) => r.name),
  datasets: [
    {
      data: props.rows.map((r) => r.total),
      backgroundColor: props.rows.map((r) => (props.selected && props.selected !== r.id ? r.color + '55' : r.color)),
      borderColor: '#ffffff',
      borderWidth: 3,
      hoverOffset: 8,
      borderRadius: 6,
      spacing: 1,
    },
  ],
}))

const options = computed<ChartOptions<'doughnut'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '72%',
  layout: { padding: 10 },
  onHover: (_e, els) => {
    hovered.value = els.length ? els[0].index : null
  },
  onClick: (_e, els) => {
    if (els.length) emit('select', props.selected === props.rows[els[0].index].id ? null : props.rows[els[0].index].id)
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      ...tooltipStyle,
      callbacks: { label: (i) => ` ${usd(i.parsed)}  ·  ${props.rows[i.dataIndex].share.toFixed(1)}%` },
    },
  },
}))
</script>

<template>
  <section class="card pad">
    <header class="card-head">
      <div>
        <h3>Spending by category</h3>
        <p class="muted small">Click a category to filter transactions</p>
      </div>
      <button v-if="selected" class="ghost" @click="emit('select', null)">Clear filter ✕</button>
    </header>
    <div class="donut" @mouseleave="setHover(null)">
      <Doughnut ref="chartRef" :data="data" :options="options" :plugins="[center]" />
    </div>
    <ul class="rows">
      <li
        v-for="(r, i) in rows"
        :key="r.id"
        :class="{ active: selected === r.id, dim: selected && selected !== r.id }"
        @mouseenter="setHover(i)"
        @mouseleave="setHover(null)"
        @click="emit('select', selected === r.id ? null : r.id)"
      >
        <span class="icon" :style="{ background: r.color + '26' }">{{ r.icon }}</span>
        <span class="name">{{ r.name }}</span>
        <span v-if="r.change !== null" class="delta" :class="r.change > 0 ? 'bad' : 'good'">{{ pctText(r.change) }}</span>
        <span class="amt">{{ usd(r.total) }}</span>
        <span class="bar"><span :style="{ width: r.share + '%', background: `linear-gradient(90deg, ${r.color}, ${r.color}99)` }" /></span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.donut {
  height: 250px;
  margin: 8px 0 14px;
}
.rows {
  display: grid;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.rows li {
  position: relative;
  display: grid;
  grid-template-columns: 32px 1fr auto 76px;
  align-items: center;
  gap: 10px;
  padding: 8px 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
}
.rows li:hover,
.rows li.active {
  background: rgba(20, 23, 26, 0.04);
}
.rows li.dim {
  opacity: 0.45;
}
.icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  font-size: 16px;
}
.name {
  font-size: 14px;
}
.amt {
  text-align: right;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.delta {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.delta.good {
  color: var(--good);
}
.delta.bad {
  color: var(--bad);
}
.bar {
  position: absolute;
  left: 52px;
  right: 10px;
  bottom: 4px;
  height: 3px;
  border-radius: 2px;
  background: rgba(20, 23, 26, 0.07);
  overflow: hidden;
}
.bar span {
  display: block;
  height: 100%;
  border-radius: 2px;
}
.ghost {
  border: 1px solid var(--line);
  background: transparent;
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 12px;
  color: var(--muted);
}
.ghost:hover {
  color: var(--text);
  border-color: var(--line-strong);
}
</style>
