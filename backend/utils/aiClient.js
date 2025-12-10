// backend/utils/aiClient.js
const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;  
const GEMINI_MODEL = process.env.GEMINI_MODEL || "models/gemini-pro";  

async function generateSummary(text) {
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const body = {
      contents: [
        {
          parts: [
            {
              text:
                "Summarize the following text in 6 short bullet points:\n\n" +
                text.slice(0, 60000) // limit size
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 400
      }
    };

    const response = await axios.post(endpoint, body, {
      headers: { "Content-Type": "application/json" }
    });

    // Extract summary
    const candidate = response.data.candidates?.[0];
    const output =
      candidate?.content?.parts?.map((p) => p.text).join("\n") ||
      candidate?.output ||
      JSON.stringify(response.data);

    return output.trim();
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    throw new Error(
      "Gemini summarization failed: " +
        JSON.stringify(err.response?.data || err.message)
    );
  }
}

module.exports = { generateSummary };
