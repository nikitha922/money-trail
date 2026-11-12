<script setup lang="ts">
import { CATEGORY_BY_ID, INCOME, type Transaction } from '../data'
import { shortDate, signed } from '../utils'

defineProps<{ txns: Transaction[] }>()
const cat = (id: string) => (id === 'income' ? INCOME : CATEGORY_BY_ID[id])
</script>

<template>
  <section class="card pad">
    <header class="card-head">
      <h3>Recent activity</h3>
      <a class="link" href="#transactions">See all</a>
    </header>
    <ul>
      <li v-for="t in txns" :key="t.id">
        <span class="ico" :style="{ background: cat(t.category).color + '30' }">{{ cat(t.category).icon }}</span>
        <div class="who">
          <div class="m">{{ t.merchant }}</div>
          <div class="muted small">{{ shortDate(t.date) }}<template v-if="t.pending"> · <span class="pending">Pending</span></template></div>
        </div>
        <b :class="t.amount > 0 ? 'pos' : ''">{{ signed(t.amount, 0) }}</b>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.link {
  font-size: 12.5px;
  color: var(--muted);
  text-decoration: none;
}
.link:hover {
  color: var(--text);
}
ul {
  display: grid;
  gap: 2px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}
li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  margin: 0 -8px;
  border-radius: 12px;
  transition: background 0.15s;
}
li:hover {
  background: rgba(20, 23, 26, 0.04);
}
.ico {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  font-size: 17px;
}
.who {
  flex: 1;
  min-width: 0;
}
.m {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
b {
  font-variant-numeric: tabular-nums;
  font-size: 14px;
}
b.pos {
  color: var(--good);
}
.pending {
  color: #c26a14;
}
</style>
