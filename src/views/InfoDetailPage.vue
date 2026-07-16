<script setup>
import { computed, watch, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getInfoCategory } from '@/data/infoCategories'
import tourismData from '@/data/tourism.json'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  category: {
    type: String,
    required: true,
  },
})

const route = useRoute()
const router = useRouter()
const contentid = route.params.contentid

// tourism 케이스 처리
const categoryInfo = computed(() => {
  if (props.category === 'tourism') {
    return { id: 'tourism', label: '관광지', data: { items: tourismData.items } }
  }
  return getInfoCategory(props.category)
})

// id 타입 불일치 방지: 문자열로 비교
const item = computed(() =>
  categoryInfo.value?.data?.items?.find(i => String(i.contentid) === String(contentid))
)

const mapRef = ref(null)
let mapInstance = null
let markerInstance = null

function destroyMap() {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
    markerInstance = null
  }
}

function initMapForItem(it) {
  destroyMap()
  if (!it || !it.mapx || !it.mapy) return
  const lat = parseFloat(it.mapy)
  const lng = parseFloat(it.mapx)
  if (Number.isNaN(lat) || Number.isNaN(lng)) return

  // init
  mapInstance = L.map(mapRef.value, { scrollWheelZoom: false }).setView([lat, lng], 15)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(mapInstance)

  markerInstance = L.marker([lat, lng]).addTo(mapInstance)
  markerInstance.bindPopup(`<strong>${it.title}</strong>`).openPopup()
}

// 항목이 준비되면 지도 초기화, 항목 변경 시 재초기화
watch(item, (newItem) => {
  if (newItem) {
    // nextTick 보장 없이도 ref 된 엘리먼트가 있으면 사용
    initMapForItem(newItem)
  } else {
    destroyMap()
  }
}, { immediate: true })

onBeforeUnmount(() => {
  destroyMap()
})

function goBack() {
  router.push({ name: 'InfoList', params: { category: props.category } })
}
</script>

<template>
  <section class="tourism-info-detail">
    <button @click="goBack">목록으로 돌아가기</button>

    <div v-if="item">
      <h1>{{ item.title }}</h1>
      <img v-if="item.firstimage" :src="item.firstimage" :alt="item.title" />
      <p><strong>주소:</strong> {{ item.addr1 }}</p>
      <p><strong>전화:</strong> {{ item.tel || '정보 없음' }}</p>
      <p><strong>우편번호:</strong> {{ item.zipcode || '정보 없음' }}</p>
      <p><strong>지도 X:</strong> {{ item.mapx }}</p>
      <p><strong>지도 Y:</strong> {{ item.mapy }}</p>

      <div v-if="item.mapx && item.mapy" class="map-container" ref="mapRef"></div>
      <div v-else>
        <p>위치 정보가 없습니다.</p>
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
.tourism-info-detail img {
  max-width: 100%;
  margin: 16px 0;
}
.map-container {
  height: 420px;
  margin-top: 18px;
  border-radius: 12px;
  overflow: hidden;
}
</style>