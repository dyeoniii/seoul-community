import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(express.json())

app.post('/api/chat', async (req, res) => {
  const { message } = req.body

  if (!message) {
    return res.status(400).json({ error: 'message가 필요합니다.' })
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.VITE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: '당신은 친절한 여행 도우미입니다.' },
          { role: 'user', content: message },
        ],
      }),
    })

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || '응답을 받지 못했습니다.'
    res.json({ reply })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'OpenAI 요청 중 오류가 발생했습니다.' })
  }
})

const port = 3000
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})