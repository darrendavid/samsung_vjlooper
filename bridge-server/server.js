const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const VIDEO_DIR = process.env.VIDEO_DIR || '/videos';

// Enable CORS for all origins (Samsung TV and local testing)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Range'],
    exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length'],
    credentials: false
}));

console.log(`Video directory: ${VIDEO_DIR}`);

/**
 * Check if file is a video
 */
function isVideoFile(filename) {
    const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v'];
    const ext = path.extname(filename).toLowerCase();
    return videoExtensions.includes(ext);
}

/**
 * Get all video files from directory recursively
 */
function getVideoFiles(dir) {
    let results = [];

    try {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                // Recursively search subdirectories
                results = results.concat(getVideoFiles(filePath));
            } else if (isVideoFile(file)) {
                // Store relative path from VIDEO_DIR
                const relativePath = path.relative(VIDEO_DIR, filePath);
                results.push(relativePath);
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${dir}:`, error.message);
    }

    return results;
}

/**
 * List all video files
 * GET /list
 */
app.get('/list', (req, res) => {
    try {
        console.log(`Listing videos from: ${VIDEO_DIR}`);

        if (!fs.existsSync(VIDEO_DIR)) {
            return res.status(500).json({
                error: 'Video directory not found',
                path: VIDEO_DIR
            });
        }

        const videoFiles = getVideoFiles(VIDEO_DIR);

        console.log(`Found ${videoFiles.length} video files`);

        res.json({ files: videoFiles });

    } catch (error) {
        console.error('Error listing videos:', error);
        res.status(500).json({
            error: 'Failed to list videos',
            details: error.message
        });
    }
});

/**
 * Stream video endpoint
 * GET /stream?file=path/to/video.mp4
 */
app.get('/stream', (req, res) => {
    try {
        const { file } = req.query;

        if (!file) {
            return res.status(400).json({ error: 'File parameter is required' });
        }

        // Construct absolute path (file is relative to VIDEO_DIR)
        const filePath = path.join(VIDEO_DIR, file);

        console.log(`Streaming: ${file}`);
        console.log(`  Full path: ${filePath}`);

        // Security: ensure the path doesn't escape VIDEO_DIR
        const normalizedPath = path.normalize(filePath);
        if (!normalizedPath.startsWith(VIDEO_DIR)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        const stat = fs.statSync(filePath);
        const fileSize = stat.size;

        // Handle range requests for video seeking
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = (end - start) + 1;

            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': 'video/mp4'
            });

            const stream = fs.createReadStream(filePath, { start, end });
            stream.pipe(res);

            stream.on('error', (err) => {
                console.error('Stream error:', err);
                if (!res.headersSent) {
                    res.status(500).end();
                }
            });

        } else {
            // No range, send entire file
            res.writeHead(200, {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
                'Accept-Ranges': 'bytes'
            });

            const stream = fs.createReadStream(filePath);
            stream.pipe(res);

            stream.on('error', (err) => {
                console.error('Stream error:', err);
                if (!res.headersSent) {
                    res.status(500).end();
                }
            });
        }

    } catch (error) {
        console.error('Error streaming video:', error);
        if (!res.headersSent) {
            res.status(500).json({
                error: 'Failed to stream video',
                details: error.message
            });
        }
    }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    const dirExists = fs.existsSync(VIDEO_DIR);
    res.json({
        status: 'ok',
        videoDir: VIDEO_DIR,
        dirExists: dirExists,
        timestamp: new Date().toISOString()
    });
});

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
    res.json({
        name: 'Video Looper Bridge Server',
        version: '2.0.0',
        description: 'Serves video files from a mounted directory',
        videoDir: VIDEO_DIR,
        endpoints: {
            list: '/list - Get all video files',
            stream: '/stream?file=path/to/video.mp4 - Stream a video file',
            health: '/health - Health check'
        }
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`=`.repeat(60));
    console.log(`Video Looper Bridge Server v2.0`);
    console.log(`=`.repeat(60));
    console.log(`Port: ${PORT}`);
    console.log(`Video directory: ${VIDEO_DIR}`);
    console.log(`Server URL: http://YOUR_SERVER_IP:${PORT}`);
    console.log(`=`.repeat(60));
});
