import { createRouter, createWebHistory } from 'vue-router'

const HomePage = () => import('@/views/HomePage.vue')
const InfoHomePage = () => import('@/views/InfoHomePage.vue')
const CommunityBoard = () => import('@/views/CommunityBoard.vue')
const CommunityPostDetail = () => import('@/views/community/PostDetail.vue')
const TourismInfoPage = () => import('@/views/TourismInfoPage.vue')
const TourismInfoDetail = () => import('@/views/TourismInfoDetail.vue')
const InfoListPage = () => import('@/views/InfoListPage.vue')
const InfoDetailPage = () => import('@/views/InfoDetailPage.vue')
const ChatPage = () => import('@/views/ChatPage.vue')

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/info', name: 'InfoHome', component: InfoHomePage },
  { path: '/info/:category/:contentid', name: 'InfoDetail', component: InfoDetailPage, props: true },
  { path: '/info/:category', name: 'InfoList', component: InfoListPage, props: true },
  { path: '/community', name: 'Community', component: CommunityBoard },
  { path: '/community/:postId', name: 'CommunityPostDetail', component: CommunityPostDetail, props: true },
  { path: '/tourism-info', name: 'TourismInfo', component: TourismInfoPage },
  { path: '/tourism-info/:contentid', name: 'TourismInfoDetail', component: TourismInfoDetail, props: true },
  { path: '/chat', name: 'Chat', component: ChatPage },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router