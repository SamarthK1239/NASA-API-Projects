// Space Weather Page JavaScript
class SpaceWeatherAPI {
    constructor() {
        this.baseURL = 'https://api.nasa.gov/DONKI';
        this.apiKey = 'DEMO_KEY'; // Replace with your NASA API key
        this.refreshInterval = null;
        this.lastUpdate = null;
    }

    async fetchSolarFlares(startDate, endDate) {
        try {
            const url = `${this.baseURL}/FLR?startDate=${startDate}&endDate=${endDate}&api_key=${this.apiKey}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch solar flares');
            return await response.json();
        } catch (error) {
            console.error('Error fetching solar flares:', error);
            return this.getMockSolarFlares();
        }
    }

    async fetchCoronalMassEjections(startDate, endDate) {
        try {
            const url = `${this.baseURL}/CME?startDate=${startDate}&endDate=${endDate}&api_key=${this.apiKey}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch CMEs');
            return await response.json();
        } catch (error) {
            console.error('Error fetching CMEs:', error);
            return this.getMockCMEs();
        }
    }

    async fetchGeomagneticStorms(startDate, endDate) {
        try {
            const url = `${this.baseURL}/GST?startDate=${startDate}&endDate=${endDate}&api_key=${this.apiKey}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch geomagnetic storms');
            return await response.json();
        } catch (error) {
            console.error('Error fetching geomagnetic storms:', error);
            return this.getMockGeomagneticStorms();
        }
    }

    async fetchRadiationBeltEnhancements(startDate, endDate) {
        try {
            const url = `${this.baseURL}/RBE?startDate=${startDate}&endDate=${endDate}&api_key=${this.apiKey}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch radiation belt enhancements');
            return await response.json();
        } catch (error) {
            console.error('Error fetching radiation belt enhancements:', error);
            return this.getMockRadiationBelt();
        }
    }

    // Mock data for demonstration when API is unavailable
    getMockSolarFlares() {
        return [
            {
                flrID: 'FLR-001',
                beginTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                peakTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                classType: 'M2.5',
                sourceLocation: 'S20W30',
                activeRegionNum: 3234
            },
            {
                flrID: 'FLR-002',
                beginTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                peakTime: new Date(Date.now() - 5.5 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                classType: 'C9.1',
                sourceLocation: 'N15E45',
                activeRegionNum: 3235
            }
        ];
    }

    getMockCMEs() {
        return [
            {
                cmeID: 'CME-001',
                startTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                sourceLocation: 'S20W30',
                note: 'Earth-directed CME with moderate speed',
                cmeAnalyses: [{
                    speed: 650,
                    type: 'C',
                    isMostAccurate: true,
                    levelOfData: 1,
                    measurementTechnique: 'STEREO A COR2 + SOHO LASCO C3'
                }]
            }
        ];
    }

    getMockGeomagneticStorms() {
        return [
            {
                gstID: 'GST-001',
                startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                allKpIndex: [
                    { observedTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), kpIndex: 5.33 },
                    { observedTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), kpIndex: 6.0 },
                    { observedTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), kpIndex: 4.67 }
                ]
            }
        ];
    }

    getMockRadiationBelt() {
        return [
            {
                rbeID: 'RBE-001',
                eventTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                instruments: [
                    { displayName: 'GOES-16 SGPS' }
                ]
            }
        ];
    }

    getCurrentSolarWindData() {
        // Mock current solar wind data
        return {
            speed: 420 + Math.random() * 200,
            density: 5 + Math.random() * 10,
            temperature: 100000 + Math.random() * 100000,
            bz: -5 + Math.random() * 10,
            kpIndex: Math.random() * 9,
            solarRadiation: Math.random() * 1000
        };
    }

    getSatelliteData() {
        return [
            {
                name: 'GOES-16',
                status: 'operational',
                orbit: 'Geostationary',
                instruments: 'SUVI, EXIS, SGPS',
                uptime: '99.8%',
                dataQuality: 'Excellent'
            },
            {
                name: 'SOHO',
                status: 'operational',
                orbit: 'L1 Lagrange Point',
                instruments: 'LASCO, EIT, MDI',
                uptime: '98.5%',
                dataQuality: 'Good'
            },
            {
                name: 'STEREO-A',
                status: 'operational',
                orbit: 'Heliocentric',
                instruments: 'SECCHI, IMPACT',
                uptime: '97.2%',
                dataQuality: 'Good'
            },
            {
                name: 'ACE',
                status: 'warning',
                orbit: 'L1 Lagrange Point',
                instruments: 'SWEPAM, MAG, SIS',
                uptime: '94.1%',
                dataQuality: 'Fair'
            }
        ];
    }
}

