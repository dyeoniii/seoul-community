<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import tourismData from '@/data/tourism.json'

const route = useRoute()
const router = useRouter()
const contentid = route.params.contentid

const item = computed(() =>
  tourismData.items.find(i => i.contentid === contentid)
)

function goBack() {
  router.push({ name: 'TourismInfo' })
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
    </div>

    <div v-else>
      <p>선택한 관광지 정보를 찾을 수 없습니다.</p>
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
</style>