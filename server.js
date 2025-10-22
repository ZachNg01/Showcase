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

// 📌 Career keyword matcher for Gemini AI
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

  return careerKeywords.some(kw => message.toLowerCase().includes(kw));
};

// ✨ Gemini AI chat route
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  if (!isCareerRelated(userMessage)) {
    return res.status(400).json({ reply: '❌ Please ask a career-related question only.' });
  }

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI}`,
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
    console.error('[Gemini Error]', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ EmailJS proxy route (secure)
app.post('/send-email', async (req, res) => {
  const { from_name, reply_to, message } = req.body;

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_USER_ID,
        template_params: { from_name, reply_to, message }
      })
    });

    const text = await response.text();
    let result;

    try {
      result = JSON.parse(text); // Try parse as JSON
    } catch {
      result = { raw: text }; // Fallback: plain text
    }

    if (response.ok) {
      return res.json({ success: true, result });
    } else {
      return res.status(500).json({
        error: result.error || 'EmailJS failed with non-JSON',
        details: result
      });
    }
  } catch (err) {
    console.error('[EmailJS Error]', err);
    res.status(500).json({ error: err.message });
  }
});


// Health check
app.get('/', (req, res) => res.send('🟢 Gemini & EmailJS server is running'));

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));


// 🏡 Microburbs Property Proxy Route (with NaN fix)
app.get('/api/properties', async (req, res) => {
  const suburb = req.query.suburb || 'Belmont North';
  const url = `https://www.microburbs.com.au/report_generator/api/suburb/properties?suburb=${encodeURIComponent(suburb)}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': 'Bearer test',
        'Content-Type': 'application/json'
      }
    });

    const rawText = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Microburbs API error', details: rawText });
    }

    // 🧼 Sanitize invalid JSON tokens before parsing
    const safeText = rawText
      .replace(/\bNaN\b/g, 'null')
      .replace(/\bInfinity\b/g, 'null')
      .replace(/\b-Infinity\b/g, 'null');

    let data;
    try {
      data = JSON.parse(safeText);
    } catch (err) {
      console.error('[JSON Parse Error]', err);
      return res.status(500).json({ error: 'Failed to parse Microburbs data', details: err.message });
    }

    res.json(data);
  } catch (err) {
    console.error('[Microburbs Error]', err);
    res.status(500).json({ error: 'Failed to fetch Microburbs data', details: err.message });
  }
});
