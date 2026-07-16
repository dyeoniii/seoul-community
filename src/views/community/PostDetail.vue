<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCommunityStore, TAGS } from '@/stores/community'

const props = defineProps({
  postId: {
    type: [String, Number],
    required: true,
  },
})

const router = useRouter()
const store = useCommunityStore()

const post = computed(() => store.getPostById(props.postId))

const commentText = ref('')
const commentPassword = ref('')
const replyTextByComment = ref({})
const replyPasswordByComment = ref({})
const openReplyForm = ref({})

const isEditing = ref(false)
const editTitle = ref('')
const editContent = ref('')
const editTag = ref(TAGS[0].id)
const editPassword = ref('')

function tagLabel(tagId) {
  return TAGS.find(t => t.id === tagId)?.label || tagId
}

function goList() {
  router.push({ name: 'Community' })
}

function startEdit() {
  if (!post.value) return

  const password = prompt('게시글 비밀번호를 입력하세요')
  if (password === null) return
  if (password !== post.value.password) {
    alert('비밀번호가 틀렸습니다.')
    return
  }

  editTitle.value = post.value.title
  editContent.value = post.value.content
  editTag.value = post.value.tag
  editPassword.value = password
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
}

function submitEdit() {
  if (!post.value || !editTitle.value.trim() || !editContent.value.trim()) return

  const success = store.updatePost(
    {
      id: post.value.id,
      tag: editTag.value,
      title: editTitle.value,
      content: editContent.value,
    },
    editPassword.value,
  )

  if (!success) {
    alert('비밀번호가 틀렸습니다.')
    return
  }

  isEditing.value = false
}

function deletePost() {
  if (!post.value) return

  const password = prompt('게시글 비밀번호를 입력하세요')
  if (password === null) return

  const success = store.deletePost(post.value.id, password)
  if (!success) {
    alert('비밀번호가 틀렸습니다.')
    return
  }

  goList()
}

function addComment() {
  const text = commentText.value.trim()
  const password = commentPassword.value.trim()
  if (!text || !password || !post.value) return

  store.addComment(post.value.id, text, password)
  commentText.value = ''
  commentPassword.value = ''
}

function deleteComment(commentId) {
  if (!post.value) return

  const password = prompt('댓글 비밀번호를 입력하세요')
  if (password === null) return

  const success = store.deleteComment(post.value.id, commentId, password)
  if (!success) {
    alert('비밀번호가 틀렸습니다.')
  }
}

function toggleReplyForm(commentId) {
  openReplyForm.value[commentId] = !openReplyForm.value[commentId]
}

function addReply(commentId) {
  const text = (replyTextByComment.value[commentId] || '').trim()
  const password = (replyPasswordByComment.value[commentId] || '').trim()
  if (!text || !password || !post.value) return

  store.addReply(post.value.id, commentId, text, password)
  replyTextByComment.value[commentId] = ''
  replyPasswordByComment.value[commentId] = ''
  openReplyForm.value[commentId] = false
}

function deleteReply(commentId, replyId) {
  if (!post.value) return

  const password = prompt('답글 비밀번호를 입력하세요')
  if (password === null) return

  const success = store.deleteReply(post.value.id, commentId, replyId, password)
  if (!success) {
    alert('비밀번호가 틀렸습니다.')
  }
}
</script>

