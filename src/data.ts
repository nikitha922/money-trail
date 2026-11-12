export interface Category {
  id: string
  name: string
  icon: string
  color: string
  budget: number // monthly
}

export interface Transaction {
  id: string
  date: string // YYYY-MM-DD
  merchant: string
  category: string // Category.id, or 'income'
  amount: number // negative = spending
  account: string
  pending: boolean
  recurring: boolean
}

export interface Account {
  id: string
  name: string
  type: 'cash' | 'credit' | 'invest'
  institution: string
  balance: number
  change: number // % over 30 days
}

export const CATEGORIES: Category[] = [
  { id: 'housing', name: 'Housing', icon: '🏠', color: '#f4a259', budget: 2300 },
  { id: 'groceries', name: 'Groceries', icon: '🛒', color: '#8cc63f', budget: 600 },
  { id: 'dining', name: 'Dining out', icon: '🍜', color: '#f6d743', budget: 450 },
  { id: 'transport', name: 'Transport', icon: '🚕', color: '#5fb878', budget: 250 },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#e9895a', budget: 400 },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#b9d96b', budget: 200 },
  { id: 'health', name: 'Health', icon: '💪', color: '#3f9d6a', budget: 220 },
  { id: 'travel', name: 'Travel', icon: '✈️', color: '#f2c14e', budget: 350 },
  { id: 'utilities', name: 'Bills & utilities', icon: '💡', color: '#a9afa0', budget: 320 },
]

export const CATEGORY_BY_ID: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
)
export const INCOME = { id: 'income', name: 'Income', icon: '💰', color: '#6fae2b', budget: 0 }

export const GOALS = [
  { id: 'reserve', name: 'Emergency fund', icon: '🛟', saved: 14500, target: 20000, note: 'Left to save 5 months' },
  { id: 'travel', name: 'Japan trip', icon: '🗾', saved: 2500, target: 4500, note: 'Left to save 8 months' },
  { id: 'home', name: 'Home down payment', icon: '🏡', saved: 38200, target: 120000, note: 'Left to save 3 years' },
]

// Deterministic PRNG so the demo data is stable between reloads.
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(20261112)
const between = (lo: number, hi: number) => lo + rand() * (hi - lo)
const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)]
const round2 = (n: number) => Math.round(n * 100) / 100

export const fmtDate = (d: Date) => d.toLocaleDateString('en-CA')

const MERCHANTS: Record<string, { names: string[]; range: [number, number]; perWeek: number; account?: string }> = {
  groceries: {
    names: ['Whole Foods', "Trader Joe's", 'Safeway', 'Costco', 'Instacart'],
    range: [28, 135],
    perWeek: 2,
  },
  dining: {
    names: ['Blue Bottle Coffee', 'Chipotle', 'Sweetgreen', 'Uber Eats', 'DoorDash', 'Ramen Nagi', 'Shake Shack', 'Starbucks'],
    range: [6, 62],
    perWeek: 4,
  },
  transport: {
    names: ['Uber', 'Lyft', 'Shell', 'Clipper Card', 'Chevron'],
    range: [8, 58],
    perWeek: 1.6,
  },
  shopping: {
    names: ['Amazon', 'Target', 'Uniqlo', 'Apple Store', 'IKEA', 'Nike', 'Etsy'],
    range: [15, 190],
    perWeek: 1.1,
  },
  entertainment: {
    names: ['AMC Theatres', 'Steam', 'Ticketmaster', 'Bowlero', 'Audible'],
    range: [10, 95],
    perWeek: 0.5,
  },
  health: {
    names: ['CVS Pharmacy', 'Walgreens', 'One Medical', 'Headspace'],
    range: [12, 120],
    perWeek: 0.35,
  },
  travel: {
    names: ['United Airlines', 'Airbnb', 'Delta', 'Hertz', 'Booking.com'],
    range: [90, 520],
    perWeek: 0.12,
  },
  utilities: {
    names: ['PG&E', 'Comcast Xfinity', 'Water District'],
    range: [38, 140],
    perWeek: 0.3,
  },
}

const SUBSCRIPTIONS: { merchant: string; category: string; amount: number; day: number }[] = [
  { merchant: 'Netflix', category: 'entertainment', amount: 15.49, day: 6 },
  { merchant: 'Spotify', category: 'entertainment', amount: 11.99, day: 9 },
  { merchant: 'iCloud+', category: 'utilities', amount: 2.99, day: 12 },
  { merchant: 'Equinox Gym', category: 'health', amount: 89, day: 3 },
  { merchant: 'Adobe Creative Cloud', category: 'utilities', amount: 22.99, day: 18 },
  { merchant: 'ChatGPT Plus', category: 'utilities', amount: 20, day: 21 },
  { merchant: 'NYT Digital', category: 'entertainment', amount: 4.25, day: 25 },
  { merchant: 'AT&T Wireless', category: 'utilities', amount: 68, day: 14 },
]

