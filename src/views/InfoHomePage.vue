<template>
  <section class="tourism-info-page">
    <div class="info-header">
      <h1>서울 정보</h1>
      <p>관심있는 카테고리를 선택하거나 전체 목록을 확인하세요.</p>
    </div>

    <div class="tag-grid">
      <button
        v-for="category in CATEGORIES"
        :key="category.id"
        type="button"
        @click="selectCategory(category.id)"
        :class="{ active: category.id === selectedCategory }"
      >
        {{ category.label }}
      </button>
    </div>

    <header class="page-header">
      <div>
        <h2>서울 {{ categoryInfo.label }} 정보</h2>
        <p>카드를 클릭하면 상세 정보 페이지로 이동합니다.</p>
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
          :to="{ name: 'InfoDetail', params: { category: selectedCategory, contentid: item.contentid } }"
        >
          <article class="tour-card">
            <div class="tour-image">
              <img v-if="item.firstimage" :src="item.firstimage" :alt="item.title" />
              <div v-else class="tour-image-empty">이미지 없음</div>
            </div>
            <div class="tour-info">
              <h3>{{ item.title }}</h3>
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

<script setup>
import { ref, computed, watch } from 'vue'
import tourismData from '@/data/tourism.json'
import { INFO_CATEGORIES, getInfoCategory } from '@/data/infoCategories'

const CATEGORIES = [
  { id: 'all', label: '전체' },
  { id: 'tourism', label: '관광지' },
  { id: 'sports', label: '레포츠' },
  { id: 'culture', label: '문화시설' },
  { id: 'festival', label: '축제/공연/행사' },
  { id: 'shopping', label: '쇼핑' },
]

const selectedCategory = ref('all')

const ITEMS_PER_PAGE = 50
const PAGE_GROUP_SIZE = 10
const currentPage = ref(1)

const categoryInfo = computed(() => {
  if (selectedCategory.value === 'all') return { id: 'all', label: '전체' }
  if (selectedCategory.value === 'tourism') return { id: 'tourism', label: '관광지', data: { items: tourismData.items } }
  return getInfoCategory(selectedCategory.value)
})

const items = computed(() => {
  if (selectedCategory.value === 'all') {
    return [...tourismData.items, ...INFO_CATEGORIES.flatMap(c => c.data.items)]
  }
  if (selectedCategory.value === 'tourism') return tourismData.items
  return categoryInfo.value?.data.items || []
})

watch(selectedCategory, () => {
  currentPage.value = 1
})

const totalPages = computed(() => Math.max(1, Math.ceil(items.value.length / ITEMS_PER_PAGE)))

const displayItems = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  return items.value.slice(start, start + ITEMS_PER_PAGE)
})

const groupStart = computed(() => {
  const group = Math.ceil(currentPage.value / PAGE_GROUP_SIZE)
  return (group - 1) * PAGE_GROUP_SIZE + 1
})
const groupEnd = computed(() => Math.min(groupStart.value + PAGE_GROUP_SIZE - 1, totalPages.value))

const visiblePages = computed(() => {
  const pages = []
  for (let p = groupStart.value; p <= groupEnd.value; p++) pages.push(p)
  return pages
})

function selectCategory(categoryId) {
  selectedCategory.value = categoryId
}

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

<style scoped>
.tourism-info-page {
  padding: 24px;
  max-width: 1180px;
  margin: 0 auto;
}
.info-header { text-align: center; margin-bottom: 20px; }
.tag-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-bottom: 24px;
}
.tag-grid button {
  padding: 10px 18px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: white;
  color: #333;
  cursor: pointer;
}
.tag-grid button.active {
  background: #42b983;
  color: white;
  border-color: #42b983;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 24px;
}
.page-header h2 { margin: 0 0 6px; font-size: 1.6rem; }
.page-summary { display: flex; gap: 14px; color: #666; font-size: 0.95rem; }

.tour-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.tour-link { text-decoration: none; color: inherit; display: block; }
.tour-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #e3e7ee;
  border-radius: 12px;
  overflow: hidden;
  min-height: 260px;
}
.tour-image { width: 100%; min-height: 140px; background: #f4f7fb; }
.tour-image img { width: 100%; height: 140px; object-fit: cover; display: block; }
.tour-image-empty { height: 140px; display:flex; align-items:center; justify-content:center; color:#888; }
.tour-info { padding: 12px 14px; display:flex; flex-direction:column; gap:6px; }
.tour-info h3 { margin:0; font-size:1.05rem; color:#1f304c; }
.tour-info p { margin:0; color:#576377; font-size:0.95rem; }

.pagination { display:flex; justify-content:center; gap:10px; margin-top:20px; flex-wrap:wrap; }
.pagination button {
  border:1px solid #d1d7e2; background:#fff; color:#374151; padding:8px 12px; border-radius:8px; cursor:pointer;
}
.pagination button.active { background:#3b82f6; color:#fff; border-color:#3b82f6; }
.pagination button:disabled { opacity:0.45; cursor:not-allowed; }
</style>