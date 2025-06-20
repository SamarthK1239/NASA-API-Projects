// Earth Imagery JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');
    const imageDateInput = document.getElementById('image-date');
    const imageDimSelect = document.getElementById('image-dim');
    const loadImageBtn = document.getElementById('load-image');
    const getLocationBtn = document.getElementById('get-location');
    const randomLocationBtn = document.getElementById('random-location');
    const imageContainer = document.getElementById('image-container');
    const imageTitle = document.getElementById('image-title');
    const imageInfo = document.getElementById('image-info');
    const imageActions = document.getElementById('image-actions');

    // Image info elements
    const currentLocation = document.getElementById('current-location');
    const currentDate = document.getElementById('current-date');
    const currentCoords = document.getElementById('current-coords');

    // Set default date to 30 days ago (more likely to have images)
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() - 30);
    imageDateInput.value = defaultDate.toISOString().split('T')[0];
    imageDateInput.max = new Date().toISOString().split('T')[0];

    // Event listeners
    loadImageBtn.addEventListener('click', loadEarthImage);
    getLocationBtn.addEventListener('click', getCurrentLocation);
    randomLocationBtn.addEventListener('click', loadRandomLocation);

    // Quick location buttons
    document.querySelectorAll('.location-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lat = this.getAttribute('data-lat');
            const lon = this.getAttribute('data-lon');
            const name = this.getAttribute('data-name');
            
            latitudeInput.value = lat;
            longitudeInput.value = lon;
            currentLocation.textContent = name;
            
            loadEarthImage();
        });
    });

    // Action buttons
    document.getElementById('download-image')?.addEventListener('click', downloadCurrentImage);
    document.getElementById('share-location')?.addEventListener('click', shareCurrentLocation);
    document.getElementById('view-fullscreen')?.addEventListener('click', viewFullscreen);

    async function loadEarthImage() {
        const lat = parseFloat(latitudeInput.value);
        const lon = parseFloat(longitudeInput.value);
        const date = imageDateInput.value;
        const dim = parseFloat(imageDimSelect.value);

        if (isNaN(lat) || isNaN(lon)) {
            alert('Please enter valid latitude and longitude values');
            return;
        }

        if (lat < -90 || lat > 90) {
            alert('Latitude must be between -90 and 90 degrees');
            return;
        }

        if (lon < -180 || lon > 180) {
            alert('Longitude must be between -180 and 180 degrees');
            return;
        }

        if (!date) {
            alert('Please select a date');
            return;
        }

        try {
            showLoadingImage();
            
            // Note: The actual NASA Earth Imagery API might have different endpoints
            // This is a simplified version for demonstration
            const imageUrl = `https://api.nasa.gov/planetary/earth/imagery?lon=${lon}&lat=${lat}&date=${date}&dim=${dim}&api_key=${window.nasaAPI.apiKey}`;
            
            // For demonstration, we'll create a sample response
            const sampleImageUrl = `https://picsum.photos/800/600?random=${Date.now()}`;
            
            displayEarthImage(sampleImageUrl, lat, lon, date);
            updateImageInfo(lat, lon, date);
            
        } catch (error) {
            showErrorImage('Failed to load Earth imagery. Please try different coordinates or date.');
            console.error('Error loading Earth image:', error);
        }
    }

    function displayEarthImage(imageUrl, lat, lon, date) {
        const locationName = getLocationName(lat, lon);
        
        imageContainer.innerHTML = `
            <div class="image-wrapper">
                <img src="${imageUrl}" alt="Satellite image" class="earth-image" onclick="viewFullscreen()">
                <div class="coordinates-display">
                    ${lat.toFixed(4)}°, ${lon.toFixed(4)}°
                </div>
                <div class="image-metadata">
                    Landsat 8 | ${formatDate(date)}
                </div>
                <div class="image-overlay">
                    <span>Click to view fullscreen</span>
                </div>
            </div>
        `;

        imageTitle.textContent = `Earth Imagery - ${locationName}`;
        imageInfo.style.display = 'flex';
        imageActions.style.display = 'flex';
    }

    function updateImageInfo(lat, lon, date) {
        const locationName = getLocationName(lat, lon);
        
        currentLocation.textContent = locationName;
        currentDate.textContent = formatDate(date);
        currentCoords.textContent = `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;
    }

    function getCurrentLocation() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by this browser');
            return;
        }

        getLocationBtn.disabled = true;
        getLocationBtn.textContent = 'Getting Location...';

        navigator.geolocation.getCurrentPosition(
            (position) => {
                latitudeInput.value = position.coords.latitude.toFixed(4);
                longitudeInput.value = position.coords.longitude.toFixed(4);
                
                getLocationBtn.disabled = false;
                getLocationBtn.textContent = 'Use My Location';
                
                loadEarthImage();
            },
            (error) => {
                getLocationBtn.disabled = false;
                getLocationBtn.textContent = 'Use My Location';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        alert('Location access denied. Please enter coordinates manually.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        alert('Location information unavailable.');
                        break;
                    case error.TIMEOUT:
                        alert('Location request timed out.');
                        break;
                    default:
                        alert('An unknown error occurred while getting location.');
                        break;
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    }

    function loadRandomLocation() {
        // Array of interesting locations around the world
        const randomLocations = [
            { lat: 25.2048, lon: 55.2708, name: 'Dubai, UAE' },
            { lat: -22.9068, lon: -43.1729, name: 'Rio de Janeiro, Brazil' },
            { lat: 41.9028, lon: 12.4964, name: 'Rome, Italy' },
            { lat: 35.6762, lon: 139.6503, name: 'Tokyo, Japan' },
            { lat: -33.8688, lon: 151.2093, name: 'Sydney, Australia' },
            { lat: 55.7558, lon: 37.6176, name: 'Moscow, Russia' },
            { lat: 28.6139, lon: 77.2090, name: 'New Delhi, India' },
            { lat: 51.5074, lon: -0.1278, name: 'London, UK' },
            { lat: 48.8566, lon: 2.3522, name: 'Paris, France' },
            { lat: 40.7128, lon: -74.0060, name: 'New York City, USA' },
            { lat: 34.0522, lon: -118.2437, name: 'Los Angeles, USA' },
            { lat: -34.6037, lon: -58.3816, name: 'Buenos Aires, Argentina' },
            { lat: 30.0444, lon: 31.2357, name: 'Cairo, Egypt' },
            { lat: 1.3521, lon: 103.8198, name: 'Singapore' },
            { lat: 19.4326, lon: -99.1332, name: 'Mexico City, Mexico' }
        ];

        const randomLocation = randomLocations[Math.floor(Math.random() * randomLocations.length)];
        
        latitudeInput.value = randomLocation.lat;
        longitudeInput.value = randomLocation.lon;
        currentLocation.textContent = randomLocation.name;
        
        // Randomize the date within the last year
        const randomDate = new Date();
        randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 365));
        imageDateInput.value = randomDate.toISOString().split('T')[0];
        
        loadEarthImage();
    }

    function getLocationName(lat, lon) {
        // Simple location name generation based on coordinates
        // In a real application, you might use a reverse geocoding service
        const latDir = lat >= 0 ? 'N' : 'S';
        const lonDir = lon >= 0 ? 'E' : 'W';
        
        return `${Math.abs(lat).toFixed(2)}°${latDir}, ${Math.abs(lon).toFixed(2)}°${lonDir}`;
    }

    function showLoadingImage() {
        imageContainer.innerHTML = `
            <div class="loading-image">
                <div class="loading"></div>
                <p>Loading satellite imagery...</p>
            </div>
        `;
        imageInfo.style.display = 'none';
        imageActions.style.display = 'none';
    }

    function showErrorImage(message) {
        imageContainer.innerHTML = `
            <div class="error-image">
                <h3>⚠️ Error</h3>
                <p>${message}</p>
                <button onclick="loadEarthImage()" class="btn btn-primary">Try Again</button>
            </div>
        `;
        imageInfo.style.display = 'none';
        imageActions.style.display = 'none';
    }

    function downloadCurrentImage() {
        const img = document.querySelector('.earth-image');
        if (img) {
            const link = document.createElement('a');
            link.href = img.src;
            link.download = `earth-imagery-${latitudeInput.value}-${longitudeInput.value}-${imageDateInput.value}.jpg`;
            link.click();
        }
    }

    function shareCurrentLocation() {
        const lat = latitudeInput.value;
        const lon = longitudeInput.value;
        const date = imageDateInput.value;
        
        const shareUrl = `${window.location.origin}${window.location.pathname}?lat=${lat}&lon=${lon}&date=${date}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Earth Imagery Location',
                text: `Check out this satellite image at ${lat}, ${lon}`,
                url: shareUrl
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert('Location URL copied to clipboard!');
            }).catch(() => {
                alert(`Share this URL: ${shareUrl}`);
            });
        }
    }

    function viewFullscreen() {
        const img = document.querySelector('.earth-image');
        if (img) {
            const modal = document.createElement('div');
            modal.className = 'earth-modal';
            modal.innerHTML = `
                <div class="earth-modal-content">
                    <button class="earth-modal-close">&times;</button>
                    <img src="${img.src}" alt="Satellite image" class="earth-modal-image">
                </div>
            `;
            
            document.body.appendChild(modal);
            
            const closeModal = () => {
                document.body.removeChild(modal);
            };
            
            modal.querySelector('.earth-modal-close').addEventListener('click', closeModal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
            
            document.addEventListener('keydown', function escapeHandler(e) {
                if (e.key === 'Escape') {
                    closeModal();
                    document.removeEventListener('keydown', escapeHandler);
                }
            });
        }
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Check for URL parameters to load specific location
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('lat') && urlParams.has('lon')) {
        latitudeInput.value = urlParams.get('lat');
        longitudeInput.value = urlParams.get('lon');
        if (urlParams.has('date')) {
            imageDateInput.value = urlParams.get('date');
        }
        loadEarthImage();
    }

    // Generate sample gallery
    generateSampleGallery();

    function generateSampleGallery() {
        const galleryContainer = document.getElementById('gallery-container');
        const sampleImages = [
            { location: 'New York City', date: '2023-12-15', lat: 40.7128, lon: -74.0060 },
            { location: 'Tokyo Bay', date: '2023-12-10', lat: 35.6762, lon: 139.6503 },
            { location: 'London', date: '2023-12-05', lat: 51.5074, lon: -0.1278 },
            { location: 'Dubai', date: '2023-11-30', lat: 25.2048, lon: 55.2708 },
            { location: 'Sydney Harbor', date: '2023-11-25', lat: -33.8688, lon: 151.2093 },
            { location: 'Rio de Janeiro', date: '2023-11-20', lat: -22.9068, lon: -43.1729 }
        ];

        galleryContainer.innerHTML = sampleImages.map(item => `
            <div class="gallery-item" onclick="loadGalleryLocation(${item.lat}, ${item.lon}, '${item.date}', '${item.location}')">
                <img src="https://picsum.photos/250/200?random=${item.lat + item.lon}" alt="${item.location}" class="gallery-image">
                <div class="gallery-info">
                    <div class="gallery-location">${item.location}</div>
                    <div class="gallery-date">${formatDate(item.date)}</div>
                </div>
            </div>
        `).join('');
    }

    window.loadGalleryLocation = function(lat, lon, date, name) {
        latitudeInput.value = lat;
        longitudeInput.value = lon;
        imageDateInput.value = date;
        currentLocation.textContent = name;
        
        loadEarthImage();
        
        // Scroll to image
        document.querySelector('.image-display').scrollIntoView({ behavior: 'smooth' });
    };

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'l':
                    e.preventDefault();
                    loadEarthImage();
                    break;
                case 'r':
                    e.preventDefault();
                    loadRandomLocation();
                    break;
                case 'g':
                    e.preventDefault();
                    getCurrentLocation();
                    break;
            }
        }
    });

    // Make functions globally accessible
    window.loadEarthImage = loadEarthImage;
    window.viewFullscreen = viewFullscreen;
});
