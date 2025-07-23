const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());

// The route must be /api/search
app.get('/api/search', async (req, res) => {
  const { query } = req.query;
  const apiKey = process.env.FREEPIK_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ message: 'API key is not configured.' });
  }

  if (!query) {
    return res.status(400).json({ message: 'Search query is required.' });
  }

  const apiUrl = `https://api.freepik.com/v1/resources?locale=en-US&term=${encodeURIComponent(query)}&page=1&limit=50`;

  try {
    const freepikResponse = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'X-Freepik-API-Key': apiKey,
      },
    });
    if (!freepikResponse.ok) {
      throw new Error(`Freepik API responded with status: ${freepikResponse.status}`);
    }
    const data = await freepikResponse.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching from Freepik API:', error);
    res.status(500).json({ message: 'Failed to fetch images from Freepik.' });
  }
});

module.exports = app;
