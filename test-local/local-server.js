/**
 * Local Testing Server
 *
 * This server allows you to test the Samsung TV app locally on your PC
 * without needing SMB shares or the full bridge server.
 *
 * It serves:
 * 1. The TV app files (HTML/CSS/JS)
 * 2. Mock video list API
 * 3. Video files from a local directory
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Video directory - change this to your local videos folder
const VIDEO_DIR = process.env.VIDEO_DIR || path.join(__dirname, 'videos');

// Enable CORS
app.use(cors());

// Serve the app files
app.use(express.static(path.join(__dirname, '..')));

/**
 * Mock list endpoint
 * Returns video files from local directory
 */
app.get('/list', (req, res) => {
    try {
        console.log('📹 LIST request received');
        console.log('   Query params:', req.query);
        console.log('   Video directory:', VIDEO_DIR);

        if (!fs.existsSync(VIDEO_DIR)) {
            console.log('   ⚠️  Video directory does not exist');
            return res.json({ files: [] });
        }

        const files = fs.readdirSync(VIDEO_DIR);
        const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v'];

        const videoFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return videoExtensions.includes(ext);
        });

        console.log(`   ✅ Found ${videoFiles.length} video files`);
        console.log(`   Files:`, videoFiles);

        res.json({ files: videoFiles });

    } catch (error) {
        console.error('Error listing files:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Stream video endpoint
 * Streams video files with range support (for seeking)
 */
app.get('/stream', (req, res) => {
    try {
        console.log('🎬 STREAM request received');
        console.log('   Query params:', req.query);

        const { file } = req.query;

        if (!file) {
            console.log('   ❌ No file parameter');
            return res.status(400).json({ error: 'File parameter is required' });
        }

        const videoPath = path.join(VIDEO_DIR, file);

        console.log('   Requested file:', file);
        console.log('   Full path:', videoPath);

        // Check if file exists
        if (!fs.existsSync(videoPath)) {
            console.log('   ❌ File not found!');
            console.log('   Available files:', fs.readdirSync(VIDEO_DIR));
            return res.status(404).json({ error: 'File not found' });
        }

        console.log('   ✅ File exists, streaming...');

        const stat = fs.statSync(videoPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            // Handle range requests for seeking
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;

            const stream = fs.createReadStream(videoPath, { start, end });

            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            });

            stream.pipe(res);

        } else {
            // No range, send entire file
            res.writeHead(200, {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
                'Accept-Ranges': 'bytes',
            });

            fs.createReadStream(videoPath).pipe(res);
        }

    } catch (error) {
        console.error('Error streaming file:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Health check
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        videoDir: VIDEO_DIR,
        timestamp: new Date().toISOString()
    });
});

/**
 * Root endpoint
 */
app.get('/api', (req, res) => {
    res.json({
        name: 'Video Looper Local Test Server',
        version: '1.0.0',
        endpoints: {
            app: '/',
            list: '/list',
            stream: '/stream?file=video.mp4',
            health: '/health'
        },
        videoDirectory: VIDEO_DIR
    });
});

// Start server
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('Video Looper Local Test Server');
    console.log('='.repeat(60));
    console.log(`Server running at: http://localhost:${PORT}`);
    console.log(`Video directory: ${VIDEO_DIR}`);
    console.log('');
    console.log('To test the app:');
    console.log(`1. Open http://localhost:${PORT} in your browser`);
    console.log('2. The app will load automatically');
    console.log('');
    console.log('IMPORTANT: Update js/smb.js to use this local server:');
    console.log(`   Change getBridgeServerUrl() to return 'http://localhost:${PORT}'`);
    console.log('');
    console.log('Place video files in:', VIDEO_DIR);
    console.log('='.repeat(60));

    // Check if video directory exists
    if (!fs.existsSync(VIDEO_DIR)) {
        console.log('');
        console.log('⚠️  WARNING: Video directory does not exist!');
        console.log(`   Creating directory: ${VIDEO_DIR}`);
        fs.mkdirSync(VIDEO_DIR, { recursive: true });
        console.log('   Please add some video files to test.');
    } else {
        const files = fs.readdirSync(VIDEO_DIR);
        const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v'];
        const videoCount = files.filter(f => videoExtensions.includes(path.extname(f).toLowerCase())).length;
        console.log(`   Found ${videoCount} video file(s) in directory`);
    }
});
