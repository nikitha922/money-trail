import {
  ArcElement, BarController, BarElement, CategoryScale, Chart, Filler, Legend,
  LineController, LineElement, LinearScale, PointElement, Tooltip, type Plugin,
} from 'chart.js'

Chart.register(
  ArcElement, BarController, BarElement, CategoryScale, Filler, Legend,
  LineController, LineElement, LinearScale, PointElement, Tooltip,
)

Chart.defaults.font.family = "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif"
Chart.defaults.font.size = 12
Chart.defaults.color = '#8a9099'
Chart.defaults.animation = { duration: 700, easing: 'easeOutCubic' }
// Gradients (CanvasGradient objects) can't be interpolated, so never tween colours.
Chart.defaults.animations.colors = false

export const GRID = 'rgba(20, 23, 26, 0.06)'

export const tooltipStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.98)',
  borderColor: 'rgba(20, 23, 26, 0.08)',
  borderWidth: 1,
  titleColor: '#14171a',
  bodyColor: '#4b5159',
  padding: 12,
  cornerRadius: 10,
  boxPadding: 5,
  usePointStyle: true,
  titleFont: { weight: 600 as const, size: 12 },
  bodyFont: { size: 12 },
}

/** Vertical hover line for time-series charts. */
export const crosshair: Plugin = {
  id: 'crosshair',
  afterDatasetsDraw(chart) {
    const active = chart.tooltip?.getActiveElements()
    if (!active?.length) return
    const { ctx, chartArea } = chart
    const x = active[0].element.x
    ctx.save()
    ctx.beginPath()
    ctx.setLineDash([4, 4])
    ctx.moveTo(x, chartArea.top)
    ctx.lineTo(x, chartArea.bottom)
    ctx.strokeStyle = 'rgba(20, 23, 26, 0.28)'
    ctx.stroke()
    ctx.restore()
  },
}

/** Build a vertical gradient that follows the chart area. */
export function gradient(chart: Chart, stops: [number, string][]) {
  const { ctx, chartArea } = chart
  if (!chartArea) return stops[0][1]
  const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
  for (const [at, color] of stops) g.addColorStop(at, color)
  return g
}
