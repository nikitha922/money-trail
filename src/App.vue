<script setup lang="ts">
import './chartSetup'
import { computed } from 'vue'
import AccountsCard from './components/AccountsCard.vue'
import BudgetCard from './components/BudgetCard.vue'
import CashFlowChart from './components/CashFlowChart.vue'
import CategoryDonut from './components/CategoryDonut.vue'
import GoalTracker from './components/GoalTracker.vue'
import HealthGauge from './components/HealthGauge.vue'
import InsightsStrip from './components/InsightsStrip.vue'
import KpiCard from './components/KpiCard.vue'
import MerchantsCard from './components/MerchantsCard.vue'
import NetWorthHero from './components/NetWorthHero.vue'
import RecentTxns from './components/RecentTxns.vue'
import NetWorthChart from './components/NetWorthChart.vue'
import RecurringCard from './components/RecurringCard.vue'
import SpendingLimit from './components/SpendingLimit.vue'
import TransactionsTable from './components/TransactionsTable.vue'
import WeekdayChart from './components/WeekdayChart.vue'
import { ACCOUNTS } from './data'
import { RANGES, useDashboard } from './composables/useDashboard'
import { shortDate } from './utils'

const d = useDashboard()

const greeting = computed(() => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
})
const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

const nav = [
  { href: '#overview', label: 'Overview', icon: '◎' },
  { href: '#spending', label: 'Spending', icon: '◔' },
  { href: '#budgets', label: 'Budgets', icon: '▤' },
  { href: '#accounts', label: 'Accounts', icon: '▦' },
  { href: '#transactions', label: 'Transactions', icon: '☰' },
]

const incomeDelta = computed(() => (d.hasPrev.value ? d.delta(d.income.value, d.prevIncome.value) : null))
const spendDelta = computed(() => (d.hasPrev.value ? d.delta(d.spending.value, d.prevSpending.value) : null))
const netDelta = computed(() =>
  d.hasPrev.value ? d.delta(d.net.value, d.prevIncome.value - d.prevSpending.value) : null,
)
const monthSpent = computed(() => d.budgets.value.items.reduce((s, b) => s + b.spent, 0))
const monthLimit = computed(() => d.budgets.value.items.reduce((s, b) => s + b.budget, 0))
const recent = computed(() => d.allRecent.value)
</script>

<template>
  <div class="shell">
    <aside class="side">
      <div class="brand">
        <span class="logo">
          <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
            <path d="M5 22l7-8 5 5 10-12" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
        Money Trail
      </div>
      <nav>
        <a v-for="n in nav" :key="n.href" :href="n.href"><span>{{ n.icon }}</span>{{ n.label }}</a>
      </nav>
      <div class="side-foot">
        <div class="side-title">Demo data</div>
        <div class="muted small">Everything is generated in your browser. No accounts are linked.</div>
      </div>
    </aside>

    <main>
      <header class="top" id="overview">
        <div>
          <p class="muted small">{{ today }}</p>
          <h1>{{ greeting }}, Alex</h1>
        </div>
        <div class="range" role="tablist" aria-label="Date range">
          <button
            v-for="r in RANGES"
            :key="r.key"
            role="tab"
            :aria-selected="d.range.value === r.key"
            :class="{ on: d.range.value === r.key }"
            @click="d.range.value = r.key"
          >
            {{ r.label }}
          </button>
          <span class="window muted small">{{ shortDate(d.startStr.value) }} – {{ shortDate(d.endStr) }}</span>
        </div>
      </header>

      <div class="cols">
        <div class="left">
          <section class="grid hero-row">
            <CashFlowChart :buckets="d.cashFlow.value" />
            <div class="card pad stats">
              <KpiCard id="in" label="Total income" :value="d.income.value" :delta="incomeDelta" :spark="d.sparkIncome.value" color="#6fae2b" />
              <KpiCard id="sp" label="Total expenses" :value="d.spending.value" :delta="spendDelta" invert :spark="d.sparkSpending.value" color="#f4a259" />
              <KpiCard id="sv" label="Saved balance" :value="d.net.value" :delta="netDelta" :spark="d.sparkNet.value" color="#d9a516" />
            </div>
          </section>

          <InsightsStrip :items="d.insights.value" />

          <NetWorthChart :points="d.netWorthSeries.value" />

          <section class="grid spend" id="spending">
            <CategoryDonut :rows="d.categoryTotals.value" :total="d.spending.value" :selected="d.category.value" @select="d.category.value = $event" />
            <div class="stack">
              <HealthGauge :rate="d.savingsRate.value" :prev="d.prevSavingsRate.value" />
              <SpendingLimit :spent="monthSpent" :limit="monthLimit" :pace="d.budgets.value.pace" />
            </div>
          </section>

          <section class="grid two" id="budgets">
            <BudgetCard :items="d.budgets.value.items" :pace="d.budgets.value.pace" />
            <div class="stack">
              <GoalTracker />
              <WeekdayChart :days="d.weekday.value" />
            </div>
          </section>

          <MerchantsCard :merchants="d.topMerchants.value" />
        </div>

        <div class="rail" id="accounts">
          <NetWorthHero :total="d.netWorth.value" :pct="d.netWorthPct.value" :accounts="ACCOUNTS" />
          <AccountsCard :groups="d.accountGroups.value" />
          <RecentTxns :txns="recent" />
          <RecurringCard :items="d.recurring.value" :total="d.recurringTotal.value" />
        </div>
      </div>

      <TransactionsTable :txns="d.tableTxns.value" :category="d.category.value" @category="d.category.value = $event" />
    </main>
  </div>
