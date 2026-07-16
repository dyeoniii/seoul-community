<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCommunityStore, TAGS } from '@/stores/community'

const router = useRouter()
const store = useCommunityStore()

const ALL_TAG = 'all'
const selectedTag = ref(ALL_TAG)

const currentPage = ref(1)
const ITEMS_PER_PAGE = 5

const title = ref('')
const content = ref('')
const password = ref('')
const selectedFormTag = ref(TAGS[0].id)
const editingId = ref(null)
const showForm = ref(false)

const filteredPosts = computed(() => {
  const list =
    selectedTag.value === ALL_TAG
      ? store.posts
      : store.posts.filter(post => post.tag === selectedTag.value)
  return [...list].sort((a, b) => b.id - a.id)
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredPosts.value.length / ITEMS_PER_PAGE))
)

const pagedPosts = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  return filteredPosts.value.slice(start, start + ITEMS_PER_PAGE)
})

function tagLabel(tagId) {
  return TAGS.find(t => t.id === tagId)?.label || tagId
}

function selectTag(tagId) {
  selectedTag.value = tagId
  currentPage.value = 1
}

function openNewPost() {
  title.value = ''
  content.value = ''
  password.value = ''
  selectedFormTag.value = TAGS[0].id
  editingId.value = null
  showForm.value = true
}

function cancelForm() {
  showForm.value = false
  editingId.value = null
}

function submitPost() {
  if (!title.value.trim() || !content.value.trim() || !password.value.trim()) return

  if (editingId.value) {
    const success = store.updatePost(
      {
        id: editingId.value,
        tag: selectedFormTag.value,
        title: title.value,
        content: content.value,
      },
      password.value,
    )

    if (!success) {
      alert('비밀번호가 틀렸습니다.')
      return
    }
    showForm.value = false
    editingId.value = null
    return
  }

  store.addPost({
    tag: selectedFormTag.value,
    title: title.value,
    content: content.value,
    password: password.value,
  })

  title.value = ''
  content.value = ''
  password.value = ''
  showForm.value = false
}

function startEdit(post) {
  const input = prompt('수정 비밀번호를 입력하세요')
  if (input === null) return
  if (input !== post.password) {
    alert('비밀번호가 틀렸습니다.')
    return
  }

  title.value = post.title
  content.value = post.content
  selectedFormTag.value = post.tag
  password.value = input
  editingId.value = post.id
  showForm.value = true
}

function deletePost(post) {
  const input = prompt('삭제 비밀번호를 입력하세요')
  if (input === null) return

  const success = store.deletePost(post.id, input)
  if (!success) {
    alert('비밀번호가 틀렸습니다.')
    return
  }
}

function goDetail(postId) {
  router.push({ name: 'CommunityPostDetail', params: { postId } })
}

function goPage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}
</script>

<template>
  <section class="community-page">
    <div class="community-header">
      <h1>서울 커뮤니티</h1>
      <p>관광, 레포츠, 문화시설, 축제/공연/행사, 쇼핑 이야기를 한 곳에서 나눠요.</p>
    </div>

    <div class="tag-grid">
      <button
        type="button"
        @click="selectTag('all')"
        :class="{ active: selectedTag === 'all' }"
      >
        전체
      </button>
      <button
        v-for="tag in TAGS"
        :key="tag.id"
        type="button"
        @click="selectTag(tag.id)"
        :class="{ active: tag.id === selectedTag }"
      >
        {{ tag.label }}
      </button>
    </div>

    <div class="board-header">
      <h2>게시판</h2>
      <button class="new-post-btn" @click="openNewPost">새 글 쓰기</button>
    </div>

    <div v-if="showForm" class="post-form">
      <h3>{{ editingId ? '글 수정' : '글 작성' }}</h3>
      <label>
        태그
        <select v-model="selectedFormTag">
          <option v-for="tag in TAGS" :key="tag.id" :value="tag.id">{{ tag.label }}</option>
        </select>
      </label>
      <label>
        제목
        <input v-model="title" type="text" placeholder="제목을 입력하세요" />
      </label>
      <label>
        내용
        <textarea v-model="content" rows="6" placeholder="내용을 입력하세요"></textarea>
      </label>
      <label>
        비밀번호
        <input v-model="password" type="password" placeholder="수정/삭제용 비밀번호" />
      </label>

      <div class="form-actions">
        <button @click="submitPost">{{ editingId ? '수정 저장' : '등록' }}</button>
        <button type="button" @click="cancelForm">취소</button>
      </div>
    </div>

    <ul class="post-list">
      <li v-for="post in pagedPosts" :key="post.id" class="post-item">
        <div class="post-meta">
          <span class="tag-badge">{{ tagLabel(post.tag) }}</span>
          <h3 class="post-title" @click="goDetail(post.id)">{{ post.title }}</h3>
          <small>{{ post.createdAt }}</small>
        </div>
        <p class="post-preview">{{ post.content }}</p>
        <div class="post-actions">
          <span class="comment-count">댓글 {{ post.comments.length }}</span>
          <button @click="goDetail(post.id)">상세보기</button>
          <button @click="startEdit(post)">수정</button>
          <button @click="deletePost(post)">삭제</button>
        </div>
      </li>
    </ul>

    <div class="pagination" v-if="totalPages > 1">
      <button @click="goPage(currentPage - 1)" :disabled="currentPage === 1">이전</button>
      <button
        v-for="page in totalPages"
        :key="page"
        @click="goPage(page)"
        :class="{ active: page === currentPage }"
      >
        {{ page }}
      </button>
      <button @click="goPage(currentPage + 1)" :disabled="currentPage === totalPages">다음</button>
    </div>
  </section>
</template>

<style scoped>
.community-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 16px;
}

.community-header {
  margin-bottom: 20px;
  text-align: center;
}

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
  cursor: pointer;
  color: #333;
}

.tag-grid button.active {
  background: #42b983;
  color: white;
  border-color: #42b983;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.board-header h2 {
  margin: 0;
}

.new-post-btn {
  padding: 10px 18px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.post-form {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 28px;
}

.post-form label {
  display: block;
  margin-bottom: 14px;
  color: #333;
}

.post-form input,
.post-form textarea,
.post-form select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-top: 8px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.form-actions button {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.form-actions button:first-child {
  background: #42b983;
  color: white;
}

.form-actions button:last-child {
  background: #f2f2f2;
}

.post-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.post-item {
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  background: white;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.post-meta small {
  margin-left: auto;
}

.tag-badge {
  padding: 4px 10px;
  border-radius: 999px;
  background: #eef8f3;
  color: #2f8f63;
  font-size: 12px;
  font-weight: 600;
}

.post-title {
  margin: 0;
  cursor: pointer;
}

.post-title:hover {
  text-decoration: underline;
}

.post-preview {
  color: #555;
  margin-bottom: 16px;
}

.post-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.comment-count {
  color: #999;
  font-size: 13px;
  margin-right: auto;
}

.post-actions button {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pagination button {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

.pagination button.active {
  background: #42b983;
  color: white;
  border-color: #42b983;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>