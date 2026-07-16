import dotenv from 'dotenv'

dotenv.config()

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST 요청만 허용됩니다.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body
  try {
    body = await request.json()
  } catch (error) {
    return new Response(
      JSON.stringify({ error: '잘못된 JSON 요청입니다.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  const message = body?.message?.toString().trim()
  if (!message) {
    return new Response(
      JSON.stringify({ error: 'message 필드가 필요합니다.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  if (!OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'OpenAI API key가 설정되지 않았습니다.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    const openAiResponse = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: '당신은 친절한 여행 도우미입니다.' },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
      }),
    })

    const data = await openAiResponse.json()

    if (!openAiResponse.ok) {
      console.error('[OpenAI error]', data)
      return new Response(
        JSON.stringify({
          error: data.error?.message || 'OpenAI API 호출 중 오류가 발생했습니다.',
        }),
        {
          status: openAiResponse.status || 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const reply = data.choices?.[0]?.message?.content?.trim() || '응답을 받지 못했습니다.'
    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error(error)
    return new Response(
      JSON.stringify({ error: '서버에서 OpenAI 요청 중 오류가 발생했습니다.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}