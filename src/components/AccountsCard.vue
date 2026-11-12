<script setup lang="ts">
import { computed } from 'vue'
import type { Account } from '../data'
import { pctText, usd } from '../utils'

const props = defineProps<{
  groups: { key: string; label: string; items: Account[]; total: number }[]
}>()
const icon: Record<string, string> = { cash: '🏦', credit: '💳', invest: '📈' }
const tone: Record<string, string> = { cash: '#6fae2b', credit: '#e9895a', invest: '#d9a516' }
const assets = computed(() => props.groups.filter((g) => g.key !== 'credit').reduce((a, g) => a + g.total, 0))
</script>

<template>
  <section class="card pad">
    <header class="card-head">
      <div>
        <h3>Accounts</h3>
        <p class="muted small">{{ usd(assets) }} in assets</p>
      </div>
    </header>
    <div v-for="g in groups" :key="g.key" class="group">
      <div class="g-head">
        <span>{{ g.label }}</span>
        <span>{{ usd(g.total) }}</span>
      </div>
      <div v-for="a in g.items" :key="a.id" class="acct">
        <span class="ico" :style="{ background: tone[g.key] + '22', color: tone[g.key] }">{{ icon[g.key] }}</span>
        <div class="meta">
          <div class="n">{{ a.name }}</div>
          <div class="muted small">{{ a.institution }}</div>
        </div>
        <div class="bal">
          <div>{{ usd(a.balance) }}</div>
          <div class="small" :class="a.change >= 0 ? 'good' : 'bad'">{{ pctText(a.change) }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.group {
  margin-top: 14px;
}
.g-head {
  display: flex;
  justify-content: space-between;
  padding-bottom: 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
.acct {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 8px;
  margin: 0 -8px;
  border-radius: 10px;
  transition: background 0.15s;
}
.acct:hover {
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
.meta {
  flex: 1;
  min-width: 0;
}
.n {
  font-size: 14px;
}
.bal {
  text-align: right;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.bal .small {
  font-weight: 500;
}
.good {
  color: var(--good);
}
.bad {
  color: var(--bad);
}
</style>
