const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize the Google Gen AI SDK using the environment key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const PORT = process.env.PORT || 5000;

app.post('/api/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Engineering our System Instructions to keep the AI focused exclusively on your profile
    const systemInstruction = `
      You are Joaquin Medrano's personal AI Portfolio Agent. Your job is to answer questions from recruiters professionally, confidently, and accurately based ONLY on the provided context data.
      
      Here is the official context regarding Joaquin's background, skills, and projects:
      ${JSON.stringify(context)}
      
      Guidelines:
      - Always write in a helpful, professional, peer-like tone.
      - If a user asks about something completely unrelated to Joaquin's professional field or projects, politely steer the conversation back to his work.
      - Be concise and highlight concrete technical terms (e.g., Pandas, Unity 6, C#).
    `;

    // Calling the modern gemini-2.5-flash model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error running the AI model.' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend proxy running securely on port ${PORT}`);
});