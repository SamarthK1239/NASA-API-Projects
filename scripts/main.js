// Main JavaScript for NASA API Explorer

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Animate statistics counter
    const animateCounters = () => {
        const counters = document.querySelectorAll('.stat-number');
        
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const increment = target / 200;
            
            const updateCounter = () => {
                const current = +counter.innerText;
                if (current < target) {
                    counter.innerText = Math.ceil(current + increment);
                    setTimeout(updateCounter, 10);
                } else {
                    counter.innerText = target.toLocaleString();
                }
            };
            
            updateCounter();
        });
    };

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('stats')) {
                    animateCounters();
                }
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .stats').forEach(el => {
        observer.observe(el);
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add active class to current page in navigation
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    // Add scroll effect to navbar
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
});

// Utility functions for API calls
class NASAAPIClient {
    constructor() {
        this.baseURL = 'https://api.nasa.gov';
        // You should get your own API key from https://api.nasa.gov/
        this.apiKey = 'DEMO_KEY'; // Replace with your actual API key
    }

    async makeRequest(endpoint, params = {}) {
        const url = new URL(`${this.baseURL}${endpoint}`);
        url.searchParams.append('api_key', this.apiKey);
        
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Astronomy Picture of the Day
    async getAPOD(date = null, count = null) {
        const params = {};
        if (date) params.date = date;
        if (count) params.count = count;
        
        return this.makeRequest('/planetary/apod', params);
    }

    // Mars Rover Photos
    async getMarsRoverPhotos(rover = 'curiosity', sol = 1000, camera = null) {
        const params = { sol };
        if (camera) params.camera = camera;
        
        return this.makeRequest(`/mars-photos/api/v1/rovers/${rover}/photos`, params);
    }

    // Near Earth Objects
    async getNearEarthObjects(startDate, endDate) {
        const params = {
            start_date: startDate,
            end_date: endDate
        };
        
        return this.makeRequest('/neo/rest/v1/feed', params);
    }

    // Earth Imagery
    async getEarthImagery(lat, lon, date, dim = 0.15) {
        const params = {
            lat,
            lon,
            date,
            dim
        };
        
        return this.makeRequest('/planetary/earth/imagery', params);
    }

    // Exoplanets
    async getExoplanets(limit = 100) {
        // Note: This uses a different base URL
        const url = `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=select+pl_name,hostname,pl_orbper,pl_bmasse,pl_rade,disc_year+from+ps+where+default_flag=1+and+pl_name+is+not+null+order+by+pl_name&format=json`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.slice(0, limit);
        } catch (error) {
            console.error('Exoplanet API request failed:', error);
            throw error;
        }
    }
}

// Create global NASA API client
window.nasaAPI = new NASAAPIClient();

// Utility functions
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showLoading(container) {
    container.innerHTML = '<div class="loading"></div>';
}

function showError(container, message) {
    container.innerHTML = `
        <div class="error-message">
            <h3>⚠️ Error</h3>
            <p>${message}</p>
            <button onclick="location.reload()" class="btn btn-primary">Try Again</button>
        </div>
    `;
}

function createImageModal(imageSrc, title, description) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <img src="${imageSrc}" alt="${title}" class="modal-image">
            <div class="modal-info">
                <h3>${title}</h3>
                <p>${description}</p>
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
}

// Add CSS for modals and error messages
const additionalStyles = `
    .image-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    }
    
    .modal-content {
        max-width: 90vw;
        max-height: 90vh;
        background: var(--card-bg);
        border-radius: 20px;
        overflow: hidden;
        position: relative;
    }
    
    .close-modal {
        position: absolute;
        top: 20px;
        right: 20px;
        font-size: 30px;
        color: white;
        cursor: pointer;
        z-index: 10000;
        background: rgba(0, 0, 0, 0.5);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .modal-image {
        width: 100%;
        height: auto;
        max-height: 70vh;
        object-fit: contain;
    }
    
    .modal-info {
        padding: 20px;
        color: white;
    }
    
    .error-message {
        text-align: center;
        padding: 40px;
        background: var(--card-bg);
        border-radius: 20px;
        margin: 20px 0;
    }
    
    .error-message h3 {
        color: #ff6b6b;
        margin-bottom: 15px;
    }
    
    .error-message p {
        color: var(--text-secondary);
        margin-bottom: 20px;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
