// Video Player with Crossfade
const VideoPlayer = {
    video1: null,
    video2: null,
    activePlayer: 1,
    isTransitioning: false,
    rotationTimer: null,
    config: null,

    /**
     * Initialize the video player
     */
    initialize: function() {
        this.video1 = document.getElementById('video1');
        this.video2 = document.getElementById('video2');
        this.config = ConfigManager.load();

        // Set up video event listeners
        this.setupVideoListeners(this.video1);
        this.setupVideoListeners(this.video2);

        console.log('Video player initialized');
    },

    /**
     * Set up event listeners for a video element
     * @private
     */
    setupVideoListeners: function(video) {
        video.addEventListener('error', (e) => {
            console.error('❌ Video error event fired');
            console.error('   Video element:', video.id);
            console.error('   Video src:', video.src);
            console.error('   Error:', e);

            // Check if video element has a more specific error
            if (video.error) {
                console.error('   Error code:', video.error.code);
                console.error('   Error message:', video.error.message);
                const errorMessages = {
                    1: 'MEDIA_ERR_ABORTED - fetching aborted',
                    2: 'MEDIA_ERR_NETWORK - network error',
                    3: 'MEDIA_ERR_DECODE - decoding error',
                    4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - format not supported'
                };
                console.error('   Error description:', errorMessages[video.error.code] || 'Unknown error');
            }

            // Don't skip automatically - let's see what the error is first
            // this.skipToNext();
        });

        video.addEventListener('ended', () => {
            console.log('Video ended normally');
        });

        video.addEventListener('loadeddata', () => {
            console.log('✅ Video loaded successfully:', video.src);
        });
    },

    /**
     * Start playback with the first video
     */
    start: async function() {
        console.log('Starting video playback');
        await this.playNextVideo();
        this.scheduleNextVideo();
    },

    /**
     * Play the next random video
     */
    playNextVideo: async function() {
        if (this.isTransitioning) {
            return;
        }

        const video = VideoManager.getRandomVideo();
        if (!video) {
            console.error('No videos available');
            return;
        }

        const videoUrl = VideoManager.getVideoUrl(video);
        console.log('Playing video:', video.filename);
        console.log('Video URL:', videoUrl);

        await this.crossfadeToVideo(videoUrl, video.filename);
    },

    /**
     * Crossfade to a new video
     * @param {string} url
     * @param {string} filename
     */
    crossfadeToVideo: async function(url, filename) {
        this.isTransitioning = true;

        const nextPlayer = this.activePlayer === 1 ? this.video2 : this.video1;
        const currentPlayer = this.activePlayer === 1 ? this.video1 : this.video2;

        // Preload the next video
        nextPlayer.src = url;
        nextPlayer.load();

        // Wait for video to be ready
        await new Promise((resolve) => {
            const onCanPlay = () => {
                nextPlayer.removeEventListener('canplay', onCanPlay);
                resolve();
            };
            nextPlayer.addEventListener('canplay', onCanPlay);

            // Timeout after 10 seconds
            setTimeout(resolve, 10000);
        });

        // Start playing the next video
        try {
            await nextPlayer.play();
        } catch (error) {
            console.error('Error playing video:', error);
            this.isTransitioning = false;
            return;
        }

        // Get crossfade duration from config
        const crossfadeDuration = this.config.crossfadeDuration || 2;

        // Update transition duration dynamically
        nextPlayer.style.transition = `opacity ${crossfadeDuration}s ease-in-out`;
        currentPlayer.style.transition = `opacity ${crossfadeDuration}s ease-in-out`;

        // Start crossfade
        nextPlayer.classList.add('active');
        currentPlayer.classList.remove('active');

        // Show info
        this.showInfo(`Now Playing: ${filename}`);

        // Wait for crossfade to complete
        await this.sleep(crossfadeDuration * 1000);

        // Pause and clear the old video
        currentPlayer.pause();
        // Remove src to stop loading, but use removeAttribute to avoid error events
        currentPlayer.removeAttribute('src');
        currentPlayer.load(); // Reset the video element

        // Switch active player
        this.activePlayer = this.activePlayer === 1 ? 2 : 1;

        this.isTransitioning = false;
    },

    /**
     * Schedule the next video based on configured duration
     */
    scheduleNextVideo: function() {
        if (this.rotationTimer) {
            clearTimeout(this.rotationTimer);
        }

        const duration = (this.config.videoDuration || 300) * 1000; // Convert to ms

        this.rotationTimer = setTimeout(async () => {
            await this.playNextVideo();
            this.scheduleNextVideo();
        }, duration);
    },

    /**
     * Skip to next video
     */
    skipToNext: async function() {
        if (this.rotationTimer) {
            clearTimeout(this.rotationTimer);
        }

        const video = VideoManager.getNextVideo();
        if (!video) {
            return;
        }

        const videoUrl = VideoManager.getVideoUrl(video);
        await this.crossfadeToVideo(videoUrl, video.filename);
        this.scheduleNextVideo();
    },

    /**
     * Skip to previous video
     */
    skipToPrevious: async function() {
        if (this.rotationTimer) {
            clearTimeout(this.rotationTimer);
        }

        const video = VideoManager.getPreviousVideo();
        if (!video) {
            return;
        }

        const videoUrl = VideoManager.getVideoUrl(video);
        await this.crossfadeToVideo(videoUrl, video.filename);
        this.scheduleNextVideo();
    },

    /**
     * Stop playback
     */
    stop: function() {
        if (this.rotationTimer) {
            clearTimeout(this.rotationTimer);
            this.rotationTimer = null;
        }

        this.video1.pause();
        this.video2.pause();
        this.video1.src = '';
        this.video2.src = '';
    },

    /**
     * Show info message
     * @param {string} message
     */
    showInfo: function(message) {
        const infoElement = document.getElementById('info');
        const infoText = document.getElementById('infoText');

        infoText.textContent = message;
        infoElement.classList.remove('hidden');

        setTimeout(() => {
            infoElement.classList.add('hidden');
        }, 3000);
    },

    /**
     * Sleep utility
     * @param {number} ms
     */
    sleep: function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Reload configuration
     */
    reloadConfig: function() {
        this.config = ConfigManager.load();
    }
};
