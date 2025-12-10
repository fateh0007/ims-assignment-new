// backend/utils/aiClient.js
const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
// Prefer a current, available model; strip any accidental leading "models/".
const GEMINI_MODEL = (process.env.GEMINI_MODEL || "gemini-1.5-flash-latest").replace(/^models\//, "");

async function generateSummary(text) {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const body = {
      contents: [
        {
          parts: [
            {
              text:
                "Summarize the following text as one clear paragraph of about 120-180 words. " +
                "Write at least 4 full sentences, no bullet points, no headings. " +
                "Cover the key points with a concise, coherent flow:\n\n" +
                text.slice(0, 600000) // limit size
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 700
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