</template>

<style scoped>
.shell {
  display: grid;
  grid-template-columns: 232px minmax(0, 1fr);
  min-height: 100vh;
}
.side {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 26px 16px 20px;
  border-right: 1px solid var(--line);
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 8px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.logo {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--accent);
  box-shadow: 0 8px 18px -6px rgba(111, 174, 43, 0.7);
}
nav {
  display: grid;
  gap: 2px;
}
nav a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 12px;
  border-radius: 12px;
  color: var(--muted);
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}
nav a span {
  width: 18px;
  text-align: center;
}
nav a:hover {
  background: #fff;
  color: var(--text);
  box-shadow: 0 1px 2px rgba(20, 23, 26, 0.06);
}
.side-foot {
  margin-top: auto;
  padding: 16px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid var(--line);
}
.side-title {
  margin-bottom: 4px;
  font-weight: 600;
}

main {
  display: grid;
  gap: 18px;
  align-content: start;
  min-width: 0;
  padding: 28px 32px 70px;
  background: var(--page);
}
.top {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 14px;
}
h1 {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.range {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: #fff;
}
.range button {
  border: none;
  background: transparent;
  border-radius: 10px;
  padding: 6px 14px;
  font-weight: 600;
  font-size: 13px;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s;
}
.range button:hover {
  color: var(--text);
}
.range button.on {
  background: var(--accent);
  color: #10200a;
  box-shadow: 0 6px 14px -6px rgba(111, 174, 43, 0.8);
}
.window {
  padding: 0 10px 0 8px;
}

.cols {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 18px;
  align-items: start;
}
.left,
.rail,
.stack {
  display: grid;
  gap: 18px;
  min-width: 0;
}
.rail {
  position: sticky;
  top: 18px;
}
.grid {
  display: grid;
  gap: 18px;
  align-items: start;
}
.hero-row {
  grid-template-columns: minmax(0, 1.9fr) minmax(0, 1fr);
  align-items: stretch;
}
.stats {
  display: grid;
  gap: 4px;
  align-content: space-between;
  height: 100%;
}
.stats > :not(:last-child) {
  padding-bottom: 8px;
  border-bottom: 1px solid var(--line);
}
.two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.spend {
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
}

@media (max-width: 1360px) {
  .cols {
    grid-template-columns: minmax(0, 1fr);
  }
  .rail {
    position: static;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 1100px) {
  .hero-row,
  .two,
  .spend {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 860px) {
  .shell {
    grid-template-columns: minmax(0, 1fr);
  }
  .side {
    position: static;
    height: auto;
    flex-direction: row;
    align-items: center;
    overflow-x: auto;
    padding: 14px 16px;
    border-right: none;
    border-bottom: 1px solid var(--line);
  }
  nav {
    display: flex;
  }
  nav a {
    white-space: nowrap;
  }
  .side-foot {
    display: none;
  }
  main {
    padding: 22px 16px 60px;
  }
  .window {
    display: none;
  }
  .rail {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 520px) {
  h1 {
    font-size: 24px;
  }
}
</style>
