<script setup lang="ts">
import { usd } from '../utils'

defineProps<{
  pace: number
  items: { id: string; name: string; icon: string; color: string; budget: number; spent: number; ratio: number }[]
}>()
const month = new Date().toLocaleDateString('en-US', { month: 'long' })
const state = (r: number, pace: number) => (r > 1 ? 'over' : r > pace + 0.1 ? 'warn' : 'ok')
</script>

<template>
  <section class="card pad">
    <header class="card-head">
      <div>
        <h3>{{ month }} budgets</h3>
        <p class="muted small">The marker shows where you should be by today</p>
      </div>
    </header>
    <ul>
      <li v-for="b in items" :key="b.id" :class="state(b.ratio, pace)">
        <div class="top">
          <span class="name"><span class="ico">{{ b.icon }}</span>{{ b.name }}</span>
          <span class="nums"><b>{{ usd(b.spent) }}</b> <span class="muted">/ {{ usd(b.budget) }}</span></span>
        </div>
        <div class="track" :title="`${Math.round(b.ratio * 100)}% used`">
          <div class="fill" :style="{ width: Math.min(100, b.ratio * 100) + '%' }" />
          <div class="pace" :style="{ left: pace * 100 + '%' }" />
        </div>
        <div class="foot muted">
          {{ b.ratio > 1 ? `${usd(b.spent - b.budget)} over budget` : `${usd(b.budget - b.spent)} left` }}
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
ul {
  display: grid;
  gap: 16px;
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
}
.top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 14px;
}
.ico {
  margin-right: 8px;
}
.nums {
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}
.track {
  position: relative;
  height: 10px;
  margin: 8px 0 5px;
  border-radius: 6px;
  background: rgba(20, 23, 26, 0.07);
}
.fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.ok .fill {
  background: linear-gradient(90deg, #6fae2b, #b6d957);
}
.warn .fill {
  background: linear-gradient(90deg, #f6d743, #f4a259);
}
.over .fill {
  background: linear-gradient(90deg, #f4a259, #e5484d);
}
.pace {
  position: absolute;
  top: -3px;
  bottom: -3px;
  width: 2px;
  border-radius: 1px;
  background: #14171a;
  opacity: 0.55;
}
.foot {
  font-size: 12px;
}
.over .foot {
  color: var(--bad);
}
</style>
