<script setup lang="ts">
import { GOALS } from '../data'
import { usd } from '../utils'
</script>

<template>
  <section class="card pad">
    <header class="card-head">
      <div>
        <h3>Goal tracker</h3>
        <p class="muted small">{{ GOALS.length }} active goals</p>
      </div>
    </header>
    <ul>
      <li v-for="g in GOALS" :key="g.id">
        <span class="ico">{{ g.icon }}</span>
        <div class="body">
          <div class="row">
            <span>{{ g.name }}</span>
            <span class="muted small"><b class="dark">{{ usd(g.saved) }}</b> / {{ usd(g.target) }}</span>
          </div>
          <div class="track"><div :style="{ width: (g.saved / g.target) * 100 + '%' }" /></div>
          <div class="muted small">{{ Math.round((g.saved / g.target) * 100) }}% · {{ g.note }}</div>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
ul {
  display: grid;
  gap: 18px;
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
}
li {
  display: flex;
  gap: 12px;
}
.ico {
  display: grid;
  place-items: center;
  flex: 0 0 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(140, 198, 63, 0.18);
  font-size: 19px;
}
.body {
  flex: 1;
  min-width: 0;
}
.row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 14px;
}
.dark {
  color: var(--text);
}
.track {
  height: 8px;
  margin: 7px 0 5px;
  border-radius: 5px;
  background: rgba(20, 23, 26, 0.07);
  overflow: hidden;
}
.track div {
  height: 100%;
  border-radius: 5px;
  background: linear-gradient(90deg, #6fae2b, #f6d743);
  transition: width 0.6s;
}
</style>
