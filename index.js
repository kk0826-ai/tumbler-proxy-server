// This is a simple Express server that acts as a secure proxy for the Freepik API.
// It's designed to be hosted on a serverless platform like Vercel.

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();

// Use CORS to allow our front-end application to talk to this server
app.use(cors());

// This is the main endpoint that our front-end will call.
// e.g., /api/freepik?query=cats&limit=10
app.get('/api/freepik', async (req, res) => {
  // Get the search query and limit from the request
  const { query, limit } = req.query;
  
  // Get the secure API key from the server's environment variables.
  // This is the key you will set in your Vercel project settings.
  const apiKey = process.env.FREEPIK_API_KEY;

  if (!apiKey) {
    // If the API key is not set on the server, return an error.
    return res.status(500).json({ error: 'API key is not configured on the server.' });
  }

  if (!query) {
    // If no search query is provided, return an error.
    return res.status(400).json({ error: 'Search query is required.' });
  }

  // Construct the official Freepik API URL
  const apiUrl = `https://api.freepik.com/v1/resources?term=${encodeURIComponent(query)}&limit=${limit || 10}&filters[asset_type]=photo`;

  try {
    // Make the request to the Freepik API from our secure server
    const freepikResponse = await fetch(apiUrl, {
      headers: {
        'x-freepik-api-key': apiKey,
        'Accept': 'application/json',
      },
    });

    // Check if the request to Freepik was successful
    if (!freepikResponse.ok) {
      // If not, forward the error from Freepik back to our front-end
      const errorData = await freepikResponse.json();
      console.error('Freepik API Error:', errorData);
      return res.status(freepikResponse.status).json({ error: `Freepik API Error: ${errorData.message}` });
    }

    // If successful, get the JSON data from Freepik's response
    const data = await freepikResponse.json();
    
    // Send the data back to our front-end tool
    res.status(200).json(data);

  } catch (error) {
    // Handle any network errors
    console.error('Server Error:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

// This makes the server compatible with Vercel's hosting environment
module.exports = app;
