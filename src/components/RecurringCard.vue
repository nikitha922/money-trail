<script setup lang="ts">
import { CATEGORY_BY_ID } from '../data'
import { usd, usd2 } from '../utils'

defineProps<{
  items: { merchant: string; amount: number; category: string; day: number; daysUntil: number }[]
  total: number
}>()
const when = (d: number) => (d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : `In ${d} days`)
</script>

<template>
  <section class="card pad">
    <header class="card-head">
      <div>
        <h3>Subscriptions & recurring</h3>
        <p class="muted small">{{ usd(total) }} / month · {{ usd(total * 12) }} / year</p>
      </div>
    </header>
    <ul>
      <li v-for="r in items" :key="r.merchant">
        <span class="ico" :style="{ background: CATEGORY_BY_ID[r.category].color + '26' }">{{ r.merchant[0] }}</span>
        <div class="grow">
          <div>{{ r.merchant }}</div>
          <div class="muted small">{{ when(r.daysUntil) }}</div>
        </div>
        <b>{{ usd2(r.amount) }}</b>
      </li>
    </ul>
  </section>
</template>

<style scoped>
ul {
  display: grid;
  gap: 4px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}
li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 7px 8px;
  margin: 0 -8px;
  border-radius: 10px;
  transition: background 0.15s;
}
li:hover {
  background: rgba(20, 23, 26, 0.04);
}
.ico {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  font-weight: 700;
  font-size: 14px;
}
.grow {
  flex: 1;
  min-width: 0;
  font-size: 14px;
}
b {
  font-variant-numeric: tabular-nums;
}
</style>
