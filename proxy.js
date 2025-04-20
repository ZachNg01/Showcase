// proxy.js
require('dotenv').config();            // loads HF_API_TOKEN from .env
const express = require('express');
const fetch   = require('node-fetch');
const app     = express();

app.use(express.json());

app.post('/api/summarise', async (req, res) => {
  try {
    const hfResponse = await fetch(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
          'Content-Type':  'application/json'
        },
        body: JSON.stringify({ inputs: req.body.text })
      }
    );
    const data = await hfResponse.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy listening on port ${PORT}`));
