<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  stats: { type: Array, required: true }, // [{ id, label, count }]
  colors: { type: Array, required: true }, // CSS var() 문자열 배열, stats와 같은 순서/길이
  centerCaption: { type: String, default: '전체 데이터' },
})

const SIZE = 220
const CENTER = SIZE / 2
const R_OUTER = 100
const R_INNER = 66
const GAP_DEG = 1.4

const total = computed(() => props.stats.reduce((sum, stat) => sum + stat.count, 0))

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx, cy, rOuter, rInner, startAngle, endAngle) {
  const startOuter = polarToCartesian(cx, cy, rOuter, endAngle)
  const endOuter = polarToCartesian(cx, cy, rOuter, startAngle)
  const startInner = polarToCartesian(cx, cy, rInner, endAngle)
  const endInner = polarToCartesian(cx, cy, rInner, startAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return [
    'M', startOuter.x, startOuter.y,
    'A', rOuter, rOuter, 0, largeArc, 0, endOuter.x, endOuter.y,
    'L', endInner.x, endInner.y,
    'A', rInner, rInner, 0, largeArc, 1, startInner.x, startInner.y,
    'Z',
  ].join(' ')
}

const segments = computed(() => {
  let cursor = 0
  return props.stats.map((stat, index) => {
    const pct = stat.count / total.value
    const sweep = pct * 360
    const start = cursor + GAP_DEG / 2
    const end = Math.max(start + 0.01, cursor + sweep - GAP_DEG / 2)
    cursor += sweep
    return {
      id: stat.id,
      label: stat.label,
      count: stat.count,
      pct,
      colorVar: props.colors[index],
      path: arcPath(CENTER, CENTER, R_OUTER, R_INNER, start, end),
    }
  })
})

const hoveredId = ref(null)
const hoveredSegment = computed(() =>
  segments.value.find(segment => segment.id === hoveredId.value) || null
)

function formatCount(count) {
  return count.toLocaleString('ko-KR')
}

function formatPct(pct) {
  return `${(pct * 100).toFixed(1)}%`
}
</script>

<template>
  <section class="donut-chart">
    <div class="donut-chart-header">
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
    </div>

    <div class="donut-chart-body">
      <div class="donut-wrap">
        <svg
          :viewBox="`0 0 ${SIZE} ${SIZE}`"
          class="donut"
          role="img"
          :aria-label="`전체 ${formatCount(total)}개, 항목별 분포`"
        >
          <path
            v-for="segment in segments"
            :key="segment.id"
            :d="segment.path"
            :fill="segment.colorVar"
            :class="{ 'segment-hovered': hoveredId === segment.id }"
            tabindex="0"
            role="button"
            :aria-label="`${segment.label} ${formatCount(segment.count)}개, 전체의 ${formatPct(segment.pct)}`"
            @pointerenter="hoveredId = segment.id"
            @pointerleave="hoveredId = null"
            @focus="hoveredId = segment.id"
            @blur="hoveredId = null"
          />
        </svg>

        <div class="donut-center">
          <template v-if="hoveredSegment">
            <strong>{{ formatCount(hoveredSegment.count) }}</strong>
            <span>{{ hoveredSegment.label }} · {{ formatPct(hoveredSegment.pct) }}</span>
          </template>
          <template v-else>
            <strong>{{ formatCount(total) }}</strong>
            <span>{{ centerCaption }}</span>
          </template>
        </div>
      </div>

      <ul class="legend">
        <li
          v-for="segment in segments"
          :key="segment.id"
          :class="{ 'legend-hovered': hoveredId === segment.id }"
          @pointerenter="hoveredId = segment.id"
          @pointerleave="hoveredId = null"
        >
          <span class="legend-dot" :style="{ background: segment.colorVar }"></span>
          <span class="legend-label">{{ segment.label }}</span>
          <span class="legend-value">{{ formatCount(segment.count) }}개</span>
          <span class="legend-pct">{{ formatPct(segment.pct) }}</span>
        </li>
      </ul>
    </div>

    <details class="table-view">
      <summary>표로 보기</summary>
      <table>
        <caption class="sr-only">{{ title }} — 항목별 데이터 수와 비율</caption>
        <thead>
          <tr>
            <th scope="col">항목</th>
            <th scope="col">데이터 수</th>
            <th scope="col">비율</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="segment in segments" :key="segment.id">
            <td>{{ segment.label }}</td>
            <td>{{ formatCount(segment.count) }}개</td>
            <td>{{ formatPct(segment.pct) }}</td>
          </tr>
        </tbody>
      </table>
    </details>
  </section>
</template>

<style scoped>
.donut-chart {
  --surface-1: #fcfcfb;
  --text-primary: #0b0b0b;
  --text-secondary: #52514e;
  --text-muted: #898781;
  --gridline: #e1e0d9;
  --series-1: #2a78d6;
  --series-2: #1baf7a;
  --series-3: #eda100;
  --series-4: #008300;
  --series-5: #4a3aa7;
  --series-6: #e34948;
  --series-other: #898781;

  max-width: 880px;
  margin: 0 auto;
  padding: 32px 24px;
  border-top: 1px solid var(--gridline);
}

@media (prefers-color-scheme: dark) {
  .donut-chart {
    --surface-1: #1a1a19;
    --text-primary: #ffffff;
    --text-secondary: #c3c2b7;
    --text-muted: #898781;
    --gridline: #2c2c2a;
    --series-1: #3987e5;
    --series-2: #199e70;
    --series-3: #c98500;
    --series-4: #008300;
    --series-5: #9085e9;
    --series-6: #e66767;
    --series-other: #898781;
  }
}

.donut-chart-header {
  text-align: center;
  margin-bottom: 28px;
}

.donut-chart-header h2 {
  margin: 0 0 6px;
  color: var(--text-primary);
}

.donut-chart-header p {
  margin: 0;
  color: var(--text-secondary);
}

.donut-chart-body {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 40px;
}

.donut-wrap {
  position: relative;
  width: 220px;
  height: 220px;
  flex-shrink: 0;
}

.donut path {
  transition: transform 0.15s ease, opacity 0.15s ease;
  transform-origin: 110px 110px;
  cursor: pointer;
  outline: none;
}

.donut path.segment-hovered,
.donut path:focus-visible {
  transform: scale(1.035);
}

.donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  text-align: center;
}

.donut-center strong {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.1;
}

.donut-center span {
  margin-top: 4px;
  font-size: 13px;
  color: var(--text-secondary);
}

.legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 220px;
}

.legend li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 8px;
  transition: background 0.15s ease;
}

.legend li.legend-hovered {
  background: var(--gridline);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  color: var(--text-primary);
  font-size: 14px;
}

.legend-value {
  margin-left: auto;
  color: var(--text-secondary);
  font-size: 14px;
}

.legend-pct {
  color: var(--text-muted);
  font-size: 13px;
  min-width: 42px;
  text-align: right;
}

.table-view {
  margin-top: 24px;
  text-align: center;
}

.table-view summary {
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 13px;
}

.table-view table {
  margin: 16px auto 0;
  border-collapse: collapse;
  min-width: 320px;
}

.table-view th,
.table-view td {
  padding: 8px 16px;
  border-bottom: 1px solid var(--gridline);
  text-align: left;
  color: var(--text-primary);
  font-size: 14px;
}

.table-view th {
  color: var(--text-secondary);
  font-weight: 600;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
</style>
