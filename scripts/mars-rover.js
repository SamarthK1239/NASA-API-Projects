// Mars Rover Photos JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const roverSelect = document.getElementById('rover-select');
    const solInput = document.getElementById('sol-number');
    const cameraSelect = document.getElementById('camera-select');
    const loadPhotosBtn = document.getElementById('load-photos');
    const photosContainer = document.getElementById('photos-container');
    const photosTitle = document.getElementById('photos-title');
    const photoCount = document.getElementById('photo-count');
    const roverInfo = document.getElementById('rover-info');
    const loadMoreBtn = document.getElementById('load-more');
    const filterBtns = document.querySelectorAll('.filter-btn');

    let currentPhotos = [];
    let displayedPhotos = 0;
    const photosPerPage = 12;
    let currentFilter = 'all';

    // Rover information database
    const roverData = {
        curiosity: {
            name: 'Curiosity',
            launchDate: '2011-11-26',
            landingDate: '2012-08-05',
            status: 'Active',
            maxSol: 4000,
            totalPhotos: 500000,
            mission: 'Search for signs of past habitability',
            cameras: ['fhaz', 'rhaz', 'mast', 'chemcam', 'mahli', 'mardi', 'navcam']
        },
        opportunity: {
            name: 'Opportunity',
            launchDate: '2003-07-07',
            landingDate: '2004-01-25',
            status: 'Mission Complete',
            maxSol: 5111,
            totalPhotos: 198000,
            mission: 'Search for signs of past water activity',
            cameras: ['fhaz', 'rhaz', 'navcam', 'pancam', 'mi']
        },
        spirit: {
            name: 'Spirit',
            launchDate: '2003-06-10',
            landingDate: '2004-01-04',
            status: 'Mission Complete',
            maxSol: 2208,
            totalPhotos: 124000,
            mission: 'Search for signs of past water activity',
            cameras: ['fhaz', 'rhaz', 'navcam', 'pancam', 'mi']
        },
        perseverance: {
            name: 'Perseverance',
            launchDate: '2020-07-30',
            landingDate: '2021-02-18',
            status: 'Active',
            maxSol: 1000,
            totalPhotos: 200000,
            mission: 'Search for signs of ancient microbial life',
            cameras: ['edl_rucam', 'edl_rdcam', 'edl_ddcam', 'edl_pucam1', 'edl_pucam2', 'navcam_left', 'navcam_right', 'mcz_left', 'mcz_right', 'front_hazcam_left_a', 'front_hazcam_right_a', 'rear_hazcam_left', 'rear_hazcam_right', 'skycam', 'sherloc_watson']
        }
    };

    // Camera descriptions
    const cameraDescriptions = {
        fhaz: 'Front Hazard Avoidance Camera',
        rhaz: 'Rear Hazard Avoidance Camera',
        mast: 'Mast Camera',
        chemcam: 'Chemistry and Camera Complex',
        mahli: 'Mars Hand Lens Imager',
        mardi: 'Mars Descent Imager',
        navcam: 'Navigation Camera',
        pancam: 'Panoramic Camera',
        mi: 'Microscopic Imager'
    };

    // Event listeners
    loadPhotosBtn.addEventListener('click', loadRoverPhotos);
    roverSelect.addEventListener('change', updateRoverInfo);
    loadMoreBtn.addEventListener('click', loadMorePhotos);
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            displayFilteredPhotos();
        });
    });

    // Rover card click handlers
    document.querySelectorAll('.rover-card').forEach(card => {
        card.addEventListener('click', function() {
            const rover = this.getAttribute('data-rover');
            roverSelect.value = rover;
            updateRoverInfo();
            
            // Scroll to controls
            document.querySelector('.rover-controls').scrollIntoView({ 
                behavior: 'smooth' 
            });
        });
    });

    // Initialize
    updateRoverInfo();
    loadRoverPhotos();

    function updateRoverInfo() {
        const selectedRover = roverSelect.value;
        const rover = roverData[selectedRover];
        
        if (rover) {
            solInput.max = rover.maxSol;
            
            roverInfo.innerHTML = `
                <h3>${rover.name} Mission Info</h3>
                <div class="rover-info-grid">
                    <div class="info-item">
                        <span class="info-label">Launch Date</span>
                        <span class="info-value">${formatDate(rover.launchDate)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Landing Date</span>
                        <span class="info-value">${formatDate(rover.landingDate)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Status</span>
                        <span class="info-value ${rover.status === 'Active' ? 'status-active' : 'status-inactive'}">${rover.status}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Max Sol</span>
                        <span class="info-value">${rover.maxSol.toLocaleString()}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Total Photos</span>
                        <span class="info-value">${rover.totalPhotos.toLocaleString()}+</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Mission</span>
                        <span class="info-value">${rover.mission}</span>
                    </div>
                </div>
            `;
            
            roverInfo.classList.add('show');
        }
    }

    async function loadRoverPhotos() {
        const rover = roverSelect.value;
        const sol = parseInt(solInput.value);
        const camera = cameraSelect.value;

        if (!sol || sol < 1) {
            alert('Please enter a valid Sol number (1 or greater)');
            return;
        }

        const roverInfo = roverData[rover];
        if (sol > roverInfo.maxSol) {
            alert(`Sol ${sol} exceeds maximum Sol ${roverInfo.maxSol} for ${roverInfo.name}`);
            return;
        }

        try {
            showLoadingPhotos();
            
            const data = await window.nasaAPI.getMarsRoverPhotos(rover, sol, camera || null);
            currentPhotos = data.photos || [];
            
            if (currentPhotos.length === 0) {
                showNoPhotos(rover, sol, camera);
                return;
            }

            // Update title and count
            photosTitle.textContent = `${roverInfo.name} Photos - Sol ${sol}`;
            photoCount.textContent = `${currentPhotos.length} photos found`;
            
            // Reset display
            displayedPhotos = 0;
            photosContainer.innerHTML = '';
            
            // Display photos
            displayFilteredPhotos();
            
        } catch (error) {
            showErrorPhotos('Failed to load rover photos. Please try again.');
            console.error('Error loading rover photos:', error);
        }
    }

    function displayFilteredPhotos() {
        let filteredPhotos = currentPhotos;
        
        // Apply filter (basic filtering based on camera type)
        if (currentFilter !== 'all') {
            filteredPhotos = currentPhotos.filter(photo => {
                const camera = photo.camera.name.toLowerCase();
                switch (currentFilter) {
                    case 'landscape':
                        return camera.includes('mast') || camera.includes('navcam') || camera.includes('pancam');
                    case 'closeup':
                        return camera.includes('mahli') || camera.includes('mi') || camera.includes('chemcam');
                    case 'panoramic':
                        return camera.includes('pancam') || camera.includes('navcam');
                    default:
                        return true;
                }
            });
        }

        // Update photo count
        photoCount.textContent = `${filteredPhotos.length} photos found`;
        
        // Clear container and reset displayed count
        photosContainer.innerHTML = '';
        displayedPhotos = 0;
        
        // Display first batch
        displayPhotos(filteredPhotos.slice(0, photosPerPage));
        displayedPhotos = Math.min(photosPerPage, filteredPhotos.length);
        
        // Show/hide load more button
        loadMoreBtn.style.display = displayedPhotos < filteredPhotos.length ? 'block' : 'none';
    }

    function loadMorePhotos() {
        let filteredPhotos = currentPhotos;
        
        if (currentFilter !== 'all') {
            filteredPhotos = currentPhotos.filter(photo => {
                const camera = photo.camera.name.toLowerCase();
                switch (currentFilter) {
                    case 'landscape':
                        return camera.includes('mast') || camera.includes('navcam') || camera.includes('pancam');
                    case 'closeup':
                        return camera.includes('mahli') || camera.includes('mi') || camera.includes('chemcam');
                    case 'panoramic':
                        return camera.includes('pancam') || camera.includes('navcam');
                    default:
                        return true;
                }
            });
        }

        const nextPhotos = filteredPhotos.slice(displayedPhotos, displayedPhotos + photosPerPage);
        displayPhotos(nextPhotos);
        displayedPhotos += nextPhotos.length;
        
        if (displayedPhotos >= filteredPhotos.length) {
            loadMoreBtn.style.display = 'none';
        }
    }

    function displayPhotos(photos) {
        photos.forEach(photo => {
            const photoCard = createPhotoCard(photo);
            photosContainer.appendChild(photoCard);
        });
    }

    function createPhotoCard(photo) {
        const card = document.createElement('div');
        card.className = 'photo-card';
        card.onclick = () => openPhotoModal(photo);
        
        const cameraName = cameraDescriptions[photo.camera.name.toLowerCase()] || photo.camera.full_name;
        
        card.innerHTML = `
            <img src="${photo.img_src}" alt="Mars rover photo" class="photo-image" 
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDMwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjMmEyYTJhIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTI1IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPg=='">
            <div class="photo-info">
                <h3 class="photo-title">${cameraName}</h3>
                <div class="photo-details">
                    <div class="detail-item">
                        <span class="detail-label">Sol</span>
                        <span class="detail-value">${photo.sol}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Camera</span>
                        <span class="detail-value">${photo.camera.name.toUpperCase()}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Rover</span>
                        <span class="detail-value">${photo.rover.name}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Status</span>
                        <span class="detail-value">${photo.rover.status}</span>
                    </div>
                </div>
                <div class="photo-date">${formatDate(photo.earth_date)}</div>
            </div>
        `;
        
        return card;
    }

    function openPhotoModal(photo) {
        const modal = document.createElement('div');
        modal.className = 'photo-modal';
        
        const cameraName = cameraDescriptions[photo.camera.name.toLowerCase()] || photo.camera.full_name;
        
        modal.innerHTML = `
            <div class="photo-modal-content">
                <button class="photo-modal-close">&times;</button>
                <img src="${photo.img_src}" alt="Mars rover photo" class="photo-modal-image">
                <div class="photo-modal-info">
                    <strong>${photo.rover.name} - ${cameraName}</strong><br>
                    Sol ${photo.sol} | ${formatDate(photo.earth_date)}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeModal = () => {
            document.body.removeChild(modal);
        };
        
        modal.querySelector('.photo-modal-close').addEventListener('click', closeModal);
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

    function showLoadingPhotos() {
        photosContainer.innerHTML = `
            <div class="loading-photos">
                <div class="loading"></div>
                <p>Loading Mars rover photos...</p>
            </div>
        `;
        loadMoreBtn.style.display = 'none';
    }

    function showErrorPhotos(message) {
        photosContainer.innerHTML = `
            <div class="error-photos">
                <h3>⚠️ Error</h3>
                <p>${message}</p>
                <button onclick="loadRoverPhotos()" class="btn btn-primary">Try Again</button>
            </div>
        `;
        loadMoreBtn.style.display = 'none';
    }

    function showNoPhotos(rover, sol, camera) {
        const roverInfo = roverData[rover];
        const cameraText = camera ? ` with ${camera.toUpperCase()} camera` : '';
        
        photosContainer.innerHTML = `
            <div class="no-photos">
                <h3>📷 No Photos Found</h3>
                <p>No photos were taken by ${roverInfo.name} on Sol ${sol}${cameraText}.</p>
                <p>Try a different Sol number or camera type.</p>
                <div style="margin-top: 20px;">
                    <button onclick="document.getElementById('sol-number').value = Math.floor(Math.random() * ${roverInfo.maxSol}) + 1; loadRoverPhotos();" class="btn btn-secondary">Try Random Sol</button>
                </div>
            </div>
        `;
        loadMoreBtn.style.display = 'none';
        photoCount.textContent = '0 photos found';
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'l':
                    e.preventDefault();
                    loadRoverPhotos();
                    break;
                case 'r':
                    e.preventDefault();
                    const rovers = ['curiosity', 'opportunity', 'spirit', 'perseverance'];
                    const randomRover = rovers[Math.floor(Math.random() * rovers.length)];
                    roverSelect.value = randomRover;
                    updateRoverInfo();
                    
                    const maxSol = roverData[randomRover].maxSol;
                    solInput.value = Math.floor(Math.random() * maxSol) + 1;
                    loadRoverPhotos();
                    break;
            }
        }
    });

    // Make loadRoverPhotos globally accessible
    window.loadRoverPhotos = loadRoverPhotos;
});
