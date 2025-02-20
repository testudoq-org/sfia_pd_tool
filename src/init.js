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

    // Show version selector for HTTP/HTTPS protocol
    if (window.location.protocol !== 'file:') {
        // Load saved version preference from cookie, default to v8 if none found
        const savedVersion = document.cookie
            .split('; ')
            .find(row => row.startsWith('selectedVersion='));
        
        if (savedVersion) {
            const version = savedVersion.split('=')[1];
            versionSelect.value = version;
        } else {
            // Set v8 as default if no cookie exists
            versionSelect.value = 'json_source_v8';
            document.cookie = 'selectedVersion=json_source_v8; path=/';
        }

        // Show version selector
        versionSelect.parentElement.style.display = 'flex';
    } else {
        // Hide version selector for file:/// protocol
        versionSelect.parentElement.style.display = 'none';
    }

    // Handle version changes
    versionSelect.addEventListener('change', async function() {
        const selectedVersion = this.value;
        
        try {
            // Save version preference
            document.cookie = `selectedVersion=${selectedVersion}; path=/`;
            
            // Reload content with new version
            await initializeContent();
            
            showNotification(`Successfully switched to SFIA ${selectedVersion.replace('json_source_v', '')}`, 'success');
        } catch (error) {
            console.error('Error switching versions:', error);
            showNotification('Error switching versions: ' + error.message, 'error');
        }
    });
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

// Initialize local JSON loading
document.addEventListener('DOMContentLoaded', function() {
    const loadBtn = document.getElementById('localJsonLoadBtn');
    if (loadBtn) {
        // Only show button for file:/// protocol
        loadBtn.style.display = window.location.protocol === 'file:' ? 'inline-block' : 'none';
    }
});

// EOF: init.js
