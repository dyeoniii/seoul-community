<script setup>
import { computed, ref } from 'vue'
import tourismData from '@/data/tourism.json'

const ITEMS_PER_PAGE = 50
const PAGE_GROUP_SIZE = 10
const currentPage = ref(1)

const items = tourismData.items || []
const totalPages = computed(() =>
  Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE))
)

const displayItems = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  return items.slice(start, start + ITEMS_PER_PAGE)
})

const groupStart = computed(() => {
  const group = Math.ceil(currentPage.value / PAGE_GROUP_SIZE)
  return (group - 1) * PAGE_GROUP_SIZE + 1
})

const groupEnd = computed(() =>
  Math.min(groupStart.value + PAGE_GROUP_SIZE - 1, totalPages.value)
)

const visiblePages = computed(() => {
  const pages = []
  for (let page = groupStart.value; page <= groupEnd.value; page++) {
    pages.push(page)
  }
  return pages
})

function goPage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

function prevGroup() {
  goPage(groupStart.value - 1)
}

function nextGroup() {
  goPage(groupEnd.value + 1)
}
</script>

<template>
  <section class="tourism-info-page">
    <header class="page-header">
      <div>
        <h1>서울 관광지 정보</h1>
        <p>관광지 카드를 클릭하면 상세 정보 페이지로 이동합니다.</p>
      </div>
      <div class="page-summary">
        <span>전체 {{ items.length }}개</span>
        <span>페이지 {{ currentPage }} / {{ totalPages }}</span>
      </div>
    </header>

    <ul class="tour-list">
      <li v-for="item in displayItems" :key="item.contentid">
        <router-link
          class="tour-link"
          :to="{ name: 'TourismInfoDetail', params: { contentid: item.contentid } }"
        >
          <article class="tour-card">
            <div class="tour-image">
              <img v-if="item.firstimage" :src="item.firstimage" :alt="item.title" />
              <div v-else class="tour-image-empty">이미지 없음</div>
            </div>

            <div class="tour-info">
              <h2>{{ item.title }}</h2>
              <p>{{ item.addr1 }}</p>
              <p>{{ item.tel || '전화 정보 없음' }}</p>
            </div>
          </article>
        </router-link>
      </li>
    </ul>

    <nav class="pagination">
      <button @click="prevGroup" :disabled="groupStart === 1">이전</button>

      <button
        v-for="page in visiblePages"
        :key="page"
        @click="goPage(page)"
        :class="{ active: page === currentPage }"
      >
        {{ page }}
      </button>

      <button @click="nextGroup" :disabled="groupEnd === totalPages">다음</button>
    </nav>
  </section>
</template>

<style scoped>
.tourism-info-page {
  padding: 24px;
  max-width: 1180px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 6px;
  font-size: 2rem;
}

.page-header p {
  margin: 0;
  color: #555;
}

.page-summary {
  display: flex;
  gap: 14px;
  color: #666;
  font-size: 0.95rem;
}

.tour-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.tour-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.tour-card {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #e3e7ee;
  border-radius: 18px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  min-height: 320px;
}

.tour-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 40px rgba(34, 60, 80, 0.08);
}

.tour-image {
  width: 100%;
  min-height: 180px;
  background: #f4f7fb;
}

.tour-image img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.tour-image-empty {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 0.95rem;
}

.tour-info {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tour-info h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #1f304c;
}

.tour-info p {
  margin: 0;
  color: #576377;
  line-height: 1.55;
  font-size: 0.95rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 28px;
}

.pagination button {
  border: 1px solid #d1d7e2;
  background: #fff;
  color: #374151;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.pagination button:hover:not(:disabled) {
  background: #f0f4fb;
}

.pagination button.active {
  background: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}

.pagination button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
