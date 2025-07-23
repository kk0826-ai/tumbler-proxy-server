document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    // ⚠️ PASTE YOUR VERCEL SERVER URL HERE
    const API_BASE_URL = 'https://tumbler-proxy-server.vercel.app';
    const DPI = 300; // High-quality 300 Dots Per Inch for printing

    // --- DOM ELEMENTS ---
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const gallery = document.getElementById('gallery');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const canvas = document.getElementById('tumblerCanvas');
    const loader = document.getElementById('loader');
    const topDiameterInput = document.getElementById('topDiameter');
    const bottomDiameterInput = document.getElementById('bottomDiameter');
    const heightInput = document.getElementById('height');
    const ctx = canvas.getContext('2d');

    // --- STATE ---
    let selectedImageUrl = null;

    // --- FUNCTIONS ---

    // Fetch images from our secure backend (no changes here)
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
            if (!response.ok) throw new Error('Network response was not ok.');
            const result = await response.json();
            displayImages(result.data);
        } catch (error) {
            console.error('Fetch error:', error);
            gallery.innerHTML = '<p class="placeholder-text">Failed to load images. Please try again.</p>';
        } finally {
            loader.style.display = 'none';
        }
    };

    // Display fetched images in the gallery (no changes here)
    const displayImages = (images) => {
        gallery.innerHTML = '';
        if (!images || images.length === 0) {
            gallery.innerHTML = '<p class="placeholder-text">No results found.</p>';
            return;
        }
        images.forEach(imageInfo => {
            const imgElement = document.createElement('img');
            imgElement.src = imageInfo.urls.regular;
            imgElement.classList.add('gallery-item');
            imgElement.setAttribute('crossorigin', 'anonymous');
            imgElement.addEventListener('click', () => {
                const currentlySelected = document.querySelector('.gallery-item.selected');
                if (currentlySelected) currentlySelected.classList.remove('selected');
                imgElement.classList.add('selected');
                selectedImageUrl = imgElement.src;
                generateBtn.disabled = false;
            });
            gallery.appendChild(imgElement);
        });
    };

    /**
     * Generates the TAPERED wrap on the canvas.
     * This is the new, completely rewritten function.
     */
    const generateWrap = () => {
        // 1. Validate all inputs
        if (!selectedImageUrl) {
            alert('Please select an image first.');
            return;
        }
        const topD = parseFloat(topDiameterInput.value);
        const bottomD = parseFloat(bottomDiameterInput.value);
        const height = parseFloat(heightInput.value);

        if (isNaN(topD) || isNaN(bottomD) || isNaN(height) || topD <= 0 || bottomD <= 0 || height <= 0) {
            alert('Please enter valid, positive numbers for all dimensions.');
            return;
        }
        if (topD <= bottomD) {
            alert('Top diameter must be greater than the bottom diameter.');
            return;
        }

        // 2. Perform geometric calculations to find the arc shape
        const topR = topD / 2;
        const bottomR = bottomD / 2;
        const slantHeight = Math.sqrt(Math.pow(height, 2) + Math.pow(topR - bottomR, 2));
        const fullConeSlantHeight = (topR * slantHeight) / (topR - bottomR);

        // Convert all measurements to pixels for the canvas
        const rOuter = fullConeSlantHeight * DPI;
        const rInner = rOuter - (slantHeight * DPI);
        const topCircumference = (2 * Math.PI * topR) * DPI;
        const theta = topCircumference / rOuter; // The angle of the arc in radians

        // 3. Set canvas dimensions to fit the arc
        const canvasWidth = rOuter * 2;
        const canvasHeight = rOuter - (rInner * Math.cos(theta / 2));
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 4. Load the selected image and draw it inside the calculated arc shape
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = selectedImageUrl;

        img.onload = () => {
            const centerX = canvas.width / 2;
            const centerY = rOuter; // The center of our arcs is below the canvas
            
            // Define the arc path as a clipping mask
            ctx.beginPath();
            ctx.arc(centerX, centerY, rOuter, -Math.PI / 2 - theta / 2, -Math.PI / 2 + theta / 2);
            ctx.arc(centerX, centerY, rInner, -Math.PI / 2 + theta / 2, -Math.PI / 2 - theta / 2, true);
            ctx.closePath();
            
            ctx.save();
            ctx.clip(); // Apply the clipping mask

            // Fill the clipped area with a repeating pattern of the selected image
            const pattern = ctx.createPattern(img, 'repeat');
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.restore(); // Remove the clipping mask

            downloadBtn.classList.remove('hidden');
        };
        img.onerror = () => alert('Could not load the selected image for drawing.');
    };

    // Download the canvas content (no changes here)
    const downloadWrap = () => {
        const link = document.createElement('a');
        link.download = `freepik-tapered-wrap-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    // --- EVENT LISTENERS ---
    searchBtn.addEventListener('click', searchImages);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') searchImages();
    });
    generateBtn.addEventListener('click', generateWrap);
    downloadBtn.addEventListener('click', downloadWrap);
});