class SpaceWeatherDashboard {
    constructor() {
        this.api = new SpaceWeatherAPI();
        this.autoRefresh = false;
        this.refreshIntervalId = null;
        this.init();
    }

    async init() {
        this.showLoading();
        await this.loadAllData();
        this.setupEventListeners();
        this.hideLoading();
        this.startAutoRefresh();
    }

    async loadAllData() {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        try {
            const [flares, cmes, storms, radiation] = await Promise.all([
                this.api.fetchSolarFlares(startDate, endDate),
                this.api.fetchCoronalMassEjections(startDate, endDate),
                this.api.fetchGeomagneticStorms(startDate, endDate),
                this.api.fetchRadiationBeltEnhancements(startDate, endDate)
            ]);

            this.renderStatusOverview(flares, cmes, storms);
            this.renderCurrentConditions();
            this.renderSolarActivity(flares);
            this.renderAuroraForecast(storms);
            this.renderSatelliteTracking();
            this.renderAlerts(flares, cmes, storms);
            this.updateLastRefreshTime();

        } catch (error) {
            console.error('Error loading space weather data:', error);
            this.showError('Failed to load space weather data');
        }
    }

    renderStatusOverview(flares, cmes, storms) {
        const statusContainer = document.getElementById('status-overview');
        if (!statusContainer) return;

        // Calculate current threat levels
        const solarFlareLevel = this.calculateSolarFlareLevel(flares);
        const radiationLevel = this.calculateRadiationLevel();
        const geomagneticLevel = this.calculateGeomagneticLevel(storms);
        const auroraLevel = this.calculateAuroraLevel(storms);

        const statusCards = [
            {
                title: 'Solar Flares',
                level: solarFlareLevel.level,
                description: solarFlareLevel.description,
                icon: '☀️',
                class: solarFlareLevel.class
            },
            {
                title: 'Radiation Storms',
                level: radiationLevel.level,
                description: radiationLevel.description,
                icon: '☢️',
                class: radiationLevel.class
            },
            {
                title: 'Geomagnetic Storms',
                level: geomagneticLevel.level,
                description: geomagneticLevel.description,
                icon: '🌍',
                class: geomagneticLevel.class
            },
            {
                title: 'Aurora Activity',
                level: auroraLevel.level,
                description: auroraLevel.description,
                icon: '🌌',
                class: auroraLevel.class
            }
        ];

        statusContainer.innerHTML = statusCards.map(card => `
            <div class="status-card ${card.class}">
                <span class="status-icon">${card.icon}</span>
                <h3 class="status-title">${card.title}</h3>
                <div class="status-level">${card.level}</div>
                <p class="status-description">${card.description}</p>
            </div>
        `).join('');
    }

    renderCurrentConditions() {
        const conditionsContainer = document.getElementById('current-conditions');
        if (!conditionsContainer) return;

        const solarWind = this.api.getCurrentSolarWindData();

        const conditions = [
            { label: 'Solar Wind Speed', value: Math.round(solarWind.speed), unit: 'km/s' },
            { label: 'Proton Density', value: solarWind.density.toFixed(1), unit: 'p/cm³' },
            { label: 'Temperature', value: Math.round(solarWind.temperature / 1000), unit: 'K (×1000)' },
            { label: 'Magnetic Field Bz', value: solarWind.bz.toFixed(1), unit: 'nT' },
            { label: 'Kp Index', value: solarWind.kpIndex.toFixed(1), unit: '' },
            { label: 'Solar Radiation', value: Math.round(solarWind.solarRadiation), unit: 'pfu' }
        ];

        const conditionsGrid = conditionsContainer.querySelector('.conditions-grid');
        if (conditionsGrid) {
            conditionsGrid.innerHTML = conditions.map(condition => `
                <div class="condition-item">
                    <span class="condition-value">${condition.value}</span>
                    <div class="condition-label">${condition.label}</div>
                    <div class="condition-unit">${condition.unit}</div>
                </div>
            `).join('');
        }
    }

