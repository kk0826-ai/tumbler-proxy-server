// /api/search.js
console.log("API Key is:", process.env.FREEPIK_API_KEY ? "FOUND" : "MISSING");
export default async function handler(req, res) {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Missing search query" });
  }

  const apiKey = process.env.FREEPIK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server misconfiguration: API key missing" });
  }

  const apiUrl = `https://api.freepik.com/v1/resources?term=${encodeURIComponent(query)}&type=photo&limit=20`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();

    // Extract thumbnail URLs (adjust property name based on actual Freepik response)
    const imageUrls = data.resources.map((item) => item.thumbnail_url);

    res.status(200).json({ images: imageUrls });
  } catch (error) {
    console.error("Freepik API error:", error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
}
