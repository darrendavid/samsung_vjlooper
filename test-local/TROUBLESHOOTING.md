# Local Testing Troubleshooting

Common issues when testing locally and how to fix them.

## Error: "MIME type mismatch" for webapis.js

**Cause**: The Tizen WebAPIs script is not available in browser environment.

**Fix**: This is normal and expected. The app now handles this gracefully.

**What happens**:
- The browser tries to load the Tizen-specific script
- It fails (because you're not on a TV)
- The app detects this and continues in browser mode
- You'll see "Running in browser mode (Tizen APIs not available)" in console

✅ **This is not an error - the app will work fine for testing.**

## Videos Don't Appear

**Checklist**:
1. ✅ Are video files in `test-local/videos/` folder?
2. ✅ Are they in supported formats (.mp4, .mkv, .avi, etc.)?
3. ✅ Is the server running? (Check terminal output)
4. ✅ Did you add a folder in settings?
5. ✅ Did you click "Save & Start"?

**Debug steps**:
```bash
# Check if server is running
curl http://localhost:3000/health

# Check if videos are detected
curl http://localhost:3000/list

# Should return: {"files":["video1.mp4","video2.mp4"]}
```

## Video Won't Play

**Common causes**:

### 1. Browser Autoplay Policy
Modern browsers block autoplay. You need to interact with the page first.

**Fix**: Click anywhere on the page, then videos will play.

### 2. Unsupported Codec
The browser might not support the video codec.

**Fix**:
- Use H.264 encoded MP4 files (most compatible)
- Try a different video file
- Check browser console for specific errors

### 3. File Path Issues
The server can't find the video file.

**Debug**:
```javascript
// In browser console:
fetch('http://localhost:3000/stream?file=yourfile.mp4')
  .then(r => console.log(r.status))
  .catch(e => console.error(e))
```

## Crossfade Not Working

**Possible causes**:

1. **Videos too short**: Make sure videos are longer than crossfade duration
2. **Video duration too short**: Set video duration longer than crossfade in settings
3. **Browser performance**: Try reducing video quality or crossfade duration

**Test**:
- Set video duration to 15 seconds
- Set crossfade to 2 seconds
- Use 3+ different videos

## Settings Don't Save

**Cause**: LocalStorage might be disabled or blocked.

**Fix**:
1. Check browser settings allow localStorage
2. Make sure you're not in incognito/private mode
3. Try a different browser
4. Clear browser cache and reload

**Test localStorage**:
```javascript
// In browser console:
localStorage.setItem('test', 'works');
console.log(localStorage.getItem('test')); // Should print "works"
```

## Server Won't Start

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Fix**:
```bash
# Option 1: Use a different port
PORT=3001 npm start

# Option 2: Kill the process using port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Option 2: Kill the process using port 3000 (Linux/Mac)
lsof -ti:3000 | xargs kill
```

### Missing Dependencies

**Error**: `Cannot find module 'express'`

**Fix**:
```bash
npm install
```

### Node.js Not Installed

**Error**: `node: command not found`

**Fix**:
1. Install Node.js from https://nodejs.org/
2. Choose LTS version
3. Restart terminal after installation

## CORS Errors

**Error**: "CORS policy" error in console

**Cause**: You're accessing from a different origin (rare in local testing)

**Fix**: The server already has CORS enabled. If you still see errors:
1. Make sure you're accessing `http://localhost:3000` (not `127.0.0.1` or file://)
2. Check browser console for specific CORS error
3. Try a different browser

## Network Errors

### Cannot Connect to Server

**Symptoms**:
- Browser says "Can't reach this page"
- Console shows network errors

**Fix**:
1. Verify server is running (check terminal)
2. Make sure URL is exactly `http://localhost:3000`
3. Try `http://127.0.0.1:3000` instead
4. Check firewall isn't blocking port 3000

### Slow Loading

**Cause**: Large video files or slow disk

**Fix**:
1. Use smaller/shorter videos for testing
2. Use MP4 format (most efficient)
3. Check disk space and speed
4. Close other applications

## Remote Control (Keyboard) Not Working

**Issue**: Arrow keys don't skip videos

**Checklist**:
1. ✅ Click on the page first (give it focus)
2. ✅ Make sure videos are playing
3. ✅ Press Left/Right arrow keys (not up/down)
4. ✅ Check browser console for errors

**Test**:
```javascript
// In browser console, check if keys are registered:
document.addEventListener('keydown', (e) => console.log(e.keyCode));
// Press Left (should show 37) and Right (should show 39)
```

## Console Shows Errors

### Common Harmless Errors

These are normal in browser testing:

1. ✅ **"Failed to load resource: webapis.js"** - Normal, Tizen APIs not in browser
2. ✅ **"Running in browser mode"** - This is a status message, not an error
3. ✅ **404 for $WEBAPIS/** - Expected, handled gracefully

### Actual Errors to Fix

1. ❌ **"Failed to fetch"** - Check server is running
2. ❌ **"Syntax error"** - Check for code issues
3. ❌ **"Cannot read property"** - Check browser console for details

## Videos Play But No Crossfade

**Symptoms**: Videos just cut from one to another

**Possible causes**:

1. **CSS not loaded**: Check browser DevTools > Network tab for style.css
2. **Transition disabled**: Check CSS file for transition duration
3. **Browser doesn't support transitions**: Try Chrome/Edge

**Fix**:
```javascript
// In browser console, check video elements:
const v1 = document.getElementById('video1');
const v2 = document.getElementById('video2');
console.log(window.getComputedStyle(v1).transition);
// Should show: opacity 2s ease-in-out
```

## App Freezes or Crashes

**Causes**:
1. Video files too large
2. Too many videos
3. Memory leak in browser
4. Browser running out of memory

**Fix**:
1. Use smaller video files (< 500MB each)
2. Test with fewer videos first (2-3)
3. Close other browser tabs
4. Restart browser
5. Check browser console for errors

## Getting More Help

### Enable Verbose Logging

The app already logs to console. Open DevTools (F12) and check Console tab.

### Check Network Activity

1. Open DevTools (F12)
2. Go to Network tab
3. Watch for requests to `/list` and `/stream`
4. Check response codes (should be 200)

### Test Server Manually

```bash
# List videos
curl http://localhost:3000/list

# Stream a video (replace with actual filename)
curl http://localhost:3000/stream?file=sample.mp4 -I

# Check health
curl http://localhost:3000/health
```

### Restart Everything

When in doubt:
1. Stop the server (Ctrl+C)
2. Close browser completely
3. Clear browser cache
4. Restart server: `npm start`
5. Open browser to `http://localhost:3000`
6. Try again

### Still Not Working?

1. Check all files are in the right place
2. Verify you're in the `test-local` directory
3. Make sure Node.js is installed: `node --version`
4. Try a different browser
5. Check you have at least one video file in `videos/` folder
6. Review server console output for errors

### Report an Issue

If you're still stuck, gather this information:

1. Node.js version: `node --version`
2. Operating system
3. Browser and version
4. Server console output
5. Browser console errors
6. Steps you took
7. What you expected vs what happened

Then create an issue on GitHub with all details.
