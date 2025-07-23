async function searchImages(event) {
  event.preventDefault();

  const query = document.getElementById("searchInput").value;
  const imageContainer = document.getElementById("imageContainer");
  imageContainer.innerHTML = "Loading...";

  try {
    const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error("Network response was not ok.");

    const data = await response.json();
    imageContainer.innerHTML = "";

    data.images.forEach((url) => {
      const img = document.createElement("img");
      img.src = url;
      img.alt = "Freepik Image";
      img.style.width = "200px";
      img.style.margin = "10px";
      imageContainer.appendChild(img);
    });
  } catch (error) {
    console.error("Fetch error:", error);
    imageContainer.innerHTML = "Failed to load images.";
  }
}
