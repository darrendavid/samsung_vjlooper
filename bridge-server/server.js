const express = require('express');
const cors = require('cors');
const SMB2 = require('@marsaud/smb2');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS for all origins (Samsung TV and local testing)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Range'],
    exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length'],
    credentials: false
}));

// Store active SMB connections (simple in-memory cache)
const connections = new Map();

/**
 * Parse SMB path into components
 * Supports: //server/share/path/to/folder
 * Returns: { server, share, subPath }
 */
function parseSMBPath(smbPath) {
    // Parse SMB path: //server/share/optional/sub/path
    const match = smbPath.match(/^\/\/([^\/]+)\/([^\/]+)(?:\/(.*))?$/);
    if (!match) {
        throw new Error('Invalid SMB path format. Expected: //server/share or //server/share/path');
    }

    const [, server, share, subPath] = match;
    return {
        server,
        share,
        subPath: subPath || ''
    };
}

/**
 * Get or create SMB connection
 */
function getSMBConnection(server, share, username, password) {
    const key = `${server}/${share}:${username}`;

    if (connections.has(key)) {
        return connections.get(key);
    }

    const smb2Client = new SMB2({
        share: `\\\\${server}\\${share}`,
        domain: '',
        username: username || 'guest',
        password: password || ''
    });

    connections.set(key, smb2Client);
    return smb2Client;
}

/**
 * List files endpoint
 * GET /list?path=//server/share/path/to/folder&user=username&pass=password
 */
app.get('/list', async (req, res) => {
    try {
        const { path: smbPath, user, pass } = req.query;

        if (!smbPath) {
            return res.status(400).json({ error: 'SMB path is required' });
        }

        console.log(`Listing files from: ${smbPath}`);

        const { server, share, subPath } = parseSMBPath(smbPath);
        const smb2Client = getSMBConnection(server, share, user, pass);

        console.log(`  Server: ${server}`);
        console.log(`  Share: ${share}`);
        console.log(`  SubPath: ${subPath || '(root)'}`);

        // List files in the specified directory
        smb2Client.readdir(subPath, (err, files) => {
            if (err) {
                console.error('Error listing files:', err);
                return res.status(500).json({
                    error: 'Failed to list files',
                    details: err.message
                });
            }

            // Filter for video files only
            const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v'];
            const videoFiles = files
                .filter(file => {
                    const ext = path.extname(file).toLowerCase();
                    return videoExtensions.includes(ext);
                })
                .map(file => file); // Return just the filename

            console.log(`Found ${videoFiles.length} video files`);

            res.json({ files: videoFiles });
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Server error',
            details: error.message
        });
    }
});

/**
 * Stream video endpoint
 * GET /stream?path=//server/share/path/to/folder&file=video.mp4&user=username&pass=password
 */
app.get('/stream', async (req, res) => {
    try {
        const { path: smbPath, file, user, pass } = req.query;

        if (!smbPath || !file) {
            return res.status(400).json({ error: 'SMB path and file are required' });
        }

        console.log(`Streaming: ${file} from ${smbPath}`);

        const { server, share, subPath } = parseSMBPath(smbPath);
        const smb2Client = getSMBConnection(server, share, user, pass);

        // Construct full file path including subdirectory
        const filePath = subPath ? `${subPath}/${file}` : file;
        console.log(`  Full file path: ${filePath}`);

        // Get file stats for Content-Length
        smb2Client.stat(filePath, (err, stats) => {
            if (err) {
                console.error('Error getting file stats:', err);
                return res.status(404).json({
                    error: 'File not found',
                    details: err.message
                });
            }

            const fileSize = stats.size;

            // Handle range requests for seeking
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

                // Read file with range
                const stream = smb2Client.createReadStream(filePath, {
                    start: start,
                    end: end
                });

                stream.pipe(res);

                stream.on('error', (err) => {
                    console.error('Stream error:', err);
                    res.end();
                });

            } else {
                // No range requested, send entire file
                res.writeHead(200, {
                    'Content-Length': fileSize,
                    'Content-Type': 'video/mp4',
                    'Accept-Ranges': 'bytes'
                });

                const stream = smb2Client.createReadStream(filePath);
                stream.pipe(res);

                stream.on('error', (err) => {
                    console.error('Stream error:', err);
                    res.end();
                });
            }
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Server error',
            details: error.message
        });
    }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        connections: connections.size,
        timestamp: new Date().toISOString()
    });
});

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
    res.json({
        name: 'Video Looper Bridge Server',
        version: '1.0.0',
        endpoints: {
            list: '/list?path=//server/share&user=username&pass=password',
            stream: '/stream?path=//server/share&file=video.mp4&user=username&pass=password',
            health: '/health'
        }
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bridge server running on port ${PORT}`);
    console.log(`Access from Samsung TV at: http://YOUR_SERVER_IP:${PORT}`);
});

// Cleanup on exit
process.on('SIGINT', () => {
    console.log('Closing SMB connections...');
    connections.forEach((client) => {
        try {
            client.disconnect();
        } catch (e) {
            // Ignore errors on disconnect
        }
    });
    process.exit();
});
