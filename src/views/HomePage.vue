<script setup>
import DonutChart from '@/components/DonutChart.vue'
import { INFO_STATS } from '@/data/infoStats'
import { REGION_STATS } from '@/data/regionStats'

const CATEGORY_COLORS = [
  'var(--series-1)',
  'var(--series-2)',
  'var(--series-3)',
  'var(--series-4)',
  'var(--series-5)',
]

const REGION_COLORS = [
  'var(--series-1)',
  'var(--series-2)',
  'var(--series-3)',
  'var(--series-4)',
  'var(--series-5)',
  'var(--series-6)',
  'var(--series-other)',
]
</script>

<template>
  <section class="home-page">
    <div class="home-hero">
      <div class="hero-copy">
        <p class="eyebrow">서울 커뮤니티 서비스</p>
        <h1 class="home-title">서울의 관광 정보와 공공 데이터를 한 번에</h1>
        <p class="hero-description">
          서울시 공공데이터를 기반으로 관광지, 문화시설, 레포츠, 축제·공연·행사, 쇼핑 정보를 한 곳에서 확인할 수 있는 서비스입니다. 커뮤니티 기능으로 질문과 의견을 나누며 정보 활용성을 높입니다.
        </p>
        <div class="hero-actions">
          <router-link to="/community" class="primary-button">커뮤니티 시작하기</router-link>
          <router-link to="/tourism-info" class="secondary-button">관광 정보 바로가기</router-link>
        </div>
      </div>
    </div>

    <section class="home-about">
      <article class="about-card">
        <h3>왜 만들었나요?</h3>
        <p>
          서울 관광 정보가 여러 곳에 흩어져 있어 찾기 어렵고, 공공데이터는 일반 사용자에게
          복잡합니다. 이를 한곳에 모아 쉽게 보고 공유할 수 있도록 만들었습니다.
        </p>
      </article>

      <article class="about-card">
        <h3>누구를 위한 서비스인가요?</h3>
        <p>
          서울 여행자, 지역 주민, 행사 방문객, 공공데이터를 활용하려는 시민 모두를 위한 서비스입니다.
          특히 서울 정보를 빠르게 확인하고 싶은 사용자에게 도움이 됩니다.
        </p>
      </article>

      <article class="about-card">
        <h3>우리 서비스의 특징</h3>
        <p>
          단순 데이터 제공이 아니라, 시각화 보드와 커뮤니티 소통을 함께 제공합니다.
          관광지 정보와 지역 통계 데이터를 동시에 확인할 수 있는 점이 강점입니다.
        </p>
      </article>
    </section>

    <section class="home-dashboard">
      <div class="dashboard-headline">
        <h2>데이터 시각화 보드</h2>
        <p>서울 데이터를 한 섹션에서 비교하며 쉽게 이해할 수 있습니다.</p>
      </div>

      <div class="chart-grid">
        <DonutChart
          title="지역(구)별 데이터 분포"
          description="서울 25개 구 중 데이터가 많은 상위 6개 구와 나머지를 함께 보여줍니다."
          :stats="REGION_STATS"
          :colors="REGION_COLORS"
          center-caption="전체 데이터"
        />

        <DonutChart
          title="서울 정보 데이터 규모"
          description="이 서비스가 다루는 카테고리별 데이터 수를 보여줍니다."
          :stats="INFO_STATS"
          :colors="CATEGORY_COLORS"
          center-caption="전체 데이터"
        />
      </div>
    </section>
  </section>
</template>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 36px 24px 48px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.home-hero {
  /* 한 칸(단일 열) 레이아웃으로 변경 — 텍스트가 잘리지 않도록 전체 폭 사용 */
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  padding: 36px;
  border-radius: 32px;
  background: linear-gradient(180deg, #ffffff 0%, #eef4ff 100%);
  box-shadow: 0 25px 70px rgba(46, 84, 165, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.16);
}

/* 한 칸으로 유지하되 텍스트는 왼쪽 정렬을 유지하고 가로 전체 사용 */
.hero-copy {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.eyebrow {
  margin: 0;
  color: #3b82f6;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.home-hero h1 {
  margin: 0;
  font-size: clamp(2.4rem, 4vw, 3.4rem);
  line-height: 1.05;
  color: #102a43;
}

.hero-description {
  margin: 0;
  color: #4b5563;
  line-height: 1.75;
  /* 넓은 화면에서도 텍스트가 잘리지 않게 max-width 제거 */
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: flex-start; /* 왼쪽 정렬 유지 */
}

.primary-button,
.secondary-button {
  padding: 14px 22px;
  border-radius: 999px;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.primary-button {
  background: #3b82f6;
  color: #ffffff;
  border: 1px solid transparent;
}

.secondary-button {
  background: #ffffff;
  color: #1f2937;
  border: 1px solid #cbd5e1;
}

.primary-button:hover,
.secondary-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(59, 130, 246, 0.18);
}

.hero-notice {
  padding: 24px;
  border-radius: 26px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.06);
}

.hero-notice h2 {
  margin: 0 0 14px;
  font-size: 1.4rem;
  color: #102a43;
}

.hero-notice p {
  margin: 0;
  color: #475569;
  line-height: 1.8;
}

.home-about {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.about-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 26px;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.06);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.about-card:hover {
  transform: translateY(-3px);
  border-color: #93c5fd;
}

.about-card h3 {
  margin: 0 0 12px;
  font-size: 1.15rem;
  color: #0f172a;
}

.about-card p {
  margin: 0;
  color: #475569;
  line-height: 1.75;
}

.home-dashboard {
  padding: 32px 0 0;
}

.dashboard-headline {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 22px;
}

.dashboard-headline h2 {
  margin: 0;
  font-size: 2rem;
  color: #102a43;
}

.dashboard-headline p {
  margin: 0;
  color: #55657a;
  line-height: 1.7;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

@media (max-width: 1024px) {
  .home-hero {
    grid-template-columns: 1fr;
  }

  .home-about {
    grid-template-columns: 1fr;
  }

  .chart-grid {
    grid-template-columns: 1fr;
  }
  .home-title {
    font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
    font-size: clamp(2.4rem, 4vw, 3.4rem);
    letter-spacing: -0.04em;
    line-height: 1.02;
    color: #102a43;
  }

  .hero-description {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 1.05rem;
    line-height: 1.8;
    color: #475569;
  }
}
</style>