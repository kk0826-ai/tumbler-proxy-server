document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    // ⚠️ PASTE YOUR VERCEL SERVER URL HERE
    const API_BASE_URL = ''; 

    // 20oz Skinny Tapered Tumbler Dimensions (9.3" x 8.2" at 300 DPI)
    const CANVAS_WIDTH = 2790;
    const CANVAS_HEIGHT = 2460;

    // --- DOM ELEMENTS ---
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const gallery = document.getElementById('gallery');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const canvas = document.getElementById('tumblerCanvas');
    const loader = document.getElementById('loader');
    const ctx = canvas.getContext('2d');

    // --- STATE ---
    let selectedImageUrl = null;

    // --- INITIALIZE CANVAS ---
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    ctx.fillStyle = '#FFFFFF'; // Start with a white background
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    // --- FUNCTIONS ---

    // Fetch images from our secure backend
    const searchImages = async () => {
        const query = searchInput.value.trim();
        if (!query) {
            alert('Please enter a search term.');
            return;
        }

        gallery.innerHTML = '';
        loader.style.display = 'block';
        generateBtn.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL}/api/search?query=${query}`);
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            const result = await response.json();
            displayImages(result.data);
        } catch (error) {
            console.error('Fetch error:', error);
            gallery.innerHTML = '<p class="placeholder-text">Failed to load images. Please try again.</p>';
        } finally {
            loader.style.display = 'none';
        }
    };

    // Display fetched images in the gallery
    const displayImages = (images) => {
        gallery.innerHTML = ''; // Clear loader or previous results
        if (!images || images.length === 0) {
            gallery.innerHTML = '<p class="placeholder-text">No results found. Try a different search term.</p>';
            return;
        }
        images.forEach(imageInfo => {
            const imgElement = document.createElement('img');
            imgElement.src = imageInfo.urls.regular; // Use a good quality URL
            imgElement.classList.add('gallery-item');
            imgElement.setAttribute('crossorigin', 'anonymous'); // Important for canvas
            
            imgElement.addEventListener('click', () => {
                // Remove 'selected' from previously selected image
                const currentlySelected = document.querySelector('.gallery-item.selected');
                if (currentlySelected) {
                    currentlySelected.classList.remove('selected');
                }
                
                // Add 'selected' to the new one
                imgElement.classList.add('selected');
                selectedImageUrl = imgElement.src;
                generateBtn.disabled = false;
            });

            gallery.appendChild(imgElement);
        });
    };
    
    // Generate the tumbler wrap on the canvas
    const generateWrap = () => {
        if (!selectedImageUrl) {
            alert('Please select an image first.');
            return;
        }

        const wrapType = document.querySelector('input[name="wrapType"]:checked').value;
        const img = new Image();
        img.crossOrigin = "anonymous"; // Important for loading external images onto canvas
        img.src = selectedImageUrl;

        img.onload = () => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (wrapType === 'straight') {
                // Stretch the image to fill the canvas
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            } else if (wrapType === 'seamless') {
                // Create a repeating pattern
                const pattern = ctx.createPattern(img, 'repeat');
                ctx.fillStyle = pattern;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            downloadBtn.classList.remove('hidden');
        };

        img.onerror = () => {
            alert('Could not load the selected image. It may be due to CORS policy. Try another image.');
        };
    };

    // Download the canvas content
    const downloadWrap = () => {
        const link = document.createElement('a');
        link.download = `freepik-tumbler-wrap-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };


    // --- EVENT LISTENERS ---
    searchBtn.addEventListener('click', searchImages);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            searchImages();
        }
    });
    generateBtn.addEventListener('click', generateWrap);
    downloadBtn.addEventListener('click', downloadWrap);
});