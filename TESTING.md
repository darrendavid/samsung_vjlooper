# Testing Guide

This guide covers how to test the Video Looper app both locally on your PC and on a Samsung TV.

## Table of Contents

- [Local Testing (PC)](#local-testing-pc)
- [Samsung TV Testing](#samsung-tv-testing)
- [Bridge Server Testing](#bridge-server-testing)
- [End-to-End Testing](#end-to-end-testing)

## Local Testing (PC)

Test the app in your browser before deploying to a TV.

### Quick Start

1. **Navigate to test directory:**
   ```bash
   cd test-local
   ```

2. **Run the start script:**

   **Windows:**
   ```bash
   start.bat
   ```

   **Linux/Mac:**
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

   **Or manually:**
   ```bash
   npm install
   npm start
   ```

3. **Add test videos:**
   - Place video files in `test-local/videos/`
   - Supported formats: MP4, MKV, AVI, MOV, WMV, FLV, WebM

4. **Open in browser:**
   - Navigate to `http://localhost:3000`
   - The app should load automatically

5. **Configure the app:**
   - Add a test folder (path doesn't matter for local testing)
   - Set video duration (e.g., 30 seconds for quick testing)
   - Set crossfade duration (e.g., 2 seconds)
   - Click "Save & Start"

### Testing Checklist

- [ ] Settings screen appears on first load
- [ ] Can add/remove folders
- [ ] Video duration and crossfade settings save correctly
- [ ] Videos load from local directory
- [ ] First video plays automatically
- [ ] Crossfade transition works smoothly
- [ ] Videos rotate at configured interval
- [ ] Left arrow skips to previous video
- [ ] Right arrow skips to next video
- [ ] Escape key opens settings
- [ ] Random selection avoids recent repeats
- [ ] All video formats play correctly

### Browser Testing

Test in multiple browsers:
- [ ] Chrome/Edge (recommended)
- [ ] Firefox
- [ ] Safari (Mac)

### Troubleshooting Local Testing

**Videos don't appear:**
- Check videos are in `test-local/videos/` folder
- Verify video file extensions are supported
- Check browser console for errors

**Videos won't play:**
- Ensure videos are properly encoded (H.264 for MP4)
- Check browser supports the video codec
- Look for autoplay restrictions in browser

**Settings don't save:**
- Check browser allows localStorage
- Try a different browser
- Check browser console for errors

## Samsung TV Testing

Test the app on an actual Samsung TV.

### Prerequisites

1. **Samsung Tizen TV** (2018+, Tizen 4.0+)
2. **Tizen Studio** installed on your PC
3. **Developer Mode** enabled on TV
4. **Bridge server** running (see next section)

### Setup Steps

1. **Enable Developer Mode on TV:**
   - Open Settings > General > External Device Manager
   - Turn on Developer Mode
   - Enter your PC's IP address when prompted
   - Restart your TV

2. **Connect Tizen Studio:**
   - Open Device Manager in Tizen Studio
   - Click "Remote Device Manager"
   - Add your TV's IP address
   - Click "Connect"

3. **Import Project:**
   - File > Import > Tizen Project
   - Select the `samsung_vjlooper` directory
   - Click Finish

4. **Run on TV:**
   - Right-click project
   - Run As > Tizen Web Application
   - Select your TV from the device list

### Testing on TV

- [ ] App launches successfully
- [ ] Settings screen is readable on TV
- [ ] Can navigate settings with remote
- [ ] Can add network folders
- [ ] Videos load from network shares
- [ ] Playback is smooth at 1080p
- [ ] Crossfade transition is smooth
- [ ] Remote control buttons work:
  - [ ] Left arrow - previous video
  - [ ] Right arrow - next video
  - [ ] Back/Return - settings
- [ ] App runs for extended period (1+ hours)
- [ ] No memory leaks over time

### TV-Specific Issues

**Remote not working:**
- Check key registration in browser console
- Verify TV remote is in TV mode (not STB/DVD mode)
- Try restarting the app

**Videos buffering:**
- Check network connection speed
- Ensure bridge server has sufficient bandwidth
- Try lower resolution videos
- Check Wi-Fi signal strength

**App crashes:**
- Check TV logs via Tizen Studio
- Monitor memory usage
- Reduce video file sizes
- Increase crossfade duration

## Bridge Server Testing

Test the SMB bridge server.

### Docker Method

1. **Build and run:**
   ```bash
   cd bridge-server
   docker-compose up -d
   ```

2. **Check health:**
   ```bash
   curl http://localhost:8080/health
   ```

3. **Test list endpoint:**
   ```bash
   curl "http://localhost:8080/list?path=//192.168.1.100/videos&user=myuser&pass=mypass"
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f
   ```

### Node.js Method

1. **Install and run:**
   ```bash
   cd bridge-server
   npm install
   npm start
   ```

2. **Test endpoints:** (same as Docker method above)

### Bridge Server Checklist

- [ ] Server starts without errors
- [ ] Health endpoint returns OK
- [ ] Can list files from SMB share
- [ ] Can stream video files
- [ ] Range requests work (for seeking)
- [ ] CORS headers present
- [ ] Authentication works with credentials
- [ ] Server handles multiple simultaneous requests
- [ ] Error messages are informative

### Network Testing

**From TV to bridge server:**
```bash
# On TV browser console (if available)
fetch('http://YOUR_SERVER_IP:8080/health')
  .then(r => r.json())
  .then(console.log)
```

**From PC to SMB share:**
```bash
# Windows
net use \\192.168.1.100\videos /user:username password

# Linux
smbclient //192.168.1.100/videos -U username
```

## End-to-End Testing

Complete system testing with all components.

### Setup

1. **Bridge server running** (Docker or Node.js)
2. **SMB share accessible** from bridge server
3. **TV connected** to same network
4. **App deployed** to TV

### Test Scenario 1: Single Folder

1. Configure one SMB folder
2. Set video duration to 60 seconds
3. Set crossfade to 2 seconds
4. Start playback
5. Observe for 10 minutes

**Expected:**
- Videos load and play continuously
- Smooth transitions every 60 seconds
- No buffering or stuttering
- Random selection without repeats

### Test Scenario 2: Multiple Folders

1. Configure 3 different SMB folders
2. Each with different videos
3. Set video duration to 30 seconds
4. Start playback
5. Observe which videos play

**Expected:**
- Videos from all folders play
- Random selection across all folders
- No bias toward any folder

### Test Scenario 3: Remote Control

1. Start playback
2. Wait for 2nd video to start
3. Press Left arrow
4. Should return to 1st video
5. Press Right arrow twice
6. Should skip to next video

**Expected:**
- Skip backward works
- Skip forward works
- History tracking works correctly

### Test Scenario 4: Long Running

1. Start playback
2. Leave running for 24 hours
3. Monitor periodically

**Expected:**
- No crashes
- No memory leaks
- Continues playing indefinitely
- Network reconnects if needed

### Performance Metrics

Monitor these during testing:

- **Load Time:** Time from launch to first video < 10 seconds
- **Transition Time:** Crossfade duration as configured (1-10s)
- **Memory Usage:** Should remain stable over time
- **CPU Usage:** Should be low during playback
- **Network Bandwidth:** Depends on video quality

### Issue Reporting

When reporting issues, include:

1. **Environment:**
   - TV model and Tizen version
   - Bridge server setup (Docker/Node.js)
   - Network configuration

2. **Steps to reproduce:**
   - Detailed steps
   - Configuration used
   - Video formats/sizes

3. **Expected vs Actual:**
   - What should happen
   - What actually happened

4. **Logs:**
   - TV app console logs
   - Bridge server logs
   - Network errors

5. **Screenshots/Videos:**
   - Visual issues
   - Settings configuration
   - Error messages

## Automated Testing

For developers who want to add automated tests:

### Unit Tests (Future)

```bash
# Example structure
tests/
├── unit/
│   ├── config.test.js
│   ├── videoManager.test.js
│   └── player.test.js
└── integration/
    └── bridge-server.test.js
```

### Integration Tests (Future)

Test bridge server with mock SMB shares.

### End-to-End Tests (Future)

Use Selenium or Puppeteer to automate browser testing.

## Tips for Effective Testing

1. **Start small:** Test with 2-3 short videos first
2. **Use variety:** Test different video formats and sizes
3. **Monitor logs:** Always check console and server logs
4. **Network tools:** Use browser DevTools Network tab
5. **Test edge cases:**
   - Very long videos (1+ hour)
   - Very short videos (< 10 seconds)
   - Large files (> 1GB)
   - Many files (100+)
   - Slow network connections
   - Network interruptions

6. **Document issues:** Keep notes on what works and what doesn't

## Next Steps After Testing

Once testing is complete:

1. **Fix any issues** found during testing
2. **Optimize performance** based on metrics
3. **Create production build** with Tizen Studio
4. **Deploy to production** TV(s)
5. **Monitor in production** for any issues

## Getting Help

If you encounter issues:

1. Check the troubleshooting sections in:
   - [Main README](README.md)
   - [Bridge Server README](bridge-server/README.md)
   - [Local Testing README](test-local/README.md)

2. Review browser console logs
3. Check bridge server logs
4. Verify network connectivity

5. Open an issue with detailed information
