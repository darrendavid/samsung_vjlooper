# Local Testing Setup

This setup allows you to test the Video Looper app on your PC without needing:
- A Samsung TV
- SMB network shares
- The full bridge server

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Add Test Videos

Place some video files in the `videos` folder (it will be created automatically if it doesn't exist).

Or specify a custom video directory:

```bash
# Windows
set VIDEO_DIR=D:\MyVideos
npm start

# Linux/Mac
VIDEO_DIR=/path/to/videos npm start
```

### 3. Update the App Configuration

Before starting, update the bridge server URL in the app to point to the local server:

**Option A: Modify the code (temporary for testing)**

Edit `../js/smb.js` line 73:

```javascript
getBridgeServerUrl: function() {
    return localStorage.getItem('bridgeServerUrl') || 'http://localhost:3000';
}
```

**Option B: Use browser localStorage (keeps original code intact)**

After opening the app in your browser, open the console and run:

```javascript
localStorage.setItem('bridgeServerUrl', 'http://localhost:3000');
```

Then reload the page.

### 4. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### 5. Open the App

Open your browser and navigate to:

```
http://localhost:3000
```

The app will load just like it would on a Samsung TV!

## Testing Features

### Configure Folders

1. When the app loads, it will show the settings screen
2. Click "Add Folder"
3. Enter any path (e.g., `//test/videos`) - it doesn't matter for local testing
4. Leave username/password blank or enter anything
5. Click "Add"
6. Set your desired video duration and crossfade duration
7. Click "Save & Start"

The app will load videos from your local `videos` folder regardless of the path you entered.

### Test Remote Control Navigation

Use your keyboard to simulate TV remote:
- **Left Arrow**: Skip to previous video
- **Right Arrow**: Skip to next video
- **Escape**: Open settings

### Test Crossfade

The app will automatically crossfade between videos based on your configured duration.

## Folder Structure

```
test-local/
├── local-server.js    # Local test server
├── package.json       # Dependencies
├── README.md          # This file
└── videos/            # Place your test videos here
    ├── video1.mp4
    ├── video2.mkv
    └── ...
```

## Supported Video Formats

- MP4 (.mp4, .m4v)
- MKV (.mkv)
- AVI (.avi)
- MOV (.mov)
- WMV (.wmv)
- FLV (.flv)
- WebM (.webm)

## Features Tested

This local setup tests:
- ✅ Video listing
- ✅ Video playback
- ✅ Crossfade transitions
- ✅ Random selection
- ✅ Timed rotation
- ✅ Skip forward/backward
- ✅ Settings UI
- ✅ Configuration persistence (localStorage)

## Differences from TV

Some things that work differently in local testing:
- No Tizen-specific APIs (gracefully handled)
- Browser video player instead of TV player
- Keyboard instead of TV remote
- Mouse clicks instead of remote navigation

## Troubleshooting

### Videos don't load

1. Check that video files are in the `videos` folder
2. Check browser console for errors
3. Verify the bridge server URL is set to `http://localhost:3000`
4. Make sure the server is running

### Can't see the app

1. Verify the server started successfully
2. Check the URL is `http://localhost:3000`
3. Try a different port if 3000 is in use: `PORT=3001 npm start`

### Crossfade not working

Some browsers may have autoplay restrictions. Make sure:
1. You've interacted with the page (clicked something)
2. Videos have audio muted (they are by default in the player)

### CORS errors

The local server has CORS enabled, but if you're accessing from a different domain, you may need to:
1. Access via `http://localhost:3000` instead of `http://127.0.0.1:3000`
2. Check browser console for specific CORS errors

## Development Mode

For development with auto-reload:

```bash
npm run dev
```

This uses nodemon to restart the server when files change.

## Custom Port

To use a different port:

```bash
PORT=8080 npm start
```

Then update the bridge URL accordingly.

## Next Steps

Once you've tested locally:
1. Revert the bridge URL changes in `js/smb.js`
2. Set up the bridge server for SMB access
3. Deploy to Samsung TV using Tizen Studio

## Tips

- Use the browser's Developer Tools (F12) to debug
- Check the Network tab to see video loading
- Use the Console to see app logs
- Test with various video lengths and formats
- Try different crossfade durations to find what works best
