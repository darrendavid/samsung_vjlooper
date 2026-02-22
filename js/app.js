// Main Application
const App = {
    initialized: false,
    settingsMode: false,

    /**
     * Initialize the application
     */
    init: function() {
        console.log('Initializing Video Looper app');

        // Register key event listener for TV remote
        this.registerKeys();

        // Check if we have configuration
        const config = ConfigManager.load();

        if (!config.folders || config.folders.length === 0) {
            console.log('No folders configured - showing settings');
            console.log('💡 TIP: Click "Add Folder", enter any path (e.g., //test/videos), then click "Save & Start"');
            // Show settings screen for first-time setup
            this.showSettings();
        } else {
            console.log('Configuration found, starting app...');
            // Start loading videos
            this.startApp();
        }

        this.initialized = true;
    },

    /**
     * Register Samsung TV remote control keys
     */
    registerKeys: function() {
        try {
            // Register keys for Samsung Tizen TV
            if (typeof tizen !== 'undefined') {
                const supportedKeys = [
                    'MediaPlay',
                    'MediaPause',
                    'MediaStop',
                    'MediaRewind',
                    'MediaFastForward',
                    'ArrowLeft',
                    'ArrowRight',
                    'ArrowUp',
                    'ArrowDown',
                    'Enter',
                    'Return'
                ];

                supportedKeys.forEach(key => {
                    try {
                        tizen.tvinputdevice.registerKey(key);
                    } catch (e) {
                        console.warn(`Could not register key: ${key}`);
                    }
                });
            }
        } catch (error) {
            console.error('Error registering keys:', error);
        }

        // Add key event listener
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
    },

    /**
     * Handle remote control key presses
     */
    handleKeyPress: function(event) {
        console.log('Key pressed:', event.keyCode, event.key);

        // If in settings mode, handle differently
        if (this.settingsMode) {
            this.handleSettingsKeyPress(event);
            return;
        }

        switch (event.keyCode) {
            case 37: // Left arrow
            case 412: // MediaRewind
                event.preventDefault();
                VideoPlayer.skipToPrevious();
                break;

            case 39: // Right arrow
            case 417: // MediaFastForward
                event.preventDefault();
                VideoPlayer.skipToNext();
                break;

            case 415: // MediaPlay
                event.preventDefault();
                // Could add pause/resume functionality
                break;

            case 10009: // Return/Back button
            case 27: // Escape
                event.preventDefault();
                this.showSettings();
                break;

            case 13: // Enter
                event.preventDefault();
                // Could toggle info display
                break;
        }
    },

    /**
     * Handle key presses in settings mode
     */
    handleSettingsKeyPress: function(event) {
        if (event.keyCode === 10009 || event.keyCode === 27) {
            // Return/Back button - exit settings
            event.preventDefault();
            this.hideSettings();
        }
    },

    /**
     * Start the main application
     */
    startApp: async function() {
        this.showLoading('Loading videos...');

        try {
            console.log('Starting app initialization...');

            // Initialize video manager and load videos with timeout
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout loading videos - check browser console for details')), 10000)
            );

            const success = await Promise.race([
                VideoManager.initialize(),
                timeoutPromise
            ]);

            console.log('Video manager initialized:', success);

            if (!success) {
                this.hideLoading();
                alert('No videos found. Please check your configuration.');
                this.showSettings();
                return;
            }

            this.hideLoading();

            // Initialize and start video player
            VideoPlayer.initialize();
            await VideoPlayer.start();

            console.log(`Started playback with ${VideoManager.getVideoCount()} videos`);
        } catch (error) {
            console.error('Error starting app:', error);
            this.hideLoading();
            alert('Error loading videos: ' + error.message + '\n\nCheck browser console for details.');
            this.showSettings();
        }
    },

    /**
     * Show settings screen
     */
    showSettings: function() {
        this.settingsMode = true;

        // Stop video playback
        if (VideoPlayer.video1) {
            VideoPlayer.stop();
        }

        const settingsScreen = document.getElementById('settings');
        settingsScreen.classList.remove('hidden');

        // Load current configuration
        this.loadSettingsUI();

        // Set up event listeners
        this.setupSettingsListeners();
    },

    /**
     * Hide settings screen
     */
    hideSettings: function() {
        this.settingsMode = false;
        const settingsScreen = document.getElementById('settings');
        settingsScreen.classList.add('hidden');

        // Restart playback if we have videos
        if (VideoManager.getVideoCount() > 0) {
            VideoPlayer.reloadConfig();
            VideoPlayer.start();
        }
    },

    /**
     * Load settings into UI
     */
    loadSettingsUI: function() {
        const config = ConfigManager.load();
        const bridgeUrl = localStorage.getItem('bridgeServerUrl') || 'http://localhost:3000';

        document.getElementById('bridgeServerUrl').value = bridgeUrl;
        document.getElementById('videoDuration').value = config.videoDuration;
        document.getElementById('crossfadeDuration').value = config.crossfadeDuration;
    },

    /**
     * Set up settings screen event listeners
     */
    setupSettingsListeners: function() {
        // Save settings button
        document.getElementById('saveSettings').onclick = () => {
            this.saveSettings();
        };
    },

    /**
     * Save settings and start app
     */
    saveSettings: function() {
        const bridgeUrl = document.getElementById('bridgeServerUrl').value.trim();
        const videoDuration = parseInt(document.getElementById('videoDuration').value);
        const crossfadeDuration = parseInt(document.getElementById('crossfadeDuration').value);

        if (!bridgeUrl) {
            alert('Please enter a bridge server URL');
            return;
        }

        if (videoDuration < 10 || videoDuration > 3600) {
            alert('Video duration must be between 10 and 3600 seconds');
            return;
        }

        if (crossfadeDuration < 1 || crossfadeDuration > 10) {
            alert('Crossfade duration must be between 1 and 10 seconds');
            return;
        }

        // Save bridge server URL
        localStorage.setItem('bridgeServerUrl', bridgeUrl);

        // Save other settings
        ConfigManager.updateSettings({
            videoDuration: videoDuration,
            crossfadeDuration: crossfadeDuration
        });

        this.hideSettings();
        this.startApp();
    },

    /**
     * Show loading overlay
     */
    showLoading: function(message) {
        const loading = document.getElementById('loading');
        loading.querySelector('p').textContent = message || 'Loading...';
        loading.classList.remove('hidden');
    },

    /**
     * Hide loading overlay
     */
    hideLoading: function() {
        const loading = document.getElementById('loading');
        loading.classList.add('hidden');
    }
};

// Start the app when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Handle app visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // App went to background
        console.log('App hidden');
    } else {
        // App came to foreground
        console.log('App visible');
    }
});

// Handle Tizen app lifecycle
if (typeof tizen !== 'undefined') {
    try {
        tizen.application.getCurrentApplication().addEventListener('lowMemory', () => {
            console.warn('Low memory warning');
        });
    } catch (e) {
        console.warn('Could not register app lifecycle events');
    }
}