<template>
  <section v-if="post" class="post-detail">
    <button class="back-btn" @click="goList">← 목록으로</button>

    <div v-if="!isEditing" class="detail-header">
      <span class="tag-badge">{{ tagLabel(post.tag) }}</span>
      <h1>{{ post.title }}</h1>
      <small>{{ post.createdAt }}</small>
    </div>

    <p v-if="!isEditing" class="detail-content">{{ post.content }}</p>

    <div v-if="!isEditing" class="detail-actions">
      <button @click="startEdit">수정</button>
      <button @click="deletePost">삭제</button>
    </div>

    <div v-else class="post-form">
      <h3>글 수정</h3>
      <label>
        태그
        <select v-model="editTag">
          <option v-for="tag in TAGS" :key="tag.id" :value="tag.id">{{ tag.label }}</option>
        </select>
      </label>
      <label>
        제목
        <input v-model="editTitle" type="text" placeholder="제목을 입력하세요" />
      </label>
      <label>
        내용
        <textarea v-model="editContent" rows="6" placeholder="내용을 입력하세요"></textarea>
      </label>

      <div class="form-actions">
        <button @click="submitEdit">수정 저장</button>
        <button type="button" @click="cancelEdit">취소</button>
      </div>
    </div>

    <section class="comment-section">
      <h2>댓글 {{ post.comments.length }}</h2>

      <div class="comment-input">
        <textarea
          v-model="commentText"
          rows="4"
          placeholder="댓글을 입력하세요"
          @keyup.enter.shift.prevent
        ></textarea>
        <div class="comment-controls">
          <input
            v-model="commentPassword"
            type="password"
            placeholder="비밀번호"
          />
          <button @click="addComment">댓글 등록</button>
        </div>
      </div>

      <ul class="comment-list">
        <li v-for="comment in post.comments" :key="comment.id" class="comment-item">
          <div class="comment-row">
            <span>{{ comment.text }}</span>
            <small>{{ comment.createdAt }}</small>
            <button @click="toggleReplyForm(comment.id)">답글</button>
            <button class="delete-btn" @click="deleteComment(comment.id)">삭제</button>
          </div>

          <ul v-if="comment.replies?.length" class="reply-list">
            <li v-for="reply in comment.replies" :key="reply.id" class="reply-item">
              <span>ㄴ {{ reply.text }}</span>
              <small>{{ reply.createdAt }}</small>
              <button class="delete-btn" @click="deleteReply(comment.id, reply.id)">삭제</button>
            </li>
          </ul>

          <div v-if="openReplyForm[comment.id]" class="reply-input">
            <input
              v-model="replyTextByComment[comment.id]"
              type="text"
              placeholder="답글을 입력하세요"
              @keyup.enter="addReply(comment.id)"
            />
            <input
              v-model="replyPasswordByComment[comment.id]"
              type="password"
              class="reply-password"
              placeholder="답글 비밀번호"
              @keyup.enter="addReply(comment.id)"
            />
            <button @click="addReply(comment.id)">답글 등록</button>
          </div>
        </li>
      </ul>
    </section>
  </section>

  <section v-else class="post-detail-empty">
    <p>존재하지 않는 게시글입니다.</p>
    <button @click="goList">목록으로</button>
  </section>
</template>

<style scoped>
.post-detail {
  max-width: 760px;
  margin: 0 auto;
  padding: 32px 16px;
}

.back-btn {
  background: transparent;
  border: none;
  color: #42b983;
  cursor: pointer;
  padding: 0;
  margin-bottom: 20px;
  font-size: 14px;
}

.detail-header {
  margin-bottom: 20px;
}

.detail-header h1 {
  margin: 10px 0 6px;
}

.tag-badge {
  padding: 4px 10px;
  border-radius: 999px;
  background: #eef8f3;
  color: #2f8f63;
  font-size: 12px;
  font-weight: 600;
}

.detail-content {
  line-height: 1.6;
  color: #333;
  margin-bottom: 20px;
  white-space: pre-wrap;
}

.detail-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 32px;
}

.detail-actions button {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

.post-form {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 32px;
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

.comment-section {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.comment-input {
  display: grid;
  gap: 10px;
  margin: 12px 0;
}

.comment-input textarea {
  width: 100%;
  min-height: 110px;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 10px;
  resize: vertical;
}

.comment-controls {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.comment-controls input {
  width: 200px;
  max-width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.comment-controls button {
  padding: 10px 16px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.reply-input {
  display: flex;
  gap: 10px;
  margin: 12px 0;
  flex-wrap: wrap;
  align-items: flex-end;
}

.reply-input input {
  flex: 1;
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.reply-input input.reply-password {
  width: 160px;
  max-width: 100%;
}

.comment-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.comment-item {
  padding: 12px 0;
  border-bottom: 1px solid #f2f2f2;
}

.comment-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.comment-row small {
  margin-left: auto;
}

.reply-list {
  list-style: none;
  margin: 10px 0 0 20px;
  padding: 0;
}

.reply-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
  color: #555;
}

.reply-item small {
  margin-left: auto;
}

.delete-btn {
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
}

.post-detail-empty {
  max-width: 760px;
  margin: 60px auto;
  text-align: center;
}
</style>