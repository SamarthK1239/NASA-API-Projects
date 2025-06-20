// Near Earth Objects (Asteroids) JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const loadNeosBtn = document.getElementById('load-neos');
    const todayNeosBtn = document.getElementById('today-neos');
    const thisWeekBtn = document.getElementById('this-week');
    const neoContainer = document.getElementById('neo-container');
    const neoTitle = document.getElementById('neo-title');
    const neoStats = document.getElementById('neo-stats');
    const sortSelect = document.getElementById('sort-select');
    const showHazardousCheckbox = document.getElementById('show-hazardous');
    const timelineContainer = document.getElementById('timeline-container');

    // Stats elements
    const totalNeosEl = document.getElementById('total-neos');
    const hazardousNeosEl = document.getElementById('hazardous-neos');
    const largestDiameterEl = document.getElementById('largest-diameter');
    const closestDistanceEl = document.getElementById('closest-distance');

    let currentNeoData = null;
    let filteredNeos = [];

    // Set default dates (today)
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    startDateInput.value = todayStr;
    endDateInput.value = todayStr;
    startDateInput.max = todayStr;
    endDateInput.max = todayStr;

    // Event listeners
    loadNeosBtn.addEventListener('click', loadNearEarthObjects);
    todayNeosBtn.addEventListener('click', loadTodayNeos);
    thisWeekBtn.addEventListener('click', loadThisWeekNeos);
    sortSelect.addEventListener('change', applySortAndFilter);
    showHazardousCheckbox.addEventListener('change', applySortAndFilter);

    // Load today's NEOs on page load
    loadTodayNeos();

    async function loadTodayNeos() {
        const today = new Date().toISOString().split('T')[0];
        startDateInput.value = today;
        endDateInput.value = today;
        await loadNearEarthObjects();
    }

    async function loadThisWeekNeos() {
        const today = new Date();
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        startDateInput.value = today.toISOString().split('T')[0];
        endDateInput.value = weekFromNow.toISOString().split('T')[0];
        await loadNearEarthObjects();
    }

    async function loadNearEarthObjects() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        if (!startDate || !endDate) {
            alert('Please select both start and end dates');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            alert('Start date must be before end date');
            return;
        }

        // Check if date range is too large (API limitation)
        const daysDiff = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
        if (daysDiff > 7) {
            alert('Date range cannot exceed 7 days due to API limitations');
            return;
        }

        try {
            showLoadingNeos();
            
            const data = await window.nasaAPI.getNearEarthObjects(startDate, endDate);
            currentNeoData = data;
            
            if (!data.near_earth_objects || Object.keys(data.near_earth_objects).length === 0) {
                showNoNeos(startDate, endDate);
                return;
            }

            // Process and display data
            processNeoData(data);
            applySortAndFilter();
            updateNeoTitle(startDate, endDate);
            displayStats();
            neoStats.style.display = 'block';
            
            // Load timeline for future approaches
            await loadNeoTimeline();
            
        } catch (error) {
            showErrorNeos('Failed to load Near Earth Objects data. Please try again.');
            console.error('Error loading NEOs:', error);
        }
    }

    function processNeoData(data) {
        filteredNeos = [];
        
        // Flatten the NEO data from all dates
        Object.keys(data.near_earth_objects).forEach(date => {
            data.near_earth_objects[date].forEach(neo => {
                // Add the approach date for this specific date
                const approachData = neo.close_approach_data.find(approach => 
                    approach.close_approach_date === date
                );
                
                if (approachData) {
                    filteredNeos.push({
                        ...neo,
                        approach_date: date,
                        approach_data: approachData
                    });
                }
            });
        });
    }

    function applySortAndFilter() {
        if (!filteredNeos.length) return;

        let neos = [...filteredNeos];

        // Apply hazardous filter
        if (showHazardousCheckbox.checked) {
            neos = neos.filter(neo => neo.is_potentially_hazardous_asteroid);
        }

        // Apply sorting
        const sortBy = sortSelect.value;
        neos.sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(a.approach_date) - new Date(b.approach_date);
                case 'size':
                    const aSize = parseFloat(a.estimated_diameter.kilometers.estimated_diameter_max);
                    const bSize = parseFloat(b.estimated_diameter.kilometers.estimated_diameter_max);
                    return bSize - aSize;
                case 'distance':
                    const aDistance = parseFloat(a.approach_data.miss_distance.kilometers);
                    const bDistance = parseFloat(b.approach_data.miss_distance.kilometers);
                    return aDistance - bDistance;
                case 'velocity':
                    const aVelocity = parseFloat(a.approach_data.relative_velocity.kilometers_per_hour);
                    const bVelocity = parseFloat(b.approach_data.relative_velocity.kilometers_per_hour);
                    return bVelocity - aVelocity;
                default:
                    return 0;
            }
        });

        displayNeos(neos);
    }

    function displayNeos(neos) {
        if (neos.length === 0) {
            neoContainer.innerHTML = `
                <div class="no-neos">
                    <h3>🔍 No NEOs Found</h3>
                    <p>No Near Earth Objects match your current filters.</p>
                    <button onclick="document.getElementById('show-hazardous').checked = false; applySortAndFilter();" class="btn btn-secondary">Clear Filters</button>
                </div>
            `;
            return;
        }

        neoContainer.innerHTML = neos.map(neo => createNeoCard(neo)).join('');
    }

    function createNeoCard(neo) {
        const diameter = neo.estimated_diameter.kilometers;
        const avgDiameter = (diameter.estimated_diameter_min + diameter.estimated_diameter_max) / 2;
        const distance = parseFloat(neo.approach_data.miss_distance.kilometers);
        const velocity = parseFloat(neo.approach_data.relative_velocity.kilometers_per_hour);
        const isHazardous = neo.is_potentially_hazardous_asteroid;

        return `
            <div class="neo-card ${isHazardous ? 'hazardous' : ''}">
                <div class="neo-header">
                    <h3 class="neo-name">${neo.name}</h3>
                    ${isHazardous ? '<span class="hazard-badge">Hazardous</span>' : ''}
                </div>
                
                <div class="neo-details">
                    <div class="detail-group">
                        <span class="detail-label">Diameter</span>
                        <span class="detail-value">${avgDiameter.toFixed(2)} km</span>
                    </div>
                    <div class="detail-group">
                        <span class="detail-label">Miss Distance</span>
                        <span class="detail-value ${distance < 1000000 ? 'danger' : ''}">${formatDistance(distance)}</span>
                    </div>
                    <div class="detail-group">
                        <span class="detail-label">Velocity</span>
                        <span class="detail-value">${velocity.toLocaleString()} km/h</span>
                    </div>
                    <div class="detail-group">
                        <span class="detail-label">NEO ID</span>
                        <span class="detail-value">${neo.neo_reference_id}</span>
                    </div>
                </div>
                
                <div class="neo-approach-date">
                    <div class="approach-label">Close Approach Date</div>
                    <div class="approach-date">${formatDate(neo.approach_date)}</div>
                </div>
            </div>
        `;
    }

    function displayStats() {
        if (!filteredNeos.length) return;

        const totalNeos = filteredNeos.length;
        const hazardousNeos = filteredNeos.filter(neo => neo.is_potentially_hazardous_asteroid).length;
        
        // Find largest diameter
        const largestDiameter = Math.max(...filteredNeos.map(neo => 
            neo.estimated_diameter.kilometers.estimated_diameter_max
        ));
        
        // Find closest distance
        const closestDistance = Math.min(...filteredNeos.map(neo => 
            parseFloat(neo.approach_data.miss_distance.kilometers)
        ));

        // Animate counters
        animateCounter(totalNeosEl, totalNeos);
        animateCounter(hazardousNeosEl, hazardousNeos);
        animateCounter(largestDiameterEl, largestDiameter, 2);
        animateCounter(closestDistanceEl, closestDistance / 1000, 0, 'k');
    }

    function animateCounter(element, target, decimals = 0, suffix = '') {
        const duration = 1000;
        const steps = 50;
        const increment = target / steps;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = current.toFixed(decimals) + suffix;
        }, duration / steps);
    }

    async function loadNeoTimeline() {
        // For demonstration, create a sample timeline with upcoming approaches
        // In a real application, you might call a different API endpoint
        const timelineData = [
            {
                date: '2025-06-25',
                name: '(2024 AB123)',
                distance: '0.02 AU',
                size: '150m',
                hazardous: false
            },
            {
                date: '2025-07-02',
                name: '(2023 XY789)',
                distance: '0.01 AU',
                size: '300m',
                hazardous: true
            },
            {
                date: '2025-07-15',
                name: '(2024 QR456)',
                distance: '0.05 AU',
                size: '80m',
                hazardous: false
            }
        ];

        timelineContainer.innerHTML = timelineData.map(item => `
            <div class="timeline-item">
                <div class="timeline-dot ${item.hazardous ? 'hazardous' : ''}"></div>
                <div class="timeline-content">
                    <div class="timeline-date">${formatDate(item.date)}</div>
                    <div class="timeline-name">${item.name}</div>
                    <div class="timeline-details">
                        Distance: ${item.distance} | Size: ~${item.size}
                        ${item.hazardous ? ' | ⚠️ Potentially Hazardous' : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    function updateNeoTitle(startDate, endDate) {
        if (startDate === endDate) {
            neoTitle.textContent = `NEOs for ${formatDate(startDate)}`;
        } else {
            neoTitle.textContent = `NEOs from ${formatDate(startDate)} to ${formatDate(endDate)}`;
        }
    }

    function showLoadingNeos() {
        neoContainer.innerHTML = `
            <div class="loading-neo">
                <div class="loading"></div>
                <p>Loading Near Earth Objects data...</p>
            </div>
        `;
        neoStats.style.display = 'none';
    }

    function showErrorNeos(message) {
        neoContainer.innerHTML = `
            <div class="error-neo">
                <h3>⚠️ Error</h3>
                <p>${message}</p>
                <button onclick="loadNearEarthObjects()" class="btn btn-primary">Try Again</button>
            </div>
        `;
        neoStats.style.display = 'none';
    }

    function showNoNeos(startDate, endDate) {
        const dateText = startDate === endDate ? 
            formatDate(startDate) : 
            `${formatDate(startDate)} to ${formatDate(endDate)}`;
            
        neoContainer.innerHTML = `
            <div class="no-neos">
                <h3>🌌 No NEOs Found</h3>
                <p>No Near Earth Objects were detected for ${dateText}.</p>
                <p>Try selecting a different date range.</p>
                <div style="margin-top: 20px;">
                    <button onclick="loadThisWeekNeos()" class="btn btn-secondary">Try This Week</button>
                </div>
            </div>
        `;
        neoStats.style.display = 'none';
    }

    function formatDistance(km) {
        if (km < 1000) {
            return `${km.toFixed(0)} km`;
        } else if (km < 1000000) {
            return `${(km / 1000).toFixed(0)}k km`;
        } else {
            return `${(km / 1000000).toFixed(2)}M km`;
        }
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
                case 't':
                    e.preventDefault();
                    loadTodayNeos();
                    break;
                case 'w':
                    e.preventDefault();
                    loadThisWeekNeos();
                    break;
                case 'h':
                    e.preventDefault();
                    showHazardousCheckbox.checked = !showHazardousCheckbox.checked;
                    applySortAndFilter();
                    break;
            }
        }
    });

    // Make functions globally accessible
    window.loadNearEarthObjects = loadNearEarthObjects;
    window.loadThisWeekNeos = loadThisWeekNeos;
    window.applySortAndFilter = applySortAndFilter;
});
