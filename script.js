document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const API_BASE_URL = 'https://tumbler-proxy-server.vercel.app
';
    const DPI = 300; 

    // --- PRESET TEMPLATES ---
    const TUMBLER_PRESETS = {
        "Select a Preset": { topD: "", bottomD: "", height: "" },
        "20oz Skinny Tapered": { topD: 2.94, bottomD: 2.78, height: 8.0 },
        "30oz Skinny Tapered": { topD: 3.18, bottomD: 2.94, height: 9.3 },
        "Custom...": { topD: "", bottomD: "", height: "" }
    };

    // --- DOM ELEMENTS ---
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const gallery = document.getElementById('gallery');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const canvas = document.getElementById('tumblerCanvas');
    const loader = document.getElementById('loader');
    const presetSelector = document.getElementById('presetSelector');
    const topDiameterInput = document.getElementById('topDiameter');
    const bottomDiameterInput = document.getElementById('bottomDiameter');
    const heightInput = document.getElementById('height');
    const ctx = canvas.getContext('2d');

    // --- STATE ---
    let selectedImageUrl = null;

    // --- INITIALIZATION ---
    const init = () => {
        // Populate the preset dropdown
        for (const key in TUMBLER_PRESETS) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = key;
            presetSelector.appendChild(option);
        }
        // Set event listener for the dropdown
        presetSelector.addEventListener('change', handlePresetChange);
    };

    // --- FUNCTIONS ---
    
    // Handles changing the preset dropdown
    const handlePresetChange = () => {
        const selectedPreset = TUMBLER_PRESETS[presetSelector.value];
        topDiameterInput.value = selectedPreset.topD;
        bottomDiameterInput.value = selectedPreset.bottomD;
        heightInput.value = selectedPreset.height;
    };

    // Fetch images (no changes)
    const searchImages = async () => {
        const query = searchInput.value.trim();
        if (!query) { alert('Please enter a search term.'); return; }
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
                generateBtn.disabled = false;
            });
            gallery.appendChild(imgElement);
        });
    };

    // Generate wrap (no changes to the core math)
    const generateWrap = () => {
        if (!selectedImageUrl) { alert('Please select an image first.'); return; }
        const topD = parseFloat(topDiameterInput.value);
        const bottomD = parseFloat(bottomDiameterInput.value);
        const height = parseFloat(heightInput.value);

        if (isNaN(topD) || isNaN(bottomD) || isNaN(height) || topD <= 0 || bottomD <= 0 || height <= 0) {
            alert('Please enter valid, positive numbers for all dimensions.'); return;
        }
        if (topD <= bottomD) { alert('Top diameter must be greater than bottom diameter.'); return; }

        const topR = topD / 2;
        const bottomR = bottomD / 2;
        const slantHeight = Math.sqrt(Math.pow(height, 2) + Math.pow(topR - bottomR, 2));
        const fullConeSlantHeight = (topR * slantHeight) / (topR - bottomR);

        const rOuter = fullConeSlantHeight * DPI;
        const rInner = rOuter - (slantHeight * DPI);
        const topCircumference = (2 * Math.PI * topR) * DPI;
        const theta = topCircumference / rOuter;

        const canvasWidth = rOuter * 2;
        const canvasHeight = rOuter - (rInner * Math.cos(theta / 2));
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = selectedImageUrl;
        img.onload = () => {
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
            downloadBtn.classList.remove('hidden');
        };
        img.onerror = () => alert('Could not load image for drawing.');
    };
    
    // Download wrap (no changes)
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
    
    // --- RUN INITIALIZATION ---
    init();
});
