import { computed, ref } from 'vue'
import {
  ACCOUNTS,
  CATEGORIES,
  CATEGORY_BY_ID,
  DATA_END,
  NET_WORTH,
  TRANSACTIONS,
  fmtDate,
  type Transaction,
} from '../data'
import { parseDate, pctText, usd } from '../utils'

export type RangeKey = '1M' | '3M' | '6M' | '1Y'
export const RANGES: { key: RangeKey; label: string; days: number }[] = [
  { key: '1M', label: '1M', days: 30 },
  { key: '3M', label: '3M', days: 90 },
  { key: '6M', label: '6M', days: 180 },
  { key: '1Y', label: '1Y', days: 365 },
]

const shift = (d: Date, days: number) => {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
const delta = (cur: number, prev: number) => (prev > 0 ? ((cur - prev) / prev) * 100 : null)

function chunked(txns: Transaction[], from: string, days: number, parts: number, pick: (t: Transaction) => number) {
  const size = days / parts
  const out = new Array<number>(parts).fill(0)
  const t0 = parseDate(from).getTime()
  for (const t of txns) {
    const i = Math.min(parts - 1, Math.floor((parseDate(t.date).getTime() - t0) / 86_400_000 / size))
    if (i >= 0) out[i] += pick(t)
  }
  return out
}

export function useDashboard() {
  const range = ref<RangeKey>('3M')
  const category = ref<string | null>(null)

  const days = computed(() => RANGES.find((r) => r.key === range.value)!.days)
  const endStr = fmtDate(DATA_END)
  const startStr = computed(() => fmtDate(shift(DATA_END, -(days.value - 1))))
  const prevStartStr = computed(() => fmtDate(shift(DATA_END, -(days.value * 2 - 1))))
  const prevEndStr = computed(() => fmtDate(shift(DATA_END, -days.value)))

  const txns = computed(() => TRANSACTIONS.filter((t) => t.date >= startStr.value && t.date <= endStr))
  const prevTxns = computed(() =>
    TRANSACTIONS.filter((t) => t.date >= prevStartStr.value && t.date <= prevEndStr.value),
  )
  const hasPrev = computed(() => prevTxns.value.length > 20)

  const income = computed(() => sum(txns.value.filter((t) => t.amount > 0).map((t) => t.amount)))
  const spending = computed(() => -sum(txns.value.filter((t) => t.amount < 0).map((t) => t.amount)))
  const prevIncome = computed(() => sum(prevTxns.value.filter((t) => t.amount > 0).map((t) => t.amount)))
  const prevSpending = computed(() => -sum(prevTxns.value.filter((t) => t.amount < 0).map((t) => t.amount)))
  const net = computed(() => income.value - spending.value)
  const savingsRate = computed(() => (income.value > 0 ? (net.value / income.value) * 100 : 0))
  const prevSavingsRate = computed(() =>
    prevIncome.value > 0 ? ((prevIncome.value - prevSpending.value) / prevIncome.value) * 100 : null,
  )

  // Net worth
  const netWorthSeries = computed(() => {
    const pts = NET_WORTH.filter((p) => p.date >= startStr.value)
    const step = Math.max(1, Math.ceil(pts.length / 120))
    const out = pts.filter((_, i) => i % step === 0)
    if (out[out.length - 1] !== pts[pts.length - 1]) out.push(pts[pts.length - 1])
    return out
  })
  const netWorth = computed(() => NET_WORTH[NET_WORTH.length - 1].total)
  const netWorthStart = computed(() => netWorthSeries.value[0]?.total ?? netWorth.value)
  const netWorthChange = computed(() => netWorth.value - netWorthStart.value)
  const netWorthPct = computed(() => (netWorthStart.value ? (netWorthChange.value / netWorthStart.value) * 100 : 0))

  // Sparklines
  const SPARK = 14
  // Running totals read as smooth trends; per-chunk sums spike on every payday.
  const running = (xs: number[]) => {
    let acc = 0
    return xs.map((v) => (acc += v))
  }
  const sparkIncome = computed(() => running(chunked(txns.value.filter((t) => t.amount > 0), startStr.value, days.value, SPARK, (t) => t.amount)))
  const sparkSpending = computed(() => running(chunked(txns.value.filter((t) => t.amount < 0), startStr.value, days.value, SPARK, (t) => -t.amount)))
  const sparkNet = computed(() => sparkIncome.value.map((v, i) => v - sparkSpending.value[i]))
  const sparkNetWorth = computed(() => {
    const s = netWorthSeries.value
    return Array.from({ length: SPARK }, (_, i) => s[Math.min(s.length - 1, Math.round((i / (SPARK - 1)) * (s.length - 1)))].total)
  })

  // Categories
  const categoryTotals = computed(() => {
    const cur = new Map<string, number>()
    const prev = new Map<string, number>()
    for (const t of txns.value) if (t.amount < 0) cur.set(t.category, (cur.get(t.category) ?? 0) - t.amount)
    for (const t of prevTxns.value) if (t.amount < 0) prev.set(t.category, (prev.get(t.category) ?? 0) - t.amount)
    return CATEGORIES.map((c) => {
      const total = cur.get(c.id) ?? 0
      const before = prev.get(c.id) ?? 0
      return {
        ...c,
        total,
        share: spending.value ? (total / spending.value) * 100 : 0,
        change: hasPrev.value ? delta(total, before) : null,
        before,
      }
    })
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total)
  })

  // Cash flow buckets: weekly for 1M, monthly otherwise.
  const cashFlow = computed(() => {
    const weekly = days.value <= 30
    const buckets = new Map<string, { label: string; income: number; spending: number }>()
    const t0 = parseDate(startStr.value).getTime()
    for (const t of txns.value) {
      let key: string
      let label: string
      if (weekly) {
        const w = Math.floor((parseDate(t.date).getTime() - t0) / 86_400_000 / 7)
        key = String(w)
        label = parseDate(fmtDate(shift(parseDate(startStr.value), w * 7))).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      } else {
        key = t.date.slice(0, 7)
        label = parseDate(`${key}-01`).toLocaleDateString('en-US', { month: 'short' })
      }
      const b = buckets.get(key) ?? { label, income: 0, spending: 0 }
      if (t.amount > 0) b.income += t.amount
      else b.spending -= t.amount
      buckets.set(key, b)
    }
    return [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })).map(([, v]) => v)
  })

  // Weekday pattern
  const weekday = computed(() => {
    const totals = new Array(7).fill(0)
    const counts = new Array(7).fill(0)
    for (let i = 0; i < days.value; i++) counts[shift(DATA_END, -i).getDay()]++
    for (const t of txns.value) if (t.amount < 0) totals[parseDate(t.date).getDay()] -= t.amount
    const order = [1, 2, 3, 4, 5, 6, 0]
    return order.map((d) => ({
      label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d],
      avg: counts[d] ? totals[d] / counts[d] : 0,
    }))
  })

  const topMerchants = computed(() => {
    const m = new Map<string, { total: number; count: number; category: string }>()
    for (const t of txns.value) {
      if (t.amount >= 0) continue
      const x = m.get(t.merchant) ?? { total: 0, count: 0, category: t.category }
      x.total -= t.amount
      x.count++
      m.set(t.merchant, x)
    }
    return [...m.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6)
  })

  const recurring = computed(() => {
    const cutoff = fmtDate(shift(DATA_END, -40))
    const seen = new Map<string, Transaction>()
    for (const t of TRANSACTIONS) {
      if (t.recurring && t.amount < 0 && t.category !== 'housing' && t.date >= cutoff && !seen.has(t.merchant)) seen.set(t.merchant, t)
    }
    const today = DATA_END.getDate()
    return [...seen.values()]
      .map((t) => {
        const day = parseDate(t.date).getDate()
        const daysUntil = (day - today + 30) % 30
        return { merchant: t.merchant, amount: -t.amount, category: t.category, day, daysUntil }
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)
  })
  const recurringTotal = computed(() => sum(recurring.value.map((r) => r.amount)))

  // Budgets — always the current calendar month.
  const budgets = computed(() => {
    const month = fmtDate(DATA_END).slice(0, 7)
    const spent = new Map<string, number>()
    for (const t of TRANSACTIONS) {
      if (t.amount < 0 && t.date.startsWith(month)) spent.set(t.category, (spent.get(t.category) ?? 0) - t.amount)
    }
    const dim = new Date(DATA_END.getFullYear(), DATA_END.getMonth() + 1, 0).getDate()
    const pace = DATA_END.getDate() / dim
    return {
      pace,
      items: CATEGORIES.map((c) => ({
        ...c,
        spent: spent.get(c.id) ?? 0,
        ratio: (spent.get(c.id) ?? 0) / c.budget,
      })).sort((a, b) => b.ratio - a.ratio),
    }
  })

  const tableTxns = computed(() =>
    txns.value
      .filter((t) => !category.value || t.category === category.value)
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)),
  )

  const allRecent = computed(() => [...TRANSACTIONS].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).slice(0, 7))

  const insights = computed(() => {
    const out: { icon: string; title: string; body: string; tone: 'good' | 'warn' | 'info' }[] = []
    const movers = categoryTotals.value.filter((c) => c.change !== null && c.before > 60)
    const up = [...movers].sort((a, b) => b.change! - a.change!)[0]
    const down = [...movers].sort((a, b) => a.change! - b.change!)[0]
    if (up && up.change! > 8)
      out.push({ icon: up.icon, title: `${up.name} is up ${pctText(up.change!).slice(1)}`, body: `${usd(up.total)} this period vs ${usd(up.before)} before.`, tone: 'warn' })
    if (down && down.change! < -8)
      out.push({ icon: down.icon, title: `${down.name} is down ${pctText(down.change!).slice(1)}`, body: `You spent ${usd(down.before - down.total)} less than the last period.`, tone: 'good' })
    out.push({
      icon: '🎯',
      title: `Saving ${savingsRate.value.toFixed(0)}% of income`,
      body:
        prevSavingsRate.value !== null
          ? `${savingsRate.value >= prevSavingsRate.value ? 'Up' : 'Down'} from ${prevSavingsRate.value.toFixed(0)}% in the previous period.`
          : `You kept ${usd(net.value)} after spending.`,
      tone: savingsRate.value >= 20 ? 'good' : 'info',
    })
    const biggest = [...txns.value].filter((t) => t.amount < 0 && t.category !== 'housing').sort((a, b) => a.amount - b.amount)[0]
    if (biggest)
      out.push({ icon: CATEGORY_BY_ID[biggest.category].icon, title: `Biggest purchase: ${biggest.merchant}`, body: `${usd(-biggest.amount)} on ${parseDate(biggest.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`, tone: 'info' })
    return out.slice(0, 4)
  })

  const accountGroups = computed(() => {
    const groups = [
      { key: 'cash', label: 'Cash' },
      { key: 'invest', label: 'Investments' },
      { key: 'credit', label: 'Credit cards' },
    ] as const
    return groups.map((g) => {
      const items = ACCOUNTS.filter((a) => a.type === g.key)
      return { ...g, items, total: sum(items.map((a) => a.balance)) }
    })
  })

  return {
    range, category, days, startStr, endStr,
    txns, hasPrev,
    income, spending, net, savingsRate, prevIncome, prevSpending, prevSavingsRate,
    netWorth, netWorthSeries, netWorthChange, netWorthPct,
    sparkIncome, sparkSpending, sparkNet, sparkNetWorth,
    categoryTotals, cashFlow, weekday, topMerchants, recurring, recurringTotal,
    budgets, tableTxns, allRecent, insights, accountGroups, delta,
  }
}
