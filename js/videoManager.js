// Video Manager - Handles video discovery, selection, and playlist management
const VideoManager = {
    videoList: [],
    currentIndex: -1,
    playHistory: [],

    /**
     * Initialize and load videos from all configured folders
     * @returns {Promise<boolean>}
     */
    initialize: async function() {
        const config = ConfigManager.load();

        if (!config.folders || config.folders.length === 0) {
            console.warn('No folders configured');
            return false;
        }

        // Connect to all folders and gather video lists
        this.videoList = [];

        for (const folder of config.folders) {
            try {
                const connected = await SMBManager.connect(folder);
                if (connected) {
                    const videos = await SMBManager.listVideos(folder.id);

                    // Add folder reference to each video
                    const videosWithFolder = videos.map(video => ({
                        filename: video,
                        folderId: folder.id,
                        folderPath: folder.path
                    }));

                    this.videoList.push(...videosWithFolder);
                    console.log(`Loaded ${videos.length} videos from ${folder.path}`);
                }
            } catch (error) {
                console.error(`Error loading videos from folder ${folder.path}:`, error);
            }
        }

        console.log(`Total videos loaded: ${this.videoList.length}`);
        return this.videoList.length > 0;
    },

    /**
     * Get a random video that hasn't been played recently
     * @returns {Object|null}
     */
    getRandomVideo: function() {
        if (this.videoList.length === 0) {
            return null;
        }

        // If we have only one video, return it
        if (this.videoList.length === 1) {
            return this.videoList[0];
        }

        // Try to get a video that's not in recent history
        const historySize = Math.min(10, Math.floor(this.videoList.length / 2));
        const recentVideos = this.playHistory.slice(-historySize);

        let availableVideos = this.videoList.filter(video => {
            const videoId = `${video.folderId}:${video.filename}`;
            return !recentVideos.some(recent =>
                `${recent.folderId}:${recent.filename}` === videoId
            );
        });

        // If all videos are in history, use all videos
        if (availableVideos.length === 0) {
            availableVideos = this.videoList;
        }

        const randomIndex = Math.floor(Math.random() * availableVideos.length);
        const selectedVideo = availableVideos[randomIndex];

        // Add to history
        this.playHistory.push(selectedVideo);

        // Keep history size reasonable
        if (this.playHistory.length > 50) {
            this.playHistory.shift();
        }

        return selectedVideo;
    },

    /**
     * Get next video in sequence (for skip forward)
     * @returns {Object|null}
     */
    getNextVideo: function() {
        if (this.videoList.length === 0) {
            return null;
        }

        this.currentIndex = (this.currentIndex + 1) % this.videoList.length;
        const video = this.videoList[this.currentIndex];

        // Add to history
        this.playHistory.push(video);
        if (this.playHistory.length > 50) {
            this.playHistory.shift();
        }

        return video;
    },

    /**
     * Get previous video from history (for skip backward)
     * @returns {Object|null}
     */
    getPreviousVideo: function() {
        if (this.playHistory.length < 2) {
            // If no history, just get a random video
            return this.getRandomVideo();
        }

        // Remove current video from history
        this.playHistory.pop();

        // Get the previous video
        const previousVideo = this.playHistory[this.playHistory.length - 1];

        return previousVideo;
    },

    /**
     * Get video URL for playback
     * @param {Object} video
     * @returns {string}
     */
    getVideoUrl: function(video) {
        if (!video) {
            return null;
        }
        return SMBManager.getVideoUrl(video.folderId, video.filename);
    },

    /**
     * Shuffle the video list
     */
    shuffle: function() {
        for (let i = this.videoList.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.videoList[i], this.videoList[j]] = [this.videoList[j], this.videoList[i]];
        }
        this.currentIndex = -1;
    },

    /**
     * Get total number of videos
     * @returns {number}
     */
    getVideoCount: function() {
        return this.videoList.length;
    },

    /**
     * Clear all data
     */
    clear: function() {
        this.videoList = [];
        this.currentIndex = -1;
        this.playHistory = [];
    }
};