    renderSolarActivity(flares) {
        const activityContainer = document.getElementById('solar-activity');
        if (!activityContainer) return;

        // Create charts for solar activity (placeholder)
        const charts = [
            {
                title: '🔥 Solar Flare Activity',
                id: 'flare-chart',
                description: `${flares.length} flares detected in the last 7 days`
            },
            {
                title: '💨 Solar Wind Speed',
                id: 'wind-chart',
                description: 'Real-time solar wind measurements'
            }
        ];

        activityContainer.innerHTML = charts.map(chart => `
            <div class="activity-card">
                <h3>${chart.title}</h3>
                <div class="activity-chart" id="${chart.id}">
                    Chart placeholder - ${chart.description}
                </div>
                <div class="chart-controls">
                    <button class="btn btn-secondary">24 Hours</button>
                    <button class="btn btn-secondary">7 Days</button>
                    <button class="btn btn-primary">30 Days</button>
                </div>
            </div>
        `).join('');
    }

    renderAuroraForecast(storms) {
        const auroraContainer = document.getElementById('aurora-forecast');
        if (!auroraContainer) return;

        const kpIndex = storms.length > 0 && storms[0].allKpIndex ? 
            storms[0].allKpIndex[storms[0].allKpIndex.length - 1].kpIndex : 3;

        const visibility = this.getAuroraVisibility(kpIndex);

        const mapContainer = auroraContainer.querySelector('.aurora-map');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div style="text-align: center;">
                    <h4 style="margin-bottom: 1rem;">Aurora Visibility Forecast</h4>
                    <p>Current Kp Index: ${kpIndex.toFixed(1)}</p>
                    <p>${visibility}</p>
                </div>
            `;
        }
    }

    renderSatelliteTracking() {
        const satelliteContainer = document.getElementById('satellites-tracking');
        if (!satelliteContainer) return;

        const satellites = this.api.getSatelliteData();

        const satelliteList = satelliteContainer.querySelector('.satellite-list');
        if (satelliteList) {
            satelliteList.innerHTML = satellites.map(satellite => `
                <div class="satellite-item">
                    <div class="satellite-info">
                        <div class="satellite-status ${satellite.status}"></div>
                        <div>
                            <div class="satellite-name">${satellite.name}</div>
                            <div class="satellite-details">${satellite.orbit} • ${satellite.instruments}</div>
                        </div>
                    </div>
                    <div class="satellite-metrics">
                        <div class="metric">
                            <span class="metric-value">${satellite.uptime}</span>
                            <span class="metric-label">Uptime</span>
                        </div>
                        <div class="metric">
                            <span class="metric-value">${satellite.dataQuality}</span>
                            <span class="metric-label">Data Quality</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    renderAlerts(flares, cmes, storms) {
        const alertsContainer = document.getElementById('alerts-section');
        if (!alertsContainer) return;

        const alerts = [];

        // Generate alerts from recent events
        flares.forEach(flare => {
            if (flare.classType && (flare.classType.startsWith('M') || flare.classType.startsWith('X'))) {
                alerts.push({
                    title: `Solar Flare ${flare.classType}`,
                    description: `Solar flare detected at ${flare.sourceLocation || 'unknown location'}`,
                    time: new Date(flare.peakTime).toLocaleString(),
                    severity: flare.classType.startsWith('X') ? 'extreme' : 'high'
                });
            }
        });

        cmes.forEach(cme => {
            const speed = cme.cmeAnalyses && cme.cmeAnalyses[0] ? cme.cmeAnalyses[0].speed : 0;
            if (speed > 500) {
                alerts.push({
                    title: 'Coronal Mass Ejection',
                    description: `Fast CME detected with speed ${speed} km/s`,
                    time: new Date(cme.startTime).toLocaleString(),
                    severity: speed > 1000 ? 'extreme' : 'high'
                });
            }
        });

        storms.forEach(storm => {
            const maxKp = Math.max(...(storm.allKpIndex || []).map(kp => kp.kpIndex));
            if (maxKp >= 5) {
                alerts.push({
                    title: 'Geomagnetic Storm',
                    description: `Strong geomagnetic activity with Kp index ${maxKp.toFixed(1)}`,
                    time: new Date(storm.startTime).toLocaleString(),
                    severity: maxKp >= 7 ? 'extreme' : 'high'
                });
            }
        });

        if (alerts.length === 0) {
            alerts.push({
                title: 'All Clear',
                description: 'No significant space weather events detected',
                time: new Date().toLocaleString(),
                severity: 'low'
            });
        }

        const alertsList = alertsContainer.querySelector('.alerts-list') || 
            (() => {
                const list = document.createElement('div');
                list.className = 'alerts-list';
                alertsContainer.appendChild(list);
                return list;
            })();

        alertsList.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.severity}">
                <div class="alert-header">
                    <span class="alert-title">${alert.title}</span>
                    <span class="alert-time">${alert.time}</span>
                </div>
                <div class="alert-description">${alert.description}</div>
            </div>
        `).join('');
    }

    calculateSolarFlareLevel(flares) {
        const recentFlares = flares.filter(flare => 
            new Date(flare.peakTime) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );

        const hasXClass = recentFlares.some(flare => flare.classType?.startsWith('X'));
        const hasMClass = recentFlares.some(flare => flare.classType?.startsWith('M'));

        if (hasXClass) {
            return { level: 'EXTREME', description: 'X-class flares detected', class: 'extreme' };
        } else if (hasMClass) {
            return { level: 'HIGH', description: 'M-class flares detected', class: 'high' };
        } else if (recentFlares.length > 0) {
            return { level: 'MODERATE', description: 'Minor flare activity', class: 'moderate' };
        } else {
            return { level: 'LOW', description: 'Quiet solar conditions', class: 'low' };
        }
    }

    calculateRadiationLevel() {
        const level = Math.random();
        if (level > 0.8) {
            return { level: 'HIGH', description: 'Elevated radiation levels', class: 'high' };
        } else if (level > 0.5) {
            return { level: 'MODERATE', description: 'Moderate radiation', class: 'moderate' };
        } else {
            return { level: 'LOW', description: 'Normal radiation levels', class: 'low' };
        }
    }

    calculateGeomagneticLevel(storms) {
        const recentStorms = storms.filter(storm => 
            new Date(storm.startTime) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );

        if (recentStorms.length === 0) {
            return { level: 'LOW', description: 'Quiet geomagnetic field', class: 'low' };
        }

        const maxKp = Math.max(...recentStorms.flatMap(storm => 
            (storm.allKpIndex || []).map(kp => kp.kpIndex)
        ));

        if (maxKp >= 8) {
            return { level: 'EXTREME', description: 'Severe geomagnetic storm', class: 'extreme' };
        } else if (maxKp >= 6) {
            return { level: 'HIGH', description: 'Strong geomagnetic storm', class: 'high' };
        } else if (maxKp >= 4) {
            return { level: 'MODERATE', description: 'Minor geomagnetic storm', class: 'moderate' };
        } else {
            return { level: 'LOW', description: 'Quiet to unsettled', class: 'low' };
        }
    }

    calculateAuroraLevel(storms) {
        const geoLevel = this.calculateGeomagneticLevel(storms);
        return {
            level: geoLevel.level,
            description: geoLevel.level === 'LOW' ? 'Aurora visible at high latitudes' : 
                        geoLevel.level === 'MODERATE' ? 'Aurora may be visible at mid latitudes' :
                        'Aurora likely visible at lower latitudes',
            class: geoLevel.class
        };
    }

    getAuroraVisibility(kpIndex) {
        if (kpIndex >= 7) {
            return 'Aurora may be visible as far south as northern US states';
        } else if (kpIndex >= 5) {
            return 'Aurora visible in northern regions and some mid-latitude areas';
        } else if (kpIndex >= 3) {
            return 'Aurora visible in polar regions';
        } else {
            return 'Limited aurora activity, visible only in far northern regions';
        }
    }

    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadAllData());
        }

        // Auto-refresh toggle
        const autoRefreshCheckbox = document.getElementById('auto-refresh');
        if (autoRefreshCheckbox) {
            autoRefreshCheckbox.addEventListener('change', (e) => {
                this.autoRefresh = e.target.checked;
                if (this.autoRefresh) {
                    this.startAutoRefresh();
                } else {
                    this.stopAutoRefresh();
                }
            });
        }
    }

    startAutoRefresh() {
        this.stopAutoRefresh();
        this.refreshIntervalId = setInterval(() => {
            this.loadAllData();
        }, 5 * 60 * 1000); // Refresh every 5 minutes
    }

    stopAutoRefresh() {
        if (this.refreshIntervalId) {
            clearInterval(this.refreshIntervalId);
            this.refreshIntervalId = null;
        }
    }

    updateLastRefreshTime() {
        this.lastUpdate = new Date();
        const timeElement = document.getElementById('last-update-time');
        if (timeElement) {
            timeElement.textContent = this.lastUpdate.toLocaleTimeString();
        }
    }

    showLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('hidden');
        }
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    }

    showError(message) {
        console.error(message);
        // Could implement a toast notification or error display here
    }
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SpaceWeatherDashboard();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'r':
                e.preventDefault();
                document.getElementById('refresh-btn')?.click();
                break;
        }
    }
});
