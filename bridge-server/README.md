# Video Looper Bridge Server

This Node.js server acts as a bridge between the Samsung TV app and SMB/CIFS network shares, since Tizen doesn't have native SMB support.

## Features

- Lists video files from SMB shares
- Streams videos to the TV with range request support (for seeking)
- Handles authentication for SMB shares
- CORS enabled for cross-origin requests from the TV

## Installation

```bash
npm install
```

## Configuration

The server listens on port 8080 by default. Change this by setting the `PORT` environment variable:

```bash
PORT=3000 npm start
```

## Running

### Option 1: Docker (Recommended)

The easiest way to run the bridge server is using Docker.

#### Using Pre-built Image (Easiest)

Pre-built images are automatically published to GitHub Container Registry on every commit:

1. **Update docker-compose.yml** with your GitHub username:
   ```yaml
   image: ghcr.io/YOUR_USERNAME/samsung_vjlooper/bridge-server:latest
   ```

2. **Pull and run:**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Stop:**
   ```bash
   docker-compose down
   ```

Available tags:
- `latest` - Latest build from main branch
- `main` - Latest build from main branch
- `sha-XXXXXXX` - Specific commit
- `v1.0.0` - Specific version (when tagged)

#### Building Locally

If you want to build the image yourself:

1. **Update docker-compose.yml** to use local build:
   ```yaml
   # Comment out the image line and uncomment:
   build: .
   ```

2. **Build and start:**
   ```bash
   docker-compose up -d
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Stop:**
   ```bash
   docker-compose down
   ```

Or build and run manually:

```bash
# Build the image
docker build -t video-looper-bridge .

# Run the container
docker run -d \
  --name video-looper-bridge \
  -p 8080:8080 \
  --restart unless-stopped \
  video-looper-bridge

# View logs
docker logs -f video-looper-bridge

# Stop the container
docker stop video-looper-bridge
```

**For SMB access on host network:**

If your SMB shares are on the same network as the Docker host, you may need to use host networking:

```bash
docker run -d \
  --name video-looper-bridge \
  --network host \
  --restart unless-stopped \
  video-looper-bridge
```

Or update `docker-compose.yml`:

```yaml
services:
  bridge-server:
    network_mode: host
```

### Option 2: Node.js Directly

#### Development
```bash
npm run dev
```

#### Production
```bash
npm start
```

Or use PM2 for process management:
```bash
npm install -g pm2
pm2 start server.js --name video-looper-bridge
pm2 save
pm2 startup
```

## API Endpoints

### List Videos
```
GET /list?path=//192.168.1.100/videos&user=myuser&pass=mypass
```

Response:
```json
{
  "files": ["video1.mp4", "video2.mkv", "video3.avi"]
}
```

### Stream Video
```
GET /stream?path=//192.168.1.100/videos&file=video1.mp4&user=myuser&pass=mypass
```

Streams the video file with support for HTTP range requests (seeking).

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "ok",
  "connections": 2,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Usage with Samsung TV App

1. Start this server on a machine that can access your SMB shares
2. Note the server's IP address and port
3. On the Samsung TV, configure the bridge server URL:
   - Open browser console (if available)
   - Run: `localStorage.setItem('bridgeServerUrl', 'http://YOUR_SERVER_IP:8080')`
   - Or modify the default in `js/smb.js`

4. Add your SMB folders in the TV app settings using the format:
   - Path: `//192.168.1.100/videos`
   - Username: Your SMB username
   - Password: Your SMB password

## Security Considerations

**WARNING**: This server transmits SMB credentials via URL parameters. Only use on trusted networks!

For production use, consider:
- Using HTTPS with valid certificates
- Implementing token-based authentication
- Moving credentials to request headers
- Adding rate limiting
- Implementing request validation

## Network Requirements

- Server must be accessible from the Samsung TV
- Server must have access to SMB shares
- Firewall must allow:
  - Incoming connections on the bridge server port (default 8080)
  - Outgoing SMB connections (port 445)

## Troubleshooting

### Videos won't list
- Verify SMB credentials are correct
- Check that the SMB share path is accessible from the server
- Ensure the share name doesn't contain special characters
- Check server logs for errors

### Streaming issues
- Verify the server has sufficient bandwidth
- Check that video files are in supported formats
- Ensure no firewall is blocking connections
- Monitor server logs during playback

### Connection errors
- Verify the TV can reach the server IP
- Check that the port is not blocked by firewall
- Ensure the server is running (`GET /health`)

## Alternative: DLNA Server

Instead of using this bridge server, you can set up a DLNA/UPnP media server (Plex, Jellyfin, Universal Media Server) and modify the TV app to use DLNA discovery and playback.

## Dependencies

- **express**: Web server framework
- **cors**: CORS middleware
- **@marsaud/smb2**: SMB2 client for Node.js

## License

MIT
