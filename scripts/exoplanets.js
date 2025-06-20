// Exoplanets JavaScript

class ExoplanetAPI {
    constructor() {
        this.baseURL = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync';
        this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
        this.cache = new Map();
    }

    async queryExoplanets(query = '', limit = 100) {
        const cacheKey = `query_${query}_${limit}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        try {
            // NASA Exoplanet Archive TAP query
            let sql = `SELECT pl_name, pl_orbper, pl_rade, pl_masse, pl_eqt, ra, dec, sy_dist, disc_year, discoverymethod, pl_dens, pl_orbeccen, st_teff, st_rad, st_mass, pl_orbsmax
                      FROM ps 
                      WHERE default_flag = 1`;
            
            if (query) {
                sql += ` AND UPPER(pl_name) LIKE UPPER('%${query}%')`;
            }
            
            sql += ` ORDER BY disc_year DESC LIMIT ${limit}`;

            const params = new URLSearchParams({
                query: sql,
                format: 'json'
            });

            const response = await fetch(`${this.baseURL}?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const processedData = this.processExoplanetData(data);
            
            // Cache the result
            this.cache.set(cacheKey, {
                data: processedData,
                timestamp: Date.now()
            });
            
            return processedData;
            
        } catch (error) {
            console.error('Error fetching exoplanet data:', error);
            // Fallback to sample data if API fails
            return this.getSampleExoplanets();
        }
    }

    processExoplanetData(rawData) {
        return rawData.map(planet => ({
            name: planet.pl_name || 'Unknown',
            orbitalPeriod: planet.pl_orbper || null,
            radius: planet.pl_rade || null, // Earth radii
            mass: planet.pl_masse || null, // Earth masses
            temperature: planet.pl_eqt || null, // Kelvin
            ra: planet.ra || null,
            dec: planet.dec || null,
            distance: planet.sy_dist || null, // parsecs
            discoveryYear: planet.disc_year || null,
            discoveryMethod: planet.discoverymethod || 'Unknown',
            density: planet.pl_dens || null,
            eccentricity: planet.pl_orbeccen || null,
            stellarTemp: planet.st_teff || null,
            stellarRadius: planet.st_rad || null,
            stellarMass: planet.st_mass || null,
            semiMajorAxis: planet.pl_orbsmax || null,
            habitabilityScore: this.calculateHabitability(planet),
            planetType: this.classifyPlanet(planet)
        }));
    }

    calculateHabitability(planet) {
        // Simple habitability scoring based on temperature and size
        let score = 0;
        
        // Temperature score (closer to Earth's temperature = higher score)
        if (planet.pl_eqt) {
            const tempDiff = Math.abs(planet.pl_eqt - 288); // Earth's average temp in K
            if (tempDiff < 50) score += 40;
            else if (tempDiff < 100) score += 30;
            else if (tempDiff < 200) score += 20;
            else if (tempDiff < 400) score += 10;
        }
        
        // Size score (closer to Earth size = higher score)
        if (planet.pl_rade) {
            if (planet.pl_rade >= 0.5 && planet.pl_rade <= 2.0) score += 30;
            else if (planet.pl_rade >= 0.3 && planet.pl_rade <= 3.0) score += 20;
            else if (planet.pl_rade >= 0.1 && planet.pl_rade <= 5.0) score += 10;
        }
        
        // Mass score
        if (planet.pl_masse) {
            if (planet.pl_masse >= 0.1 && planet.pl_masse <= 5.0) score += 20;
            else if (planet.pl_masse >= 0.05 && planet.pl_masse <= 10.0) score += 10;
        }
        
        // Orbital zone score
        if (planet.pl_orbsmax && planet.st_teff) {
            const habitableZone = this.calculateHabitableZone(planet.st_teff);
            if (planet.pl_orbsmax >= habitableZone.inner && planet.pl_orbsmax <= habitableZone.outer) {
                score += 10;
            }
        }
        
        return Math.min(100, score);
    }

    calculateHabitableZone(stellarTemp) {
        // Simplified habitable zone calculation
        const solarTemp = 5778; // Sun's temperature
        const factor = Math.sqrt(stellarTemp / solarTemp);
        
        return {
            inner: 0.95 * factor,
            outer: 1.37 * factor
        };
    }

    classifyPlanet(planet) {
        if (!planet.pl_rade) return 'Unknown';
        
        const radius = planet.pl_rade;
        
        if (radius < 1.25) return 'Terrestrial';
        else if (radius < 2.0) return 'Super-Earth';
        else if (radius < 4.0) return 'Mini-Neptune';
        else if (radius < 10.0) return 'Neptune-like';
        else return 'Gas Giant';
    }

    getSampleExoplanets() {
        // Fallback sample data when API is unavailable
        return [
            {
                name: 'Kepler-452b',
                orbitalPeriod: 384.8,
                radius: 1.63,
                mass: null,
                temperature: 265,
                distance: 1400,
                discoveryYear: 2015,
                discoveryMethod: 'Transit',
                habitabilityScore: 85,
                planetType: 'Super-Earth'
            },
            {
                name: 'TRAPPIST-1e',
                orbitalPeriod: 6.1,
                radius: 0.92,
                mass: 0.77,
                temperature: 251,
                distance: 39.6,
                discoveryYear: 2016,
                discoveryMethod: 'Transit',
                habitabilityScore: 92,
                planetType: 'Terrestrial'
            },
            {
                name: 'Proxima Centauri b',
                orbitalPeriod: 11.2,
                radius: 1.17,
                mass: 1.27,
                temperature: 234,
                distance: 4.24,
                discoveryYear: 2016,
                discoveryMethod: 'Radial Velocity',
                habitabilityScore: 78,
                planetType: 'Terrestrial'
            }
        ];
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const exoplanetAPI = new ExoplanetAPI();
    const planetSearchInput = document.getElementById('planet-search');
    const discoveryYearSelect = document.getElementById('discovery-year');
    const loadExoplanetsBtn = document.getElementById('load-exoplanets');
    const randomPlanetsBtn = document.getElementById('random-planets');
    const habitableZoneBtn = document.getElementById('habitable-zone');
    const exoplanetContainer = document.getElementById('exoplanet-container');
    const exoplanetTitle = document.getElementById('exoplanet-title');
    const sortBySelect = document.getElementById('sort-by');
    const loadMoreBtn = document.getElementById('load-more-planets');
    const chartContainer = document.getElementById('chart-container');

    // Filter checkboxes
    const filterTerrestrial = document.getElementById('filter-terrestrial');
    const filterGasGiant = document.getElementById('filter-gas-giant');
    const filterSuperEarth = document.getElementById('filter-super-earth');

    // View controls
    const viewBtns = document.querySelectorAll('.view-btn');

    // Stats elements
    const totalPlanetsEl = document.getElementById('total-planets');
    const habitablePlanetsEl = document.getElementById('habitable-planets');
    const multiPlanetSystemsEl = document.getElementById('multi-planet-systems');
    const earthSizePlanetsEl = document.getElementById('earth-size-planets');

    let currentExoplanets = [];
    let filteredExoplanets = [];
    let displayedPlanets = 0;
    const planetsPerPage = 20;
    let currentView = 'grid';    // Event listeners
    loadExoplanetsBtn.addEventListener('click', loadExoplanets);
    randomPlanetsBtn.addEventListener('click', loadRandomPlanets);
    habitableZoneBtn.addEventListener('click', loadHabitableZonePlanets);
    sortBySelect.addEventListener('change', applySortAndFilter);
    loadMoreBtn.addEventListener('click', loadMorePlanets);

    // Filter change listeners
    [filterTerrestrial, filterGasGiant, filterSuperEarth].forEach(filter => {
        filter.addEventListener('change', applySortAndFilter);
    });

    // View controls
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentView = this.getAttribute('data-view');
            
            if (currentView === 'chart') {
                chartContainer.style.display = 'block';
                renderChart();
            } else {
                chartContainer.style.display = 'none';
                displayExoplanets(filteredExoplanets.slice(0, displayedPlanets));
            }
        });
    });

    // Search functionality
    planetSearchInput.addEventListener('input', debounce(applySortAndFilter, 300));
    discoveryYearSelect.addEventListener('change', applySortAndFilter);

    // Initialize
    loadExoplanets();
    updateStats();    async function loadExoplanets() {
        try {
            showLoadingExoplanets();
            
            // Use real NASA Exoplanet Archive API
            const searchQuery = planetSearchInput ? planetSearchInput.value : '';
            currentExoplanets = await exoplanetAPI.queryExoplanets(searchQuery, 200);
            
            applySortAndFilter();
            updateStats();
            exoplanetTitle.textContent = searchQuery ? 
                `Exoplanet Search Results for "${searchQuery}"` : 
                'NASA Exoplanet Archive';
            
        } catch (error) {
            showErrorExoplanets('Failed to load exoplanet data. Please try again.');
            console.error('Error loading exoplanets:', error);
        }
    }

    async function loadRandomPlanets() {
        try {
            showLoadingExoplanets();
            
            // Get random subset from API
            const allPlanets = await exoplanetAPI.queryExoplanets('', 500);
            const shuffled = [...allPlanets].sort(() => 0.5 - Math.random());
            currentExoplanets = shuffled.slice(0, 50);
            
            applySortAndFilter();
            exoplanetTitle.textContent = 'Random Exoplanet Selection';
            
        } catch (error) {
            showErrorExoplanets('Failed to load random exoplanets.');
            console.error('Error loading random exoplanets:', error);
        }
    }    async function loadHabitableZonePlanets() {
        try {
            showLoadingExoplanets();
            
            // Get all planets and filter for high habitability scores
            const allPlanets = await exoplanetAPI.queryExoplanets('', 1000);
            currentExoplanets = allPlanets.filter(planet => 
                planet.habitabilityScore >= 50
            ).sort((a, b) => b.habitabilityScore - a.habitabilityScore);
            
            applySortAndFilter();
            exoplanetTitle.textContent = 'Potentially Habitable Exoplanets';
            
        } catch (error) {
            showErrorExoplanets('Failed to load habitable zone exoplanets.');
            console.error('Error loading habitable exoplanets:', error);
        }
    }

    function applySortAndFilter() {
        if (!currentExoplanets.length) return;

        let planets = [...currentExoplanets];

        // Apply search filter
        const searchTerm = planetSearchInput.value.toLowerCase().trim();
        if (searchTerm) {
            planets = planets.filter(planet => 
                planet.pl_name.toLowerCase().includes(searchTerm) ||
                planet.hostname.toLowerCase().includes(searchTerm)
            );
        }

        // Apply discovery year filter
        const selectedYear = discoveryYearSelect.value;
        if (selectedYear) {
            planets = planets.filter(planet => planet.disc_year == selectedYear);
        }

        // Apply type filters
        const enabledTypes = [];
        if (filterTerrestrial.checked) enabledTypes.push('terrestrial');
        if (filterGasGiant.checked) enabledTypes.push('gas-giant');
        if (filterSuperEarth.checked) enabledTypes.push('super-earth');

        if (enabledTypes.length > 0) {
            planets = planets.filter(planet => enabledTypes.includes(planet.type));
        }

        // Apply sorting
        const sortBy = sortBySelect.value;
        planets.sort((a, b) => {
            switch (sortBy) {
                case 'discovery':
                    return (b.disc_year || 0) - (a.disc_year || 0);
                case 'distance':
                    return (a.distance || Infinity) - (b.distance || Infinity);
                case 'radius':
                    return (b.pl_rade || 0) - (a.pl_rade || 0);
                case 'mass':
                    return (b.pl_bmasse || 0) - (a.pl_bmasse || 0);
                case 'period':
                    return (a.pl_orbper || Infinity) - (b.pl_orbper || Infinity);
                default:
                    return 0;
            }
        });

        filteredExoplanets = planets;
        displayedPlanets = Math.min(planetsPerPage, filteredExoplanets.length);
        
        if (currentView === 'chart') {
            renderChart();
        } else {
            displayExoplanets(filteredExoplanets.slice(0, displayedPlanets));
        }
        
        updateLoadMoreButton();
    }

    function displayExoplanets(planets) {
        if (planets.length === 0) {
            exoplanetContainer.innerHTML = `
                <div class="no-exoplanets">
                    <h3>🔍 No Exoplanets Found</h3>
                    <p>No exoplanets match your current search and filter criteria.</p>
                    <button onclick="clearFilters()" class="btn btn-secondary">Clear Filters</button>
                </div>
            `;
            exoplanetContainer.className = 'exoplanet-container';
            return;
        }

        if (currentView === 'grid') {
            exoplanetContainer.className = 'exoplanet-container grid-view';
            exoplanetContainer.innerHTML = planets.map(planet => createExoplanetCard(planet)).join('');
        } else if (currentView === 'list') {
            exoplanetContainer.className = 'exoplanet-container list-view';
            exoplanetContainer.innerHTML = planets.map(planet => createExoplanetListItem(planet)).join('');
        }
    }

    function createExoplanetCard(planet) {
        const habitableClass = planet.habitable ? 'habitable' : '';
        const radiusText = planet.pl_rade ? `${planet.pl_rade.toFixed(2)} R⊕` : 'Unknown';
        const massText = planet.pl_bmasse ? `${planet.pl_bmasse.toFixed(2)} M⊕` : 'Unknown';
        const periodText = planet.pl_orbper ? `${planet.pl_orbper.toFixed(1)} days` : 'Unknown';
        const distanceText = planet.distance ? `${planet.distance.toFixed(1)} ly` : 'Unknown';

        return `
            <div class="exoplanet-card ${habitableClass}" onclick="showExoplanetDetails('${planet.pl_name.replace(/'/g, "\\'")}')">
                <div class="planet-header">
                    <div class="planet-icon ${planet.type}">🪐</div>
                    ${planet.habitable ? '<div class="habitable-badge">Potentially Habitable</div>' : ''}
                </div>
                <h3 class="planet-name">${planet.pl_name}</h3>
                <div class="planet-host">Host Star: ${planet.hostname}</div>
                <div class="planet-details">
                    <div class="detail-row">
                        <span class="label">Radius:</span>
                        <span class="value">${radiusText}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Mass:</span>
                        <span class="value">${massText}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Period:</span>
                        <span class="value">${periodText}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Distance:</span>
                        <span class="value">${distanceText}</span>
                    </div>
                </div>
                <div class="planet-discovery">
                    <span class="discovery-year">Discovered: ${planet.disc_year || 'Unknown'}</span>
                    <span class="planet-type">${planet.type.replace('-', ' ')}</span>
                </div>
            </div>
        `;
    }

    function createExoplanetListItem(planet) {
        const habitableClass = planet.habitable ? 'habitable' : '';
        const radiusText = planet.pl_rade ? `${planet.pl_rade.toFixed(2)} R⊕` : 'Unknown';
        const massText = planet.pl_bmasse ? `${planet.pl_bmasse.toFixed(2)} M⊕` : 'Unknown';
        const periodText = planet.pl_orbper ? `${planet.pl_orbper.toFixed(1)} days` : 'Unknown';

        return `
            <div class="exoplanet-list-item ${habitableClass}" onclick="showExoplanetDetails('${planet.pl_name.replace(/'/g, "\\'")}')">
                <div class="list-main">
                    <div class="list-names">
                        <h3 class="planet-name">${planet.pl_name}</h3>
                        <div class="planet-host">${planet.hostname}</div>
                    </div>
                    <div class="list-details">
                        <span class="detail-item">R: ${radiusText}</span>
                        <span class="detail-item">M: ${massText}</span>
                        <span class="detail-item">P: ${periodText}</span>
                        <span class="detail-item">${planet.disc_year || 'Unknown'}</span>
                    </div>
                </div>
                <div class="list-badges">
                    <span class="type-badge ${planet.type}">${planet.type.replace('-', ' ')}</span>
                    ${planet.habitable ? '<span class="habitable-badge">Habitable Zone</span>' : ''}
                </div>
            </div>
        `;
    }

    function renderChart() {
        const chartCanvas = document.getElementById('chart-canvas');
        const chartType = document.getElementById('chart-type').value;
        
        // Simple chart rendering (in a real app, you might use Chart.js or D3.js)
        chartCanvas.innerHTML = `
            <div class="chart-placeholder">
                <div class="chart-icon">📊</div>
                <h3>${getChartTitle(chartType)}</h3>
                <p>Interactive chart visualization would be rendered here using a library like Chart.js or D3.js</p>
                <div class="chart-stats">
                    <div class="stat-item">
                        <span class="stat-number">${filteredExoplanets.length}</span>
                        <span class="stat-label">Planets in Chart</span>
                    </div>
                </div>
            </div>
        `;
    }

    function getChartTitle(chartType) {
        switch (chartType) {
            case 'mass-radius':
                return 'Planet Mass vs Radius';
            case 'distance-year':
                return 'Distance vs Discovery Year';
            case 'period-radius':
                return 'Orbital Period vs Planet Radius';
            default:
                return 'Exoplanet Chart';
        }
    }

    function loadMorePlanets() {
        const nextBatch = filteredExoplanets.slice(displayedPlanets, displayedPlanets + planetsPerPage);
        const newPlanets = currentView === 'grid' 
            ? nextBatch.map(planet => createExoplanetCard(planet)).join('')
            : nextBatch.map(planet => createExoplanetListItem(planet)).join('');
        
        exoplanetContainer.innerHTML += newPlanets;
        displayedPlanets += nextBatch.length;
        updateLoadMoreButton();
    }

    function updateLoadMoreButton() {
        if (displayedPlanets >= filteredExoplanets.length || currentView === 'chart') {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    }

    function updateStats() {
        const totalPlanets = sampleExoplanets.length;
        const habitablePlanets = sampleExoplanets.filter(p => p.habitable).length;
        const multiPlanetSystems = new Set(sampleExoplanets.map(p => p.hostname)).size;
        const earthSizePlanets = sampleExoplanets.filter(p => p.pl_rade && p.pl_rade <= 1.5).length;

        animateCounter(totalPlanetsEl, totalPlanets);
        animateCounter(habitablePlanetsEl, habitablePlanets);
        animateCounter(multiPlanetSystemsEl, multiPlanetSystems);
        animateCounter(earthSizePlanetsEl, earthSizePlanets);
    }

    function animateCounter(element, target) {
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, duration / steps);
    }

    window.showExoplanetDetails = function(planetName) {
        const planet = currentExoplanets.find(p => p.pl_name === planetName);
        if (!planet) return;

        const modal = document.createElement('div');
        modal.className = 'exoplanet-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <div class="modal-header">
                    <h2>${planet.pl_name}</h2>
                    ${planet.habitable ? '<span class="habitable-badge">Potentially Habitable</span>' : ''}
                </div>
                <div class="modal-body">
                    <div class="detail-grid">
                        <div class="detail-section">
                            <h3>Planet Properties</h3>
                            <div class="detail-list">
                                <div class="detail-item">
                                    <span class="label">Radius:</span>
                                    <span class="value">${planet.pl_rade ? `${planet.pl_rade.toFixed(2)} Earth radii` : 'Unknown'}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="label">Mass:</span>
                                    <span class="value">${planet.pl_bmasse ? `${planet.pl_bmasse.toFixed(2)} Earth masses` : 'Unknown'}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="label">Type:</span>
                                    <span class="value">${planet.type.replace('-', ' ')}</span>
                                </div>
                            </div>
                        </div>
                        <div class="detail-section">
                            <h3>Orbital Properties</h3>
                            <div class="detail-list">
                                <div class="detail-item">
                                    <span class="label">Orbital Period:</span>
                                    <span class="value">${planet.pl_orbper ? `${planet.pl_orbper.toFixed(1)} days` : 'Unknown'}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="label">Host Star:</span>
                                    <span class="value">${planet.hostname}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="label">Distance:</span>
                                    <span class="value">${planet.distance ? `${planet.distance.toFixed(1)} light-years` : 'Unknown'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="discovery-info">
                        <h3>Discovery Information</h3>
                        <p>Discovered in ${planet.disc_year || 'Unknown year'}</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeModal = () => {
            document.body.removeChild(modal);
        };
        
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        document.addEventListener('keydown', function escapeHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        });
    };

    window.clearFilters = function() {
        planetSearchInput.value = '';
        discoveryYearSelect.value = '';
        filterTerrestrial.checked = true;
        filterGasGiant.checked = true;
        filterSuperEarth.checked = true;
        applySortAndFilter();
    };

    function showLoadingExoplanets() {
        exoplanetContainer.innerHTML = `
            <div class="loading-exoplanets">
                <div class="loading"></div>
                <p>Loading exoplanet data...</p>
            </div>
        `;
        loadMoreBtn.style.display = 'none';
    }

    function showErrorExoplanets(message) {
        exoplanetContainer.innerHTML = `
            <div class="error-exoplanets">
                <h3>⚠️ Error</h3>
                <p>${message}</p>
                <button onclick="loadExoplanets()" class="btn btn-primary">Try Again</button>
            </div>
        `;
        loadMoreBtn.style.display = 'none';
    }

    function generateSampleExoplanets() {
        // Generate sample exoplanet data for demonstration
        const planetNames = [
            'Kepler-452b', 'Proxima Centauri b', 'TRAPPIST-1e', 'K2-18b', 'TOI-715b',
            'HD 40307g', 'Gliese 667Cc', 'Kepler-186f', 'Wolf 1061c', 'Ross 128b',
            'LHS 1140b', 'Kepler-442b', 'Kepler-1649c', 'TOI-849b', 'WASP-96b'
        ];
        
        const hostNames = [
            'Kepler-452', 'Proxima Centauri', 'TRAPPIST-1', 'K2-18', 'TOI-715',
            'HD 40307', 'Gliese 667C', 'Kepler-186', 'Wolf 1061', 'Ross 128',
            'LHS 1140', 'Kepler-442', 'Kepler-1649', 'TOI-849', 'WASP-96'
        ];
        
        const planetTypes = ['terrestrial', 'super-earth', 'gas-giant'];
        
        return Array.from({length: 200}, (_, i) => ({
            pl_name: i < planetNames.length ? planetNames[i] : `Planet-${String(i + 1).padStart(3, '0')}`,
            hostname: i < hostNames.length ? hostNames[i] : `Star-${String(i + 1).padStart(3, '0')}`,
            pl_rade: Math.random() > 0.3 ? (0.5 + Math.random() * 4) : null,
            pl_bmasse: Math.random() > 0.4 ? (0.1 + Math.random() * 10) : null,
            pl_orbper: Math.random() > 0.2 ? (1 + Math.random() * 1000) : null,
            disc_year: 2009 + Math.floor(Math.random() * 15),
            distance: 4.2 + Math.random() * 1000,
            type: planetTypes[Math.floor(Math.random() * planetTypes.length)],
            habitable: Math.random() > 0.85
        }));
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'r':
                    e.preventDefault();
                    loadRandomPlanets();
                    break;
                case 'h':
                    e.preventDefault();
                    loadHabitableZonePlanets();
                    break;
                case 'f':
                    e.preventDefault();
                    planetSearchInput.focus();
                    break;
            }
        }
    });
});
