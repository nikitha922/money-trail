<script setup lang="ts">
import { computed } from 'vue'
import type { Account } from '../data'
import { pctText, usd } from '../utils'

const props = defineProps<{ total: number; pct: number; accounts: Account[] }>()
const cash = computed(() => props.accounts.filter((a) => a.type === 'cash').reduce((s, a) => s + a.balance, 0))
const invest = computed(() => props.accounts.filter((a) => a.type === 'invest').reduce((s, a) => s + a.balance, 0))
</script>

<template>
  <section class="hero">
    <div class="top">
      <span>Total net worth</span>
      <span class="badge">{{ pctText(pct) }}</span>
    </div>
    <div class="num">{{ usd(total) }}</div>
    <div class="split">
      <div><small>Cash</small><b>{{ usd(cash) }}</b></div>
      <div><small>Investments</small><b>{{ usd(invest) }}</b></div>
    </div>
    <div class="mask">•••• •••• •••• 7890</div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  padding: 20px 22px;
  border-radius: 20px;
  color: #10200a;
  background:
    radial-gradient(240px 160px at 90% 0%, rgba(255, 255, 255, 0.45), transparent 70%),
    linear-gradient(135deg, #b4de64, #7cbd2e);
  box-shadow: 0 16px 30px -16px rgba(111, 174, 43, 0.7);
}
.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
}
.badge {
  padding: 2px 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  font-weight: 700;
}
.num {
  margin: 8px 0 14px;
  font-size: 34px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.split {
  display: flex;
  gap: 28px;
}
.split small {
  display: block;
  font-size: 11.5px;
  opacity: 0.7;
}
.split b {
  font-size: 15px;
}
.mask {
  margin-top: 16px;
  font-size: 12px;
  letter-spacing: 0.12em;
  opacity: 0.6;
}
</style>
