<script setup lang="ts">
import { computed } from 'vue'
import { usd } from '../utils'

const props = defineProps<{ spent: number; limit: number; pace: number }>()
const ratio = computed(() => props.spent / props.limit)
const projected = computed(() => props.spent / props.pace)
</script>

<template>
  <section class="card pad">
    <header class="card-head">
      <div>
        <h3>Monthly spending limit</h3>
        <p class="muted small">All budgets combined</p>
      </div>
      <span class="chip" :class="ratio > 1 ? 'chip-bad' : 'chip-good'">{{ Math.round(ratio * 100) }}% used</span>
    </header>
    <div class="track">
      <div class="fill" :style="{ width: Math.min(100, ratio * 100) + '%' }" />
      <div class="pace" :style="{ left: pace * 100 + '%' }" title="Where you should be by today" />
    </div>
    <div class="row">
      <b>{{ usd(spent) }}</b>
      <span class="muted">{{ usd(limit) }}</span>
    </div>
    <p class="muted small note">
      On pace to spend <b>{{ usd(projected) }}</b> this month —
      <span :class="projected > limit ? 'bad' : 'good'">{{ projected > limit ? `${usd(projected - limit)} over` : `${usd(limit - projected)} under` }}</span>
    </p>
  </section>
</template>

<style scoped>
.track {
  position: relative;
  height: 26px;
  margin: 18px 0 8px;
  border-radius: 8px;
  background: repeating-linear-gradient(135deg, rgba(20, 23, 26, 0.04) 0 6px, rgba(20, 23, 26, 0.08) 6px 12px);
}
.fill {
  height: 100%;
  border-radius: 8px;
  background: linear-gradient(90deg, #6fae2b, #b6d957);
  transition: width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.pace {
  position: absolute;
  top: -5px;
  bottom: -5px;
  width: 2px;
  background: var(--text);
  opacity: 0.6;
  border-radius: 1px;
}
.row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}
.note {
  margin-top: 10px;
}
.good {
  color: var(--good);
}
.bad {
  color: var(--bad);
}
</style>
