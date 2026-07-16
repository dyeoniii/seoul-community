<script setup>
import { computed, ref, watch, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import tourismData from '@/data/tourism.json'
import { INFO_CATEGORIES, getInfoCategory } from '@/data/infoCategories'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIconUrl from 'leaflet/dist/images/marker-icon.png'
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png'

const props = defineProps({
  category: {
    type: String,
    required: false,
  },
})

const route = useRoute()
const router = useRouter()

const currentCategory = computed(() => props.category || route.params.category)
const currentContentId = computed(
  () => route.params.contentid || route.params.contentId || null
)

const categoryInfo = computed(() => {
  if (!currentCategory.value) return null

  if (currentCategory.value === 'all') {
    return {
      id: 'all',
      label: '전체',
      data: {
        items: [...tourismData.items, ...INFO_CATEGORIES.flatMap(c => c.data.items)],
      },
    }
  }

  if (currentCategory.value === 'tourism') {
    return {
      id: 'tourism',
      label: '관광지',
      data: {
        items: tourismData.items,
      },
    }
  }

  return getInfoCategory(currentCategory.value)
})

const item = computed(() => {
  if (!categoryInfo.value?.data?.items || !currentContentId.value) return null
  return categoryInfo.value.data.items.find(
    i => String(i.contentid) === String(currentContentId.value)
  ) || null
})

const mapContainer = ref(null)
let mapInstance = null
let markerInstance = null

function goBack() {
  router.push({ name: 'InfoList', params: { category: currentCategory.value || 'all' } })
}

const DefaultIcon = L.icon({
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

function initMap() {
  if (!item.value || !mapContainer.value) return
  const lat = Number(item.value.mapy)
  const lng = Number(item.value.mapx)
  if (!isFinite(lat) || !isFinite(lng)) return

  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
    markerInstance = null
  }

  mapInstance = L.map(mapContainer.value, {
    center: [lat, lng],
    zoom: 15,
    scrollWheelZoom: true,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(mapInstance)

  markerInstance = L.marker([lat, lng]).addTo(mapInstance)

  if (item.value.title) {
    markerInstance.bindPopup(item.value.title).openPopup()
  }
}

watch(
  () => item.value,
  async (newItem) => {
    if (newItem) {
      await nextTick()
      initMap()
    } else {
      console.log('InfoDetailPage: item not found', {
        category: currentCategory.value,
        contentid: currentContentId.value,
        categoryInfo: categoryInfo.value,
      })
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
    markerInstance = null
  }
})
</script>


<template>
  <section class="tourism-info-detail">
    <button @click="goBack">목록으로 돌아가기</button>

    <div v-if="item" class="detail-layout">
      <div class="detail-left-column">
        <div class="detail-map-box">
          <div ref="mapContainer" class="info-map" />
        </div>

        <div class="detail-text">
          <h1>{{ item.title }}</h1>
          <p><strong>주소:</strong> {{ item.addr1 }}</p>
          <p><strong>전화:</strong> {{ item.tel || '정보 없음' }}</p>
          <p><strong>우편번호:</strong> {{ item.zipcode || '정보 없음' }}</p>
          <p><strong>위도(Y):</strong> {{ item.mapy }}</p>
          <p><strong>경도(X):</strong> {{ item.mapx }}</p>
        </div>
      </div>

      <div class="detail-right-column">
        <img
          v-if="item.firstimage"
          :src="item.firstimage"
          :alt="item.title"
          class="detail-image"
        />
      </div>
    </div>

    <div v-else>
      <p>선택한 정보를 찾을 수 없습니다.</p>
      <button @click="goBack">목록으로</button>
    </div>
  </section>
</template>


<style scoped>
.tourism-info-detail {
  padding: 20px;
}

.tourism-info-detail button {
  margin-bottom: 20px;
}

.detail-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}

.detail-left-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-right-column {
  display: flex;
  justify-content: center;
  align-items: start;
}

.detail-image {
  width: 100%;
  max-height: 520px;
  object-fit: cover;
  border-radius: 18px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
}

.detail-text {
  background: #fff;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.05);
}

.info-map {
  width: 100%;
  min-height: 420px;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
}

@media (max-width: 980px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }
}

.detail-text {
  background: #fff;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.05);
}

.detail-image {
  width: 100%;
  max-height: 520px;
  object-fit: cover;
  border-radius: 18px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
}

@media (max-width: 980px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }
}
</style>

