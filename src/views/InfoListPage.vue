<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import tourismData from '@/data/tourism.json'
import { INFO_CATEGORIES, getInfoCategory } from '@/data/infoCategories'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

const props = defineProps({
  category: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const CATEGORIES = [
  { id: 'all', label: '전체' },
  { id: 'tourism', label: '관광지' },
  { id: 'sports', label: '레포츠' },
  { id: 'culture', label: '문화시설' },
  { id: 'festival', label: '축제/공연/행사' },
  { id: 'shopping', label: '쇼핑' },
]

const ITEMS_PER_PAGE = 50
const PAGE_GROUP_SIZE = 10
const currentPage = ref(1)
const searchQuery = ref('')

const categoryInfo = computed(() => {
  if (props.category === 'all') {
    return { id: 'all', label: '전체' }
  }
  if (props.category === 'tourism') {
    return { id: 'tourism', label: '관광지', data: { items: tourismData.items } }
  }
  return getInfoCategory(props.category)
})

const items = computed(() => {
  if (props.category === 'all') {
    return [...tourismData.items, ...INFO_CATEGORIES.flatMap(category => category.data.items)]
  }
  if (props.category === 'tourism') {
    return tourismData.items
  }
  return categoryInfo.value?.data.items || []
})

// 검색: 이름(title) 또는 주소(addr1) 포함(대소문자 무시)
const filteredItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return items.value
  return items.value.filter(item => {
    const title = (item.title || '').toLowerCase()
    const addr = (item.addr1 || '').toLowerCase()
    return title.includes(q) || addr.includes(q)
  })
})

watch(
  () => props.category,
  () => {
    currentPage.value = 1
    searchQuery.value = ''
  }
)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredItems.value.length / ITEMS_PER_PAGE))
)

const displayItems = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  return filteredItems.value.slice(start, start + ITEMS_PER_PAGE)
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

function selectCategory(categoryId) {
  if (categoryId === props.category) return
  router.push({ name: 'InfoList', params: { category: categoryId } })
}

/* --- Leaflet map + marker cluster --- */
import { ref as vueRef } from 'vue'
const mapRef = vueRef(null)
let mapInstance = null
let clusterGroup = null

function findCategoryForItem(contentid) {
  if (tourismData.items.find(i => String(i.contentid) === String(contentid))) return 'tourism'
  for (const c of INFO_CATEGORIES) {
    if ((c.data.items || []).find(i => String(i.contentid) === String(contentid))) return c.id
  }
  return props.category || 'tourism'
}

function buildDetailHref(item) {
  const cat = findCategoryForItem(item.contentid)
  return router.resolve({ name: 'InfoDetail', params: { category: cat, contentid: item.contentid } }).href
}

function addMarkers(itemsToShow) {
  if (!clusterGroup) return
  clusterGroup.clearLayers()
  itemsToShow.forEach(item => {
    const lat = parseFloat(item.mapy)
    const lng = parseFloat(item.mapx)
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      const marker = L.marker([lat, lng])
      const href = buildDetailHref(item)
      const popupHtml = `<div style="min-width:160px"><strong>${(item.title || '').replace(/"/g,'&quot;')}</strong><div style="margin-top:8px"><a href="${href}">상세보기</a></div></div>`
      marker.bindPopup(popupHtml)
      marker.on('click', () => {
        // popup opens; if user clicks the link in popup they'll navigate; keep SPA navigation also possible
      })
      clusterGroup.addLayer(marker)
    }
  })
}

onMounted(() => {
  // init map
  mapInstance = L.map(mapRef.value || document.createElement('div'), { scrollWheelZoom: false }).setView([37.5665, 126.9780], 11)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(mapInstance)

  clusterGroup = L.markerClusterGroup()
  mapInstance.addLayer(clusterGroup)

  // initial markers from filteredItems (show all filtered markers)
  addMarkers(filteredItems.value)

  // fit bounds if markers present
  const allLatLngs = []
  clusterGroup.eachLayer(layer => {
    if (layer.getLatLng) allLatLngs.push(layer.getLatLng())
  })
  if (allLatLngs.length) {
    const bounds = L.latLngBounds(allLatLngs)
    mapInstance.fitBounds(bounds.pad(0.2))
  }
})

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
    clusterGroup = null
  }
})

