# Quick Start Guide

Get the Video Looper app running in under 10 minutes!

## Choose Your Path

### Path 1: Test Locally First (Recommended)

Perfect for testing before deploying to TV.

1. **Navigate to test directory:**
   ```bash
   cd test-local
   ```

2. **Run start script:**
   - Windows: Double-click `start.bat`
   - Linux/Mac: `./start.sh`

3. **Add videos:**
   - Place video files in `test-local/videos/` folder

4. **Open browser:**
   - Go to `http://localhost:3000`

5. **Configure:**
   - Add a folder (path doesn't matter)
   - Set video duration (try 30 seconds for testing)
   - Click "Save & Start"

✅ **Done!** Videos should start playing with crossfade transitions.

---

### Path 2: Docker Bridge Server

For production use with SMB shares.

1. **Clone repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/samsung_vjlooper.git
   cd samsung_vjlooper/bridge-server
   ```

2. **Update docker-compose.yml:**
   - Change `YOUR_USERNAME` to your GitHub username
   - Or use local build (uncomment `build: .`)

3. **Start server:**
   ```bash
   docker-compose up -d
   ```

4. **Verify:**
   ```bash
   curl http://localhost:8080/health
   ```

✅ **Done!** Bridge server is running.

---

### Path 3: Samsung TV Deployment

Deploy to actual Samsung TV.

#### Prerequisites
- Samsung Tizen TV (2018+)
- Tizen Studio installed
- Bridge server running

#### Steps

1. **Enable Developer Mode on TV:**
   - Settings > General > External Device Manager
   - Developer Mode > ON
   - Enter your PC IP
   - Restart TV

2. **Import project in Tizen Studio:**
   - File > Import > Tizen Project
   - Select `samsung_vjlooper` folder

3. **Connect to TV:**
   - Device Manager > Remote Device Manager
   - Add TV IP
   - Connect

4. **Update bridge URL:**
   - Edit `js/smb.js` line 73
   - Change to your bridge server IP: `http://YOUR_SERVER_IP:8080`

5. **Deploy:**
   - Right-click project
   - Run As > Tizen Web Application
   - Select your TV

6. **Configure:**
   - Add SMB folders: `//192.168.1.100/videos`
   - Enter credentials
   - Set durations
   - Start

✅ **Done!** App is running on your TV.

---

## Common Issues

### Videos won't load
- **Local:** Check videos are in `test-local/videos/`
- **TV:** Verify bridge server is running and accessible
- **TV:** Check SMB credentials are correct

### Crossfade not smooth
- Increase crossfade duration in settings
- Ensure videos are H.264 encoded
- Check network speed (for TV)

### Remote control not working
- Verify app has focus on TV
- Check Tizen Studio logs for errors
- Try restarting the app

### Bridge server connection failed
- Check server is running: `curl http://SERVER_IP:8080/health`
- Verify firewall allows port 8080
- Ensure TV and server on same network

---

## Next Steps

After getting it running:

1. **Customize settings:**
   - Adjust video duration to your preference
   - Fine-tune crossfade timing
   - Add multiple folders for variety

2. **Test thoroughly:**
   - See [TESTING.md](TESTING.md) for comprehensive testing guide
   - Try different video formats
   - Test with many videos

3. **Deploy to production:**
   - Build signed package in Tizen Studio
   - Install on all your TVs
   - Set up automatic startup

4. **Optimize:**
   - Adjust for your video quality
   - Configure network settings
   - Monitor performance

---

## File Structure

```
samsung_vjlooper/
├── bridge-server/          # SMB bridge server
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── server.js
├── test-local/            # Local testing
│   ├── local-server.js
│   ├── start.bat/sh
│   └── videos/           # Put test videos here
├── js/                   # App JavaScript
├── css/                  # App styles
├── index.html           # Main app
└── config.xml          # Tizen config
```

---

## Getting Help

- **Documentation:**
  - [README.md](README.md) - Full documentation
  - [TESTING.md](TESTING.md) - Testing guide
  - [DOCKER_SETUP.md](DOCKER_SETUP.md) - Docker setup
  - [bridge-server/README.md](bridge-server/README.md) - Bridge server docs
  - [test-local/README.md](test-local/README.md) - Local testing docs

- **Troubleshooting:**
  - Check console logs (F12 in browser)
  - Review server logs (`docker-compose logs -f`)
  - Verify network connectivity
  - Check file permissions

- **Support:**
  - Open an issue on GitHub
  - Include logs and error messages
  - Describe what you've tried

---

## Tips

- **Start simple:** Test with 2-3 short videos first
- **Use MP4:** Most compatible format for TVs
- **Network matters:** Use wired connection for TV if possible
- **Monitor logs:** Keep an eye on server logs during initial setup
- **Test durations:** Try short durations (30s) while setting up
- **Browser first:** Always test in browser before deploying to TV

---

## Success Checklist

- [ ] Local testing works
- [ ] Bridge server runs successfully
- [ ] Can connect to SMB shares
- [ ] Videos play on TV
- [ ] Crossfade transitions are smooth
- [ ] Remote control works
- [ ] Multiple folders configured
- [ ] Runs for extended periods
- [ ] Settings persist across restarts

Once all checked, you're ready for production use!

---

## Resources

- [Samsung Tizen Developer](https://developer.samsung.com/tizen)
- [Tizen Studio Download](https://developer.samsung.com/tizen/tizen-studio)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Docs](https://docs.github.com/actions)
