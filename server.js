// server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userMessage }] }]
      })
    });

    const data = await geminiResponse.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No reply generated.';
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/hug', async (req, res) => {
  const userInput = req.body.prompt;

  try {
    const hfResponse = await fetch('https://api-inference.huggingface.co/models/gpt2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGING}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: userInput })
    });

    const data = await hfResponse.json();
    res.json({ reply: data?.[0]?.generated_text || 'No Hugging Face reply.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send('Gemini + HuggingFace proxy is running'));

app.listen(port, () => console.log(`Server running on port ${port}`));
