// server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// Helper: Check if the message is career-related using fuzzy matching
const isCareerRelated = (message) => {
  const careerKeywords = [
    'career', 'carer', 'carrer', 'carere', 'carrear',
    'job', 'jobs', 'wrk', 'work', 'wok', 'j0b',
    'resume', 'resumé', 'cv', 'c.v.', 'resumae', 'rezume',
    'interview', 'interveiw', 'intreview', 'intrview',
    'recruiter', 'recruter', 'recuriter', 'recrutir',
    'application', 'aplication', 'apply', 'aply', 'applie',
    'skills', 'skils', 'skillz', 'experince', 'experience', 'expirience',
    'linkedin', 'linkdin', 'linkdln', 'linkdn',
    'networking', 'networkin', 'netwroking', 'internship', 'intern', 'intrnship',
    'portfolio', 'portfolyo', 'portfollio', 'cover letter', 'coverletter',
    'offer', 'job offer', 'salary', 'sallary', 'promotion', 'promtion',
    'hiring', 'fire', 'fired', 'layoff', 'laid off', 'employed', 'employment', 'employeement',
    'industry', 'field', 'profession', 'occupation', 'position', 'career change', 'career advice',
    'headhunter', 'gig', 'freelance', 'recruitment', 'career path', 'career goal', 'job search',
    'interview tips', 'job hunt', 'resume tips', 'cv tips', 'career options'
  ];

  const lowerMessage = message.toLowerCase();
  return careerKeywords.some(kw => lowerMessage.includes(kw));
};

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  if (!isCareerRelated(userMessage)) {
    return res.status(400).json({ reply: '❌ Please ask a career-related question only.' });
  }

  try {
    const geminiResponse = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + process.env.GEMINI,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMessage }] }],
          generationConfig: { temperature: 0.7 }
        })
      }
    );

    const data = await geminiResponse.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No reply generated.';
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send('Gemini proxy is running'));

app.listen(port, () => console.log(`Server running on port ${port}`));