// update markers when filteredItems changes or page changes (we show markers for filteredItems, not only current page)
watch(filteredItems, (newItems) => {
  if (!clusterGroup) return
  addMarkers(newItems)
  // adjust bounds
  const latlngs = []
  clusterGroup.eachLayer(layer => {
    if (layer.getLatLng) latlngs.push(layer.getLatLng())
  })
  if (latlngs.length) {
    mapInstance.fitBounds(L.latLngBounds(latlngs).pad(0.2))
  }
})
</script>

<template>
  <section v-if="categoryInfo" class="tourism-info-page">
    <div class="controls">
      <div class="category-tabs">
        <button
          v-for="category in CATEGORIES"
          :key="category.id"
          type="button"
          @click="selectCategory(category.id)"
          :class="{ active: category.id === props.category }"
        >
          {{ category.label }}
        </button>
      </div>

      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="이름 또는 주소로 검색하세요"
          aria-label="검색"
        />
        <button v-if="searchQuery" @click="searchQuery = ''" type="button">초기화</button>
      </div>
    </div>

    <header class="page-header">
      <div>
        <h1>서울 {{ categoryInfo.label }} 정보</h1>
        <p>카드를 클릭하면 상세 정보 페이지로 이동합니다.</p>
      </div>
      <div class="page-summary">
        <span>전체 {{ filteredItems.length }}개</span>
        <span>페이지 {{ currentPage }} / {{ totalPages }}</span>
      </div>
    </header>

    <div class="list-and-map">
      <div class="map-side">
        <div ref="mapRef" class="list-map"></div>
      </div>

      <ul class="tour-list">
        <li v-for="item in displayItems" :key="item.contentid">
          <router-link
            class="tour-link"
            :to="{ name: 'InfoDetail', params: { category: findCategoryForItem(item.contentid), contentid: item.contentid } }"
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
    </div>

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

  <section v-else class="tourism-info-page">
    <p>존재하지 않는 카테고리입니다.</p>
  </section>
</template>

<style scoped>
.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.category-tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.category-tabs button {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #d1d7e2;
  background: #fff;
  cursor: pointer;
}
.category-tabs button.active {
  background: #42b983;
  color: white;
  border-color: #42b983;
}

.search-bar {
  display: flex;
  gap: 8px;
  align-items: center;
}
.search-bar input {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #d1d7e2;
  min-width: 220px;
}
.search-bar button {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #d1d7e2;
  background: #fff;
  cursor: pointer;
}

/* layout */
.list-and-map {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 20px;
  align-items: start;
}
.map-side { width: 100%; }
.list-map {
  height: 420px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e6eef8;
}

/* list styles (keeps previous) */
.tour-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
.tour-link { text-decoration: none; color: inherit; display: block; }
.tour-card {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #e3e7ee;
  border-radius: 12px;
  overflow: hidden;
  min-height: 160px;
}
.tour-image { width: 100%; min-height: 120px; background: #f4f7fb; }
.tour-image img { width: 100%; height: 120px; object-fit: cover; display: block; }
.tour-image-empty { height: 120px; display:flex; align-items:center; justify-content:center; color:#888; }
.tour-info { padding: 12px; display:flex; flex-direction:column; gap:6px; }
.tour-info h2 { margin:0; font-size:1.05rem; color:#1f304c; }
.tour-info p { margin:0; color:#576377; font-size:0.95rem; }

.pagination { display:flex; justify-content:center; gap:10px; margin-top:20px; flex-wrap:wrap; }
.pagination button {
  border:1px solid #d1d7e2; background:#fff; color:#374151; padding:8px 12px; border-radius:8px; cursor:pointer;
}
.pagination button.active { background:#3b82f6; color:#fff; border-color:#3b82f6; }
.pagination button:disabled { opacity:0.45; cursor:not-allowed; }

@media (max-width: 1024px) {
  .list-and-map { grid-template-columns: 1fr; }
  .tour-list { grid-template-columns: 1fr; }
}
</style>