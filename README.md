# Money Trail

A personal finance dashboard in the style of Copilot Money: net worth, cash flow, spending breakdowns, budgets and transactions in one place, with interactive charts.

**Live demo:** https://nikitha922.github.io/money-trail/

> All data is generated in the browser. No accounts are linked and nothing leaves your machine.

## Features

- **Net worth:** stacked area chart of cash and investments, with a hover line and a live total
- **Cash flow:** income vs. spending bars with a net line, weekly for 1M and monthly for longer ranges
- **Spending by category:** doughnut chart linked to the category list. Hover to highlight, click to filter transactions
- **Financial health:** gauge based on your savings rate
- **Budgets:** monthly progress bars with a marker for where you should be by today, plus an overall spending limit and projected month-end spend
- **Goals, accounts and subscriptions:** goal progress, balances grouped by cash, investments and credit, and detected recurring charges
- **Insights:** auto-written callouts such as the biggest category mover and savings-rate change
- **Transactions:** searchable and sortable feed grouped by day, with category chips and pending and recurring tags. Press `/` to search
- **Date ranges:** 1M, 3M, 6M and 1Y, compared against the previous period
- **Responsive layout** that collapses from a three-column dashboard to a single column

## Tech stack

| Area | Choice |
| --- | --- |
| UI | Vue 3 (Composition API, `<script setup>`) |
| Language | TypeScript |
| Build tool | Vite |
| Charts | Chart.js with vue-chartjs |
| Styling | Plain CSS with scoped component styles |
| Hosting | GitHub Pages (via `gh-pages`) |

## Getting started

```bash
npm install
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check with `vue-tsc` and build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run deploy` | Build and publish `dist/` to the `gh-pages` branch |

If a deploy fails with `a branch named 'gh-pages' already exists`, run `npx gh-pages-clean` first.

## Project structure

```
src/
  data.ts                    seeded demo transactions, accounts, goals
  composables/useDashboard   date-range state and all derived metrics
  composables/useCountUp     animated number tweening
  chartSetup.ts              Chart.js registration, tooltip style, hover line
  components/                one component per card or chart
  App.vue                    page layout
```

## About the demo data

Transactions come from a seeded random generator, so the dashboard looks the same on every load. It models salary, rent, subscriptions and everyday spending across a year.
