// BOF: init.js

/**
 * Initialize the application when the DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM Content Loaded - Initializing application...');

    try {
        // Show instructions on page load
        $('#instructions').collapse('show');

        // Set up version selection handling
        initializeVersionSelection();

        // Hide the local JSON loading button by default
        const loadBtn = document.getElementById('localJsonLoadBtn');
        if (loadBtn) {
            loadBtn.style.display = 'none';
        }

        // Initialize content with appropriate data loading
        await initializeContent();

    } catch (error) {
        console.error('Error during application initialization:', error);
        showNotification('Error initializing application: ' + error.message, 'error');
    }
});

/**
 * Initialize version selection dropdown and handle changes
 */
function initializeVersionSelection() {
    const versionSelect = document.getElementById('jsonVersionSelect');
    if (!versionSelect) {
        console.error('Version selection dropdown not found');
        return;
    }

    // Only show version selector for HTTP protocol
    if (window.location.protocol !== 'file:') {
        // Load saved version preference from cookie
        const savedVersion = document.cookie
            .split('; ')
            .find(row => row.startsWith('selectedVersion='));
        
        if (savedVersion) {
            const version = savedVersion.split('=')[1];
            versionSelect.value = version;
        }

        // Handle version changes
        versionSelect.addEventListener('change', async function() {
            const selectedVersion = this.value;
            
            try {
                // Save version preference
                document.cookie = `selectedVersion=${selectedVersion}; path=/`;
                
                // Reload content with new version
                await initializeContent();
                
                showNotification(`Successfully switched to SFIA ${selectedVersion}`, 'success');
            } catch (error) {
                console.error('Error switching versions:', error);
                showNotification('Error switching versions: ' + error.message, 'error');
            }
        });
    } else {
        // Hide version selector for file:/// protocol
        versionSelect.parentElement.style.display = 'none';
    }
}

/**
 * Shows a notification to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of notification ('success', 'error', 'info')
 */
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) {
        console.error('Notification container not found');
        return;
    }

    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.role = 'alert';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    container.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 150);
    }, 5000);
}

// Initialize local JSON loading if using file:/// protocol
// This ensures the button only appears and functions with file:/// URLs
if (window.location.protocol === 'file:') {
    document.addEventListener('DOMContentLoaded', function() {
        const loadBtn = document.getElementById('localJsonLoadBtn');
        if (loadBtn) {
            loadBtn.style.display = 'inline-block';
        }
    });
}

// EOF: init.js
