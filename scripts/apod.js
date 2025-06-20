// APOD (Astronomy Picture of the Day) JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const apodContainer = document.getElementById('apod-container');
    const randomGallery = document.getElementById('random-gallery');
    const loadApodBtn = document.getElementById('load-apod');
    const randomApodBtn = document.getElementById('random-apod');
    const todayApodBtn = document.getElementById('today-apod');
    const dateInput = document.getElementById('apod-date');

    // Set max date to today and default to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.max = today;
    dateInput.value = today;

    // Load today's APOD on page load
    loadTodayAPOD();

    // Event listeners
    loadApodBtn.addEventListener('click', loadSelectedDateAPOD);
    randomApodBtn.addEventListener('click', loadRandomAPODs);
    todayApodBtn.addEventListener('click', loadTodayAPOD);
    dateInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loadSelectedDateAPOD();
        }
    });

    async function loadTodayAPOD() {
        try {
            showLoadingInContainer(apodContainer);
            hideRandomGallery();
            
            const apodData = await window.nasaAPI.getAPOD();
            displayAPOD(apodData);
        } catch (error) {
            showErrorInContainer(apodContainer, 'Failed to load today\'s Astronomy Picture of the Day. Please try again.');
            console.error('Error loading today\'s APOD:', error);
        }
    }

    async function loadSelectedDateAPOD() {
        const selectedDate = dateInput.value;
        if (!selectedDate) {
            alert('Please select a date');
            return;
        }

        try {
            showLoadingInContainer(apodContainer);
            hideRandomGallery();
            
            const apodData = await window.nasaAPI.getAPOD(selectedDate);
            displayAPOD(apodData);
        } catch (error) {
            showErrorInContainer(apodContainer, `Failed to load APOD for ${selectedDate}. Please try another date.`);
            console.error('Error loading APOD for date:', selectedDate, error);
        }
    }

    async function loadRandomAPODs() {
        try {
            showLoadingInContainer(apodContainer);
            const galleryGrid = randomGallery.querySelector('.gallery-grid');
            galleryGrid.innerHTML = '<div class="loading"></div>';
            
            // Get 9 random APODs
            const randomApods = await window.nasaAPI.getAPOD(null, 9);
            
            apodContainer.innerHTML = '';
            displayRandomGallery(randomApods);
            showRandomGallery();
        } catch (error) {
            showErrorInContainer(apodContainer, 'Failed to load random images. Please try again.');
            console.error('Error loading random APODs:', error);
        }
    }

    function displayAPOD(apodData) {
        const isVideo = apodData.media_type === 'video';
        
        apodContainer.innerHTML = `
            <div class="apod-card">
                <div class="apod-image-container">
                    ${isVideo ? 
                        `<div class="video-container">
                            <iframe src="${apodData.url}" allowfullscreen></iframe>
                        </div>` :
                        `<img src="${apodData.url}" alt="${apodData.title}" class="apod-image" onclick="openImageModal('${apodData.url}', '${escapeHtml(apodData.title)}', '${escapeHtml(apodData.explanation)}')">
                        <div class="image-overlay">
                            <span class="overlay-text">Click to view full size</span>
                        </div>`
                    }
                </div>
                <div class="apod-content-text">
                    <h2 class="apod-title">${apodData.title}</h2>
                    <div class="apod-date">${formatDate(apodData.date)}</div>
                    <p class="apod-explanation">${apodData.explanation}</p>
                    <div class="apod-metadata">
                        <div class="metadata-item">
                            <span class="metadata-label">Date</span>
                            <span class="metadata-value">${formatDate(apodData.date)}</span>
                        </div>
                        <div class="metadata-item">
                            <span class="metadata-label">Media Type</span>
                            <span class="metadata-value">${apodData.media_type}</span>
                        </div>
                        ${apodData.copyright ? `
                            <div class="metadata-item">
                                <span class="metadata-label">Copyright</span>
                                <span class="metadata-value">${apodData.copyright}</span>
                            </div>
                        ` : ''}
                        ${apodData.hdurl ? `
                            <div class="metadata-item">
                                <span class="metadata-label">HD Version</span>
                                <span class="metadata-value">
                                    <a href="${apodData.hdurl}" target="_blank" style="color: var(--accent-color);">View HD Image</a>
                                </span>
                            </div>                        ` : ''}
                    </div>
                    <div class="apod-actions">
                        <button class="btn btn-primary" onclick="downloadImage('${apodData.url}', '${escapeHtml(apodData.title)}')">
                            📥 Download
                        </button>
                        <button class="btn btn-secondary" onclick="shareAPOD('${escapeHtml(apodData.title)}', '${escapeHtml(apodData.explanation)}', '${apodData.url}')">
                            🔗 Share
                        </button>
                        <button class="btn btn-secondary" onclick="copyToClipboard('${window.location.href}')">
                            📋 Copy Link
                        </button>
                        ${apodData.hdurl ? `
                            <button class="btn btn-secondary" onclick="setAsWallpaper('${apodData.hdurl}')">
                                🖼️ HD Wallpaper
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    function displayRandomGallery(apods) {
        const galleryGrid = randomGallery.querySelector('.gallery-grid');
        
        galleryGrid.innerHTML = apods.map(apod => `
            <div class="gallery-item" onclick="displayAPODFromGallery('${apod.date}')">
                <img src="${apod.url}" alt="${escapeHtml(apod.title)}" class="gallery-image" onerror="this.style.display='none'">
                <div class="gallery-content">
                    <h3 class="gallery-item-title">${apod.title}</h3>
                    <div class="gallery-item-date">${formatDate(apod.date)}</div>
                    <p class="gallery-item-excerpt">${truncateText(apod.explanation, 100)}</p>
                </div>
            </div>
        `).join('');
    }

    window.displayAPODFromGallery = async function(date) {
        try {
            showLoadingInContainer(apodContainer);
            hideRandomGallery();
            
            const apodData = await window.nasaAPI.getAPOD(date);
            displayAPOD(apodData);
            
            // Scroll to APOD
            apodContainer.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            showErrorInContainer(apodContainer, `Failed to load APOD for ${date}.`);
            console.error('Error loading APOD from gallery:', error);
        }
    };

    window.openImageModal = function(imageSrc, title, description) {
        createImageModal(imageSrc, title, description);
    };

    function showRandomGallery() {
        randomGallery.style.display = 'block';
        randomGallery.scrollIntoView({ behavior: 'smooth' });
    }

    function hideRandomGallery() {
        randomGallery.style.display = 'none';
    }

    function showLoadingInContainer(container) {
        container.innerHTML = `
            <div class="loading-apod">
                <div class="loading"></div>
                <p>Loading astronomical wonder...</p>
            </div>
        `;
    }

    function showErrorInContainer(container, message) {
        container.innerHTML = `
            <div class="error-apod">
                <h3>⚠️ Error</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="btn btn-primary">Try Again</button>
            </div>
        `;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    // Add some educational tooltips
    const infoItems = document.querySelectorAll('.info-card');
    infoItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.2}s`;
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'r':
                    e.preventDefault();
                    loadRandomAPODs();
                    break;
                case 't':
                    e.preventDefault();
                    loadTodayAPOD();
                    break;
            }
        }
    });

    // Add keyboard shortcut info
    const shortcutInfo = document.createElement('div');
    shortcutInfo.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--card-bg);
        padding: 15px;
        border-radius: 10px;
        border: 1px solid var(--border-color);
        font-size: 0.8rem;
        color: var(--text-secondary);
        z-index: 1000;
        opacity: 0.8;
    `;
    shortcutInfo.innerHTML = `
        <strong>Keyboard Shortcuts:</strong><br>
        Ctrl+R: Random Images<br>
        Ctrl+T: Today's Image
    `;
    document.body.appendChild(shortcutInfo);

    // Hide shortcut info after 5 seconds
    setTimeout(() => {
        if (shortcutInfo.parentNode) {
            shortcutInfo.style.transition = 'opacity 1s ease';
            shortcutInfo.style.opacity = '0';
            setTimeout(() => {
                if (shortcutInfo.parentNode) {
                    shortcutInfo.parentNode.removeChild(shortcutInfo);
                }
            }, 1000);
        }
    }, 5000);
});

