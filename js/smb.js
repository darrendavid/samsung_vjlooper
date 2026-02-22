// Video Server Manager
// Connects to a bridge server that serves videos from a mounted directory

const SMBManager = {
    /**
     * Connect to video server
     * @returns {Promise<boolean>}
     */
    connect: async function() {
        try {
            const bridgeUrl = this.getBridgeServerUrl();
            console.log('Connecting to video server:', bridgeUrl);

            // Test connection with health check
            const response = await fetch(`${bridgeUrl}/health`);
            if (!response.ok) {
                throw new Error('Bridge server health check failed');
            }

            const health = await response.json();
            console.log('Bridge server health:', health);

            return true;
        } catch (error) {
            console.error('Error connecting to video server:', error);
            return false;
        }
    },

    /**
     * List all video files from the server
     * @returns {Promise<Array>}
     */
    listVideos: async function() {
        try {
            const bridgeUrl = this.getBridgeServerUrl();
            console.log('Fetching video list from:', bridgeUrl);

            const response = await fetch(`${bridgeUrl}/list`);

            console.log('Bridge response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Retrieved video list:', data);
                return data.files.filter(file => this.isVideoFile(file));
            }

            console.warn('Bridge server returned non-OK status:', response.status);
            return [];
        } catch (error) {
            console.error('Error listing videos:', error);
            return [];
        }
    },

    /**
     * Get video URL for playback
     * @param {string} filename - relative path from video directory
     * @returns {string}
     */
    getVideoUrl: function(filename) {
        const bridgeUrl = this.getBridgeServerUrl();
        const encodedFile = encodeURIComponent(filename);
        return `${bridgeUrl}/stream?file=${encodedFile}`;
    },

    /**
     * Get bridge server URL from localStorage or use default
     * @private
     */
    getBridgeServerUrl: function() {
        // This should be configurable
        return localStorage.getItem('bridgeServerUrl') || 'http://localhost:3000';
    },

    /**
     * Check if file is a video (kept for backward compatibility, server already filters)
     * @private
     */
    isVideoFile: function(filename) {
        const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v'];
        const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        return videoExtensions.includes(ext);
    }
};