function build() {
  const txns: Transaction[] = []
  let n = 0
  const add = (t: Omit<Transaction, 'id' | 'pending'> & { pending?: boolean }) =>
    txns.push({ pending: false, ...t, id: `t${++n}` })

  const end = new Date()
  end.setHours(0, 0, 0, 0)
  const start = new Date(end)
  start.setFullYear(start.getFullYear() - 1)
  start.setDate(1)

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const date = fmtDate(d)
    const dom = d.getDate()
    const dow = d.getDay()
    const weekend = dow === 0 || dow === 6

    // Income: salary on the 1st and 15th, occasional freelance.
    if (dom === 1 || dom === 15) {
      add({ date, merchant: 'Northwind Payroll', category: 'income', amount: 4125, account: 'checking', recurring: true })
    }
    if (rand() < 0.02) {
      add({ date, merchant: pick(['Freelance — Acme Co', 'Stripe Payout', 'Etsy Payout']), category: 'income', amount: round2(between(180, 900)), account: 'checking', recurring: false })
    }
    if (dom === 28) {
      add({ date, merchant: 'Ally Savings Interest', category: 'income', amount: round2(between(38, 52)), account: 'savings', recurring: true })
    }

    // Rent.
    if (dom === 1) {
      add({ date, merchant: 'Maple Court Apartments', category: 'housing', amount: -2150, account: 'checking', recurring: true })
    }

    for (const s of SUBSCRIPTIONS) {
      if (dom === s.day) {
        add({ date, merchant: s.merchant, category: s.category, amount: -s.amount, account: 'card', recurring: true })
      }
    }

    for (const [category, m] of Object.entries(MERCHANTS)) {
      const boost = weekend && (category === 'dining' || category === 'entertainment') ? 1.5 : 1
      if (rand() < (m.perWeek / 7) * boost) {
        // Travel clusters: occasionally one very large purchase.
        const big = category === 'travel' && rand() < 0.25 ? 2.2 : 1
        add({
          date,
          merchant: pick(m.names),
          category,
          amount: -round2(between(m.range[0], m.range[1]) * big),
          account: rand() < 0.8 ? 'card' : 'checking',
          recurring: false,
        })
      }
    }
  }

  // Mark the latest couple of purchases as still pending.
  txns.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
  txns.slice(0, 3).forEach((t) => {
    if (t.amount < 0) t.pending = true
  })
  return { txns, start, end }
}

const built = build()
export const TRANSACTIONS = built.txns
export const DATA_START = built.start
export const DATA_END = built.end

// Daily net-worth series: liquid cash tracks cumulative cash flow, investments random-walk upward.
export interface NetWorthPoint {
  date: string
  total: number
  cash: number
  invest: number
}

function buildNetWorth(): NetWorthPoint[] {
  const byDate = new Map<string, number>()
  for (const t of TRANSACTIONS) byDate.set(t.date, (byDate.get(t.date) ?? 0) + t.amount)

  const points: NetWorthPoint[] = []
  let cash = 14200
  let invest = 61800
  let drift = 0
  for (let d = new Date(DATA_START); d <= DATA_END; d.setDate(d.getDate() + 1)) {
    const date = fmtDate(d)
    cash += byDate.get(date) ?? 0
    drift = drift * 0.9 + (rand() - 0.46) * 0.006
    invest *= 1 + 0.0004 + drift
    if (d.getDate() === 1) invest += 600 // monthly contribution
    points.push({ date, cash: round2(cash), invest: round2(invest), total: round2(cash + invest) })
  }
  return points
}

export const NET_WORTH = buildNetWorth()

const last = NET_WORTH[NET_WORTH.length - 1]
const monthAgo = NET_WORTH[Math.max(0, NET_WORTH.length - 31)]
const pct = (a: number, b: number) => round2(((a - b) / Math.abs(b)) * 100)

export const ACCOUNTS: Account[] = [
  { id: 'checking', name: 'Everyday Checking', type: 'cash', institution: 'Chase', balance: round2(last.cash * 0.28), change: pct(last.cash * 0.28, monthAgo.cash * 0.28) },
  { id: 'savings', name: 'High-Yield Savings', type: 'cash', institution: 'Ally', balance: round2(last.cash * 0.72), change: pct(last.cash * 0.72, monthAgo.cash * 0.72) },
  { id: 'card', name: 'Sapphire Preferred', type: 'credit', institution: 'Chase', balance: -2184.37, change: -6.2 },
  { id: 'brokerage', name: 'Brokerage', type: 'invest', institution: 'Fidelity', balance: round2(last.invest * 0.46), change: pct(last.invest * 0.46, monthAgo.invest * 0.46) },
  { id: '401k', name: '401(k)', type: 'invest', institution: 'Vanguard', balance: round2(last.invest * 0.54), change: pct(last.invest * 0.54, monthAgo.invest * 0.54) },
]