// Social sharing and utility functions
window.shareAPOD = function(title, description, imageUrl) {
    if (navigator.share) {
        navigator.share({
            title: `NASA APOD: ${title}`,
            text: description.substring(0, 200) + '...',
            url: window.location.href
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback to Twitter sharing
        const tweetText = `Check out today's NASA Astronomy Picture of the Day: ${title} ${window.location.href}`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
        window.open(twitterUrl, '_blank');
    }
};

window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Link copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy: ', err);
        showToast('Failed to copy link');
    });
};

window.downloadImage = function(imageUrl, filename) {
    fetch(imageUrl)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showToast('Image download started!');
        })
        .catch(err => {
            console.error('Download failed:', err);
            showToast('Download failed - opening image in new tab');
            window.open(imageUrl, '_blank');
        });
};

window.setAsWallpaper = function(imageUrl) {
    if (navigator.userAgent.includes('Chrome')) {
        showToast('Right-click on the image and select "Set as wallpaper" or save and set manually');
    } else {
        showToast('Save the image and set as wallpaper through your system settings');
    }
    // Open high-res image in new tab for easy saving
    window.open(imageUrl, '_blank');
};

function showToast(message) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--card-bg);
        color: var(--text-color);
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: var(--shadow);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add CSS animations for toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
