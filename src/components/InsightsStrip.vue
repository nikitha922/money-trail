<script setup lang="ts">
defineProps<{ items: { icon: string; title: string; body: string; tone: 'good' | 'warn' | 'info' }[] }>()
</script>

<template>
  <section class="strip">
    <article v-for="i in items" :key="i.title" class="card insight" :class="i.tone">
      <span class="ico">{{ i.icon }}</span>
      <div>
        <div class="t">{{ i.title }}</div>
        <div class="muted small">{{ i.body }}</div>
      </div>
    </article>
  </section>
</template>

<style scoped>
.strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
}
.insight {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 14px 16px;
  background-image: linear-gradient(90deg, color-mix(in srgb, var(--c) 14%, transparent), transparent 60%);
  transition: transform 0.2s;
}
.insight:hover {
  transform: translateY(-2px);
}
.good {
  --c: #6fae2b;
}
.warn {
  --c: #f08c3a;
}
.info {
  --c: #8a9099;
}
.ico {
  font-size: 22px;
}
.t {
  font-size: 14px;
  font-weight: 600;
}
</style>
