import { defineStore } from 'pinia'
import { ref } from 'vue'

export const TAGS = [
  { id: 'tourism', label: '관광지' },
  { id: 'sports', label: '레포츠' },
  { id: 'culture', label: '문화시설' },
  { id: 'festival', label: '축제/공연/행사' },
  { id: 'shopping', label: '쇼핑' },
]

export const useCommunityStore = defineStore('community', () => {
  const posts = ref([
    {
      id: 1,
      tag: 'tourism',
      title: '경복궁 추천',
      content: '경복궁에서 한복 입고 사진 찍기 좋아요.',
      createdAt: '2026-07-15',
      password: '1234',
      comments: [
        {
          id: 111,
          text: '저도 추천합니다!',
          createdAt: '2026-07-15',
          password: '1234',
          replies: [],
        },
      ],
    },
    {
      id: 2,
      tag: 'tourism',
      title: '남산타워 야경 명소',
      content: '남산타워 야경 보러 갈 때 좋은 시간대 공유합니다.',
      createdAt: '2026-07-14',
      password: '1234',
      comments: [],
    },
    {
      id: 3,
      tag: 'sports',
      title: '한강 자전거 코스 추천',
      content: '저녁에 타기 좋은 코스가 어디인지 궁금합니다.',
      createdAt: '2026-07-13',
      password: '1234',
      comments: [],
    },
    {
      id: 4,
      tag: 'culture',
      title: 'DDP 전시회 후기',
      content: '요즘 DDP 전시가 정말 좋더라고요.',
      createdAt: '2026-07-12',
      password: '1234',
      comments: [],
    },
    {
      id: 5,
      tag: 'festival',
      title: '서울 밤도깨비 야시장 후기',
      content: '야시장 먹거리 추천합니다.',
      createdAt: '2026-07-11',
      password: '1234',
      comments: [],
    },
  ])

  const nextPostId = ref(6)

  function getPostById(postId) {
    return posts.value.find(post => post.id === Number(postId))
  }

  function addPost(post) {
    posts.value.unshift({
      id: nextPostId.value++,
      comments: [],
      createdAt: new Date().toISOString().slice(0, 10),
      password: post.password || '',
      ...post,
    })
  }

  function updatePost(updatedPost, password) {
    const index = posts.value.findIndex(post => post.id === updatedPost.id)
    if (index === -1) return false
    if (posts.value[index].password !== password) return false

    posts.value[index] = { ...posts.value[index], ...updatedPost }
    return true
  }

  function deletePost(postId, password) {
    const post = getPostById(postId)
    if (!post) return false
    if (post.password !== password) return false
    posts.value = posts.value.filter(post => post.id !== postId)
    return true
  }

  function addComment(postId, text, password) {
    const post = getPostById(postId)
    if (!post) return
    post.comments.push({
      id: Date.now(),
      text,
      createdAt: new Date().toISOString().slice(0, 10),
      password: password || '',
      replies: [],
    })
  }

  function deleteComment(postId, commentId, password) {
    const post = getPostById(postId)
    if (!post) return false
    const comment = post.comments.find(comment => comment.id === commentId)
    if (!comment || comment.password !== password) return false
    post.comments = post.comments.filter(comment => comment.id !== commentId)
    return true
  }

  function addReply(postId, commentId, text, password) {
    const post = getPostById(postId)
    const comment = post?.comments.find(c => c.id === commentId)
    if (!comment) return
    comment.replies.push({
      id: Date.now(),
      text,
      createdAt: new Date().toISOString().slice(0, 10),
      password: password || '',
    })
  }

  function deleteReply(postId, commentId, replyId, password) {
    const post = getPostById(postId)
    const comment = post?.comments.find(c => c.id === commentId)
    if (!comment) return false
    const reply = comment.replies.find(r => r.id === replyId)
    if (!reply || reply.password !== password) return false
    comment.replies = comment.replies.filter(r => r.id !== replyId)
    return true
  }

  return {
    posts,
    getPostById,
    addPost,
    updatePost,
    deletePost,
    addComment,
    deleteComment,
    addReply,
    deleteReply,
  }
})