
const axios = require('axios');

async function generateSummary(text) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('No API key');

  const resp = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: "gpt-4o-mini",
    messages: [
      { role: 'system', content: 'You are a helpful assistant that summarizes documents for students.'},
      { role: 'user', content: `Summarize the following document in 6 short bullet points:\n\n${text}`}
    ],
    max_tokens: 250
  }, {
    headers: { Authorization: `Bearer ${key}` }
  });

  const summary = resp.data.choices[0].message.content;
  return summary;
}

module.exports = { generateSummary };
