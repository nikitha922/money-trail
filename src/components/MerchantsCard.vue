<script setup lang="ts">
import { computed } from 'vue'
import { CATEGORY_BY_ID } from '../data'
import { usd } from '../utils'

const props = defineProps<{ merchants: { name: string; total: number; count: number; category: string }[] }>()
const max = computed(() => Math.max(...props.merchants.map((m) => m.total), 1))
</script>

<template>
  <section class="card pad">
    <header class="card-head"><h3>Top merchants</h3></header>
    <ul>
      <li v-for="(m, i) in merchants" :key="m.name">
        <span class="rank">{{ i + 1 }}</span>
        <div class="body">
          <div class="row"><span>{{ m.name }}</span><b>{{ usd(m.total) }}</b></div>
          <div class="track">
            <div :style="{ width: (m.total / max) * 100 + '%', background: `linear-gradient(90deg, ${CATEGORY_BY_ID[m.category].color}, ${CATEGORY_BY_ID[m.category].color}66)` }" />
          </div>
          <div class="muted small">{{ m.count }} {{ m.count === 1 ? 'purchase' : 'purchases' }} · {{ CATEGORY_BY_ID[m.category].name }}</div>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
ul {
  display: grid;
  gap: 14px;
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
}
li {
  display: flex;
  gap: 12px;
}
.rank {
  display: grid;
  place-items: center;
  flex: 0 0 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(20, 23, 26, 0.07);
  font-size: 12px;
  color: var(--muted);
}
.body {
  flex: 1;
  min-width: 0;
}
.row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}
.track {
  height: 6px;
  margin: 6px 0 4px;
  border-radius: 3px;
  background: rgba(20, 23, 26, 0.07);
  overflow: hidden;
}
.track div {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s;
}
</style>
