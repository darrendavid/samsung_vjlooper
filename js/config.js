// Configuration Manager
const ConfigManager = {
    CONFIG_KEY: 'videoLooperConfig',

    defaultConfig: {
        videoDuration: 300, // seconds
        crossfadeDuration: 2, // seconds
        folders: []
    },

    load: function() {
        try {
            const stored = localStorage.getItem(this.CONFIG_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Error loading config:', e);
        }
        return { ...this.defaultConfig };
    },

    save: function(config) {
        try {
            localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
            return true;
        } catch (e) {
            console.error('Error saving config:', e);
            return false;
        }
    },

    addFolder: function(folder) {
        const config = this.load();
        config.folders.push({
            id: Date.now().toString(),
            path: folder.path,
            username: folder.username,
            password: folder.password
        });
        return this.save(config);
    },

    removeFolder: function(folderId) {
        const config = this.load();
        config.folders = config.folders.filter(f => f.id !== folderId);
        return this.save(config);
    },

    updateSettings: function(settings) {
        const config = this.load();
        config.videoDuration = settings.videoDuration;
        config.crossfadeDuration = settings.crossfadeDuration;
        return this.save(config);
    }
};
