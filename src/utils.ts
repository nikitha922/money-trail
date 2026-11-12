export const usd = (n: number, digits = 0) =>
  n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })

export const usd2 = (n: number) => usd(n, 2)

export const compact = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 })

export const signed = (n: number, digits = 2) => `${n < 0 ? '−' : '+'}${usd(Math.abs(n), digits)}`

export const pctText = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toFixed(1)}%`

export const parseDate = (s: string) => new Date(`${s}T00:00:00`)

export const shortDate = (s: string) =>
  parseDate(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export const longDate = (s: string) =>
  parseDate(s).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

export const hexA = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}
