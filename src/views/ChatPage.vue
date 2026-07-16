<template>
  <section class="chat-page">
    <h1>OpenAI 챗봇</h1>

    <div class="chat-window">
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="['chat-message', msg.role]"
      >
        <p>{{ msg.content }}</p>
      </div>
      <div v-if="isLoading" class="chat-loading">
        응답을 기다리는 중...
      </div>
    </div>

    <form @submit.prevent="sendMessage" class="chat-input">
      <input
        v-model="userInput"
        type="text"
        placeholder="질문을 입력하세요"
      />
      <button type="submit" :disabled="isLoading || !userInput.trim()">
        전송
      </button>
    </form>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const messages = ref([
  {
    id: 1,
    role: 'assistant',
    content: '안녕하세요! 무엇을 도와드릴까요?',
  },
])

const userInput = ref('')
const isLoading = ref(false)

async function sendMessage() {
  const text = userInput.value.trim()
  if (!text) return

  messages.value.push({
    id: Date.now(),
    role: 'user',
    content: text,
  })

  userInput.value = ''
  isLoading.value = true

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    })
    const data = await response.json()

    messages.value.push({
      id: Date.now() + 1,
      role: 'assistant',
      content: data.reply || '응답을 받지 못했습니다.',
    })
  } catch (error) {
    messages.value.push({
      id: Date.now() + 2,
      role: 'assistant',
      content: '서버 요청 중 오류가 발생했습니다.',
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.chat-page {
  max-width: 700px;
  margin: 0 auto;
  padding: 24px;
}

.chat-window {
  border: 1px solid #ddd;
  border-radius: 12px;
  min-height: 360px;
  padding: 16px;
  margin-bottom: 16px;
  background: #fafafa;
  overflow-y: auto;
}

.chat-message {
  margin-bottom: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  max-width: 85%;
  word-break: break-word;
}

.chat-message.user {
  background: #dbeafe;
  margin-left: auto;
  text-align: right;
}

.chat-message.assistant {
  background: #f3f4f6;
  margin-right: auto;
}

.chat-loading {
  color: #666;
  font-size: 0.95rem;
  margin-top: 8px;
}

.chat-input {
  display: flex;
  gap: 8px;
}

.chat-input input {
  flex: 1;
  padding: 12px 14px;
  border: 1px solid #ccc;
  border-radius: 10px;
}

.chat-input button {
  padding: 12px 18px;
  border: none;
  background: #42b983;
  color: white;
  border-radius: 10px;
  cursor: pointer;
}
</style>