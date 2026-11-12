<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { CATEGORIES, CATEGORY_BY_ID, INCOME, type Transaction } from '../data'
import { longDate, shortDate, signed } from '../utils'

const props = defineProps<{ txns: Transaction[]; category: string | null }>()
const emit = defineEmits<{ category: [id: string | null] }>()

const query = ref('')
const sort = ref<'date' | 'amount'>('date')
const dir = ref<1 | -1>(-1)
const shown = ref(12)
const search = ref<HTMLInputElement | null>(null)

const catOf = (id: string) => (id === 'income' ? INCOME : CATEGORY_BY_ID[id])

const rows = computed(() => {
  const q = query.value.trim().toLowerCase()
  const list = props.txns.filter(
    (t) => !q || t.merchant.toLowerCase().includes(q) || catOf(t.category).name.toLowerCase().includes(q),
  )
  return [...list].sort((a, b) =>
    sort.value === 'date'
      ? dir.value * (a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
      : dir.value * (Math.abs(a.amount) - Math.abs(b.amount)),
  )
})
const total = computed(() => rows.value.reduce((s, t) => s + t.amount, 0))

const toggleSort = (key: 'date' | 'amount') => {
  if (sort.value === key) dir.value = (dir.value * -1) as 1 | -1
  else {
    sort.value = key
    dir.value = -1
  }
}

watch([query, () => props.category, () => props.txns], () => (shown.value = 12))

// Group visible rows by date, like Copilot's feed.
const grouped = computed(() => {
  if (sort.value !== 'date') return [{ date: '', items: rows.value.slice(0, shown.value) }]
  const out: { date: string; items: Transaction[] }[] = []
  for (const t of rows.value.slice(0, shown.value)) {
    const last = out[out.length - 1]
    if (last && last.date === t.date) last.items.push(t)
    else out.push({ date: t.date, items: [t] })
  }
  return out
})

const onKey = (e: KeyboardEvent) => {
  if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
    e.preventDefault()
    search.value?.focus()
  }
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <section class="card pad" id="transactions">
    <header class="card-head wrap">
      <div>
        <h3>Transactions</h3>
        <p class="muted small">{{ rows.length }} transactions · net {{ signed(total) }}</p>
      </div>
      <div class="tools">
        <div class="search">
          <input ref="search" v-model="query" placeholder="Search merchants or categories" aria-label="Search transactions" />
          <kbd>/</kbd>
        </div>
        <div class="seg">
          <button :class="{ on: sort === 'date' }" @click="toggleSort('date')">Date {{ sort === 'date' ? (dir === -1 ? '↓' : '↑') : '' }}</button>
          <button :class="{ on: sort === 'amount' }" @click="toggleSort('amount')">Amount {{ sort === 'amount' ? (dir === -1 ? '↓' : '↑') : '' }}</button>
        </div>
      </div>
    </header>

    <div class="chips">
      <button class="chip-btn" :class="{ on: !category }" @click="emit('category', null)">All</button>
      <button
        v-for="c in CATEGORIES"
        :key="c.id"
        class="chip-btn"
        :class="{ on: category === c.id }"
        :style="{ '--c': c.color }"
        @click="emit('category', category === c.id ? null : c.id)"
      >
        <i />{{ c.name }}
      </button>
    </div>

    <div v-if="!rows.length" class="empty">No transactions match.</div>

    <div v-for="g in grouped" :key="g.date || 'all'" class="day">
      <div v-if="g.date" class="day-head">{{ longDate(g.date) }}</div>
      <div v-for="t in g.items" :key="t.id" class="txn">
        <span class="ico" :style="{ background: catOf(t.category).color + '26' }">{{ catOf(t.category).icon }}</span>
        <div class="who">
          <div class="m">
            {{ t.merchant }}
            <span v-if="t.pending" class="tag pending">Pending</span>
            <span v-if="t.recurring" class="tag">Recurring</span>
          </div>
          <div class="muted small">{{ catOf(t.category).name }}<template v-if="!g.date"> · {{ shortDate(t.date) }}</template></div>
        </div>
        <div class="amount" :class="t.amount > 0 ? 'pos' : ''">{{ signed(t.amount) }}</div>
      </div>
    </div>

    <button v-if="rows.length > shown" class="more" @click="shown += 15">Show more ({{ rows.length - shown }} left)</button>
  </section>
</template>

<style scoped>
.wrap {
  flex-wrap: wrap;
  gap: 12px;
}
.tools {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.search {
  position: relative;
}
.search input {
  width: 260px;
  max-width: 100%;
  padding: 8px 34px 8px 12px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: rgba(20, 23, 26, 0.04);
  font: inherit;
  font-size: 13px;
  color: var(--text);
}
.search input:focus {
  outline: none;
  border-color: #6fae2b;
  box-shadow: 0 0 0 3px rgba(140, 198, 63, 0.25);
}
kbd {
  position: absolute;
  right: 9px;
  top: 50%;
  transform: translateY(-50%);
  padding: 2px 6px;
  border: 1px solid var(--line-strong);
  border-radius: 4px;
  font-size: 11px;
  color: var(--muted);
  pointer-events: none;
}
.seg {
  display: inline-flex;
  padding: 3px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: rgba(20, 23, 26, 0.04);
}
.seg button {
  border: none;
  background: transparent;
  border-radius: 7px;
  padding: 5px 12px;
  font-size: 13px;
  color: var(--muted);
  cursor: pointer;
}
.seg button.on {
  background: #14171a;
  color: #fff;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 14px 0 6px;
}
.chip-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 28px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: transparent;
  font-size: 12.5px;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s;
}
.chip-btn i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--c);
}
.chip-btn:hover {
  color: var(--text);
  border-color: var(--line-strong);
}
.chip-btn.on {
  color: var(--text);
  border-color: var(--c, #14171a);
  background: color-mix(in srgb, var(--c, #14171a) 18%, transparent);
}
.day-head {
  margin: 16px 0 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
.txn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 10px;
  margin: 0 -10px;
  border-radius: 12px;
  transition: background 0.15s;
}
.txn:hover {
  background: rgba(20, 23, 26, 0.04);
}
.ico {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 11px;
  font-size: 18px;
}
.who {
  flex: 1;
  min-width: 0;
}
.m {
  font-size: 14px;
  font-weight: 500;
}
.tag {
  margin-left: 6px;
  padding: 1px 7px;
  border-radius: 999px;
  background: rgba(20, 23, 26, 0.07);
  font-size: 10.5px;
  font-weight: 500;
  color: var(--muted);
}
.tag.pending {
  background: rgba(244, 162, 89, 0.2);
  color: #c26a14;
}
.amount {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.amount.pos {
  color: var(--good);
}
.more {
  display: block;
  width: 100%;
  margin-top: 14px;
  padding: 10px;
  border: 1px dashed var(--line-strong);
  border-radius: 10px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
}
.more:hover {
  color: var(--text);
  background: rgba(20, 23, 26, 0.04);
}
.empty {
  padding: 32px 0;
  text-align: center;
  color: var(--muted);
}
</style>
