document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const API_BASE_URL = 'https://tumbler-proxy-server.vercel.app';
    const DPI = 300; 

    // Hard-coded dimensions for standard 20oz tumblers. No user input needed.
    const STRAIGHT_DIMS = { width: 9.3, height: 8.2 }; // inches
    const TAPERED_DIMS = { topD: 2.94, bottomD: 2.78, height: 8.0 }; // inches

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

    // --- FUNCTIONS ---
    
    // Fetch images (no changes)
    const searchImages = async () => {
        const query = searchInput.value.trim();
        if (!query) { alert('Please enter a search term.'); return; }
        gallery.innerHTML = '';
        loader.style.display = 'block';
        generateBtn.disabled = false; // Enable button after search
        try {
            const response = await fetch(`${API_BASE_URL}/api/search?query=${query}`);
            if (!response.ok) throw new Error('Network response was not ok.');
            const result = await response.json();
            displayImages(result.data);
        } catch (error) {
            console.error('Fetch error:', error);
            gallery.innerHTML = '<p class="placeholder-text">Failed to load images.</p>';
        } finally {
            loader.style.display = 'none';
        }
    };

    // Display fetched images (no changes)
    const displayImages = (images) => {
        gallery.innerHTML = '';
        if (!images || images.length === 0) { gallery.innerHTML = '<p class="placeholder-text">No results found.</p>'; return; }
        images.forEach(imageInfo => {
            const imgElement = document.createElement('img');
            imgElement.src = imageInfo.urls.regular;
            imgElement.classList.add('gallery-item');
            imgElement.setAttribute('crossorigin', 'anonymous');
            imgElement.addEventListener('click', () => {
                document.querySelector('.gallery-item.selected')?.classList.remove('selected');
                imgElement.classList.add('selected');
                selectedImageUrl = imgElement.src;
                // Automatically generate the wrap when an image is selected
                generateWrap();
            });
            gallery.appendChild(imgElement);
        });
    };

    // Main function to generate the selected wrap style
    const generateWrap = () => {
        if (!selectedImageUrl) { alert('Please select an image first.'); return; }

        const wrapType = document.querySelector('input[name="wrapType"]:checked').value;
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = selectedImageUrl;
        
        img.onload = () => {
            if (wrapType === 'straight') {
                drawStraightWrap(img);
            } else {
                drawTaperedWrap(img);
            }
            downloadBtn.classList.remove('hidden');
        };
        img.onerror = () => alert('Could not load the selected image for drawing.');
    };

    // Draws the rectangular wrap for a straight tumbler
    const drawStraightWrap = (img) => {
        canvas.width = STRAIGHT_DIMS.width * DPI;
        canvas.height = STRAIGHT_DIMS.height * DPI;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };

    // Draws the arc-shaped wrap for a tapered tumbler
    const drawTaperedWrap = (img) => {
        const { topD, bottomD, height } = TAPERED_DIMS;
        const topR = topD / 2;
        const bottomR = bottomD / 2;
        const slantHeight = Math.sqrt(Math.pow(height, 2) + Math.pow(topR - bottomR, 2));
        const fullConeSlantHeight = (topR * slantHeight) / (topR - bottomR);
        const rOuter = fullConeSlantHeight * DPI;
        const rInner = rOuter - (slantHeight * DPI);
        const topCircumference = (2 * Math.PI * topR) * DPI;
        const theta = topCircumference / rOuter;

        canvas.width = rOuter * 2;
        canvas.height = rOuter - (rInner * Math.cos(theta / 2));
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = rOuter;
        ctx.beginPath();
        ctx.arc(centerX, centerY, rOuter, -Math.PI / 2 - theta / 2, -Math.PI / 2 + theta / 2);
        ctx.arc(centerX, centerY, rInner, -Math.PI / 2 + theta / 2, -Math.PI / 2 - theta / 2, true);
        ctx.closePath();
        ctx.save();
        ctx.clip();
        const pattern = ctx.createPattern(img, 'repeat');
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    };
    
    // Download wrap (no changes)
    const downloadWrap = () => {
        const link = document.createElement('a');
        link.download = `freepik-20oz-wrap-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    // --- EVENT LISTENERS ---
    searchBtn.addEventListener('click', searchImages);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') searchImages();
    });
    // The main "Generate" button now just re-runs the generation with the current settings
    generateBtn.addEventListener('click', generateWrap);
    // Add listeners to radio buttons to auto-update the design
    document.querySelectorAll('input[name="wrapType"]').forEach(radio => {
        radio.addEventListener('change', generateWrap);
    });
    downloadBtn.addEventListener('click', downloadWrap);
});
