# Video Looper Bridge Server v2.0

A simple HTTP server that serves video files from a mounted directory to the Samsung TV Video Looper app.

## Features

- **Simple Setup**: Just mount a directory with your videos
- **No SMB Complexity**: Serves files directly from the filesystem
- **CORS Enabled**: Works with browser-based testing
- **Range Requests**: Supports video seeking
- **Recursive Discovery**: Finds videos in all subdirectories
- **Docker Ready**: Easy deployment with Docker Compose

## Quick Start

### Option 1: Docker Compose (Recommended)

1. **Edit docker-compose.yml** to point to your video directory:
   ```yaml
   volumes:
     - /path/to/your/videos:/videos:ro
   ```

2. **Start the server**:
   ```bash
   docker-compose up -d --build
   ```

3. **Check it's running**:
   ```bash
   curl http://localhost:9999/health
   ```

### Option 2: Run Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set video directory** (optional, defaults to `/videos`):
   ```bash
   export VIDEO_DIR=/path/to/your/videos
   export PORT=9999
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

## Configuration

### Environment Variables

- `PORT` - Server port (default: 8080)
- `VIDEO_DIR` - Directory containing video files (default: /videos)
- `NODE_ENV` - Environment (production/development)

### Docker Compose Volume Mounting

The docker-compose.yml file mounts a directory as `/videos` inside the container:

```yaml
volumes:
  - ./videos:/videos:ro  # Change ./videos to your actual path
```

Examples:
- Local directory: `./videos:/videos:ro`
- Absolute path: `/mnt/media/videos:/videos:ro`
- Windows path: `C:/Videos:/videos:ro`
- Network mount: `/mnt/nas/videos:/videos:ro`

The `:ro` flag mounts the directory as read-only for security.

## API Endpoints

### GET /

Server information and available endpoints.

**Response**:
```json
{
  "name": "Video Looper Bridge Server",
  "version": "2.0.0",
  "description": "Serves video files from a mounted directory",
  "videoDir": "/videos",
  "endpoints": {
    "list": "/list - Get all video files",
    "stream": "/stream?file=path/to/video.mp4 - Stream a video file",
    "health": "/health - Health check"
  }
}
```

### GET /list

Lists all video files found in the video directory and subdirectories.

**Response**:
```json
{
  "files": [
    "video1.mp4",
    "subfolder/video2.mp4",
    "another/deep/folder/video3.mkv"
  ]
}
```

### GET /stream?file={filename}

Streams a video file. Supports HTTP range requests for seeking.

**Parameters**:
- `file` - Relative path from VIDEO_DIR (e.g., `subfolder/video.mp4`)

**Example**:
```
GET /stream?file=beeple/EYE%20OF%20THE%20STORM.mp4
```

### GET /health

Health check endpoint.

**Response**:
```json
{
  "status": "ok",
  "videoDir": "/videos",
  "dirExists": true,
  "timestamp": "2026-02-22T05:35:32.704Z"
}
```

## Supported Video Formats

- `.mp4`
- `.mkv`
- `.avi`
- `.mov`
- `.wmv`
- `.flv`
- `.webm`
- `.m4v`

## Usage with Samsung TV App

1. **Configure bridge server URL** in the app settings or browser console:
   ```javascript
   localStorage.setItem('bridgeServerUrl', 'http://your-server-ip:9999');
   ```

2. **The app will automatically**:
   - Connect to the server on startup
   - List all available videos
   - Play them in random order with crossfades

## Docker Deployment

### Build and Run

```bash
# Build the image
docker-compose build

# Start the server
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the server
docker-compose down
```

### Check Container Status

```bash
# List containers
docker-compose ps

# Check health
docker-compose exec bridge-server wget -qO- http://localhost:9999/health
```

### Mount a Network Share

If your videos are on a network share (SMB/NFS), mount it first, then point Docker to the mount:

**Linux/Mac**:
```bash
# Mount SMB share
sudo mount -t cifs //server/share /mnt/videos -o username=user,password=pass

# Update docker-compose.yml
volumes:
  - /mnt/videos:/videos:ro
```

**Windows (WSL2)**:
```powershell
# Mount as network drive (Z:)
net use Z: \\server\share /user:username password

# Update docker-compose.yml
volumes:
  - /mnt/z:/videos:ro
```

## Troubleshooting

### No videos found

**Check**:
1. Video directory exists: `docker-compose exec bridge-server ls -la /videos`
2. Videos are readable: `docker-compose exec bridge-server find /videos -name "*.mp4"`
3. Check health endpoint: `curl http://localhost:9999/health`

### CORS errors

The server has CORS enabled by default (`origin: *`). If you still see errors:
1. Check the browser console for the actual error
2. Verify the server is reachable: `curl -i http://server-ip:9999/health`
3. Check firewall rules

### Permission errors

If running as non-root user (recommended), ensure the video directory is readable:
```bash
chmod -R +r /path/to/videos
```

### Port already in use

Change the port in docker-compose.yml:
```yaml
ports:
  - "8080:9999"  # Host port 8080, container port 9999
```

## Security Notes

- The server binds to `0.0.0.0` (all interfaces) for TV access
- Videos are mounted read-only (`:ro`)
- Path traversal protection prevents accessing files outside VIDEO_DIR
- No authentication (use firewall rules or reverse proxy for access control)

## License

MIT
