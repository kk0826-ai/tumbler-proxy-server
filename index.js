// Import necessary packages
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

// Initialize the express app
const app = express();
const PORT = process.env.PORT || 3001;

// Use CORS to allow cross-origin requests from your front-end
app.use(cors());

// Define the search route
app.get('/api/search', async (req, res) => {
  // Get the search query from the request
  const { query } = req.query;

  // Retrieve the secure API key from Vercel's environment variables
  const apiKey = process.env.FREEPIK_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ message: 'API key is not configured on the server.' });
  }

  if (!query) {
    return res.status(400).json({ message: 'Search query is required.' });
  }

  // Construct the Freepik API URL
  const apiUrl = `https://api.freepik.com/v1/resources?locale=en-US&term=${encodeURIComponent(query)}&page=1&limit=50`;

  try {
    // Fetch data from Freepik API
    const freepikResponse = await fetch(apiUrl, {
      headers: {
        'Accept-Language': 'en-US',
        'Accept': 'application/json',
        'X-Freepik-API-Key': apiKey,
      },
    });

    if (!freepikResponse.ok) {
        throw new Error(`Freepik API responded with status: ${freepikResponse.status}`);
    }

    const data = await freepikResponse.json();
    
    // Send the data back to the front-end
    res.json(data);

  } catch (error) {
    console.error('Error fetching from Freepik API:', error);
    res.status(500).json({ message: 'Failed to fetch images from Freepik.' });
  }
});

// Export the app for Vercel's serverless environment
module.exports = app;
