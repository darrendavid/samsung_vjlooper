# Docker Setup Guide

This guide explains how to set up automatic Docker image builds for the bridge server using GitHub Actions.

## Overview

The project includes a GitHub Actions workflow that automatically:
- Builds the Docker image on every commit to main/master
- Publishes to GitHub Container Registry (ghcr.io)
- Supports multiple platforms (amd64, arm64, arm/v7)
- Creates multiple tags (latest, sha, version)
- Scans for security vulnerabilities

## Initial Setup

### 1. Push to GitHub

First, push your code to GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/samsung_vjlooper.git
git push -u origin main
```

### 2. Enable GitHub Actions

GitHub Actions is enabled by default. The workflow will run automatically on the first push.

### 3. Enable GitHub Container Registry

1. Go to your GitHub repository
2. Click on **Settings** > **Actions** > **General**
3. Scroll to **Workflow permissions**
4. Select **Read and write permissions**
5. Click **Save**

### 4. Wait for First Build

1. Go to **Actions** tab in your repository
2. You should see "Build and Push Docker Image" workflow running
3. Wait for it to complete (usually 5-10 minutes)

### 5. Make Package Public (Optional)

By default, the package is private. To make it public:

1. Go to your GitHub profile
2. Click **Packages**
3. Find **samsung_vjlooper/bridge-server**
4. Click **Package settings**
5. Scroll down to **Danger Zone**
6. Click **Change visibility** > **Public**

## Using the Pre-built Image

### Quick Start

1. **Update docker-compose.yml** with your GitHub username:

   ```yaml
   services:
     bridge-server:
       image: ghcr.io/YOUR_USERNAME/samsung_vjlooper/bridge-server:latest
   ```

2. **If the package is private**, login to GitHub Container Registry:

   ```bash
   # Create a Personal Access Token (PAT) with read:packages scope
   # Then login:
   echo YOUR_PAT | docker login ghcr.io -u YOUR_USERNAME --password-stdin
   ```

3. **Pull and run:**

   ```bash
   docker-compose pull
   docker-compose up -d
   ```

### Available Tags

The workflow creates multiple tags for flexibility:

| Tag | Description | Example |
|-----|-------------|---------|
| `latest` | Latest build from default branch | `ghcr.io/user/repo/bridge-server:latest` |
| `main` | Latest build from main branch | `ghcr.io/user/repo/bridge-server:main` |
| `sha-*` | Specific commit | `ghcr.io/user/repo/bridge-server:sha-abc1234` |
| `v*.*.*` | Semantic version | `ghcr.io/user/repo/bridge-server:v1.0.0` |
| `v*.*` | Minor version | `ghcr.io/user/repo/bridge-server:v1.0` |
| `v*` | Major version | `ghcr.io/user/repo/bridge-server:v1` |

### Pinning to Specific Version

For production, it's recommended to pin to a specific version:

```yaml
services:
  bridge-server:
    image: ghcr.io/YOUR_USERNAME/samsung_vjlooper/bridge-server:v1.0.0
```

Or use SHA for exact commit:

```yaml
services:
  bridge-server:
    image: ghcr.io/YOUR_USERNAME/samsung_vjlooper/bridge-server:sha-abc1234
```

## Creating Releases

To create a versioned release:

1. **Tag your commit:**

   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

2. **Create GitHub Release:**

   - Go to **Releases** > **Draft a new release**
   - Choose the tag you just created
   - Add release notes
   - Click **Publish release**

3. **Wait for build:**

   The workflow will automatically build and tag the image with `v1.0.0`, `v1.0`, and `v1`.

## Workflow Triggers

The Docker build workflow triggers on:

- **Push to main/master** - When changes are pushed to default branch
- **Pull Request** - When PR is opened (builds but doesn't push)
- **Release** - When a new release is published
- **Manual** - Can be triggered manually from Actions tab
- **Path filter** - Only when files in `bridge-server/` change

## Multi-Platform Support

The workflow builds for multiple platforms:

- `linux/amd64` - Standard x86_64 (most PCs, servers)
- `linux/arm64` - ARM 64-bit (Raspberry Pi 4, Apple Silicon)
- `linux/arm/v7` - ARM 32-bit (Raspberry Pi 3, older)

Docker will automatically pull the correct image for your platform.

## Viewing Build Status

### In Repository

Add a badge to your README:

```markdown
![Docker Build](https://github.com/YOUR_USERNAME/samsung_vjlooper/actions/workflows/docker-build.yml/badge.svg)
```

### In Actions Tab

1. Go to **Actions** tab
2. Click on **Build and Push Docker Image**
3. View recent builds and logs

## Troubleshooting

### Build Fails

1. Check the Actions tab for error logs
2. Common issues:
   - Dockerfile syntax errors
   - Missing dependencies
   - Permission issues

### Cannot Pull Image

**If package is private:**

```bash
# Create Personal Access Token (PAT):
# 1. GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
# 2. Generate new token with 'read:packages' scope
# 3. Login:
echo YOUR_PAT | docker login ghcr.io -u YOUR_USERNAME --password-stdin
```

**If package is public:**

```bash
# No login needed, just pull
docker pull ghcr.io/YOUR_USERNAME/samsung_vjlooper/bridge-server:latest
```

### Image Too Large

To reduce image size:

1. Use multi-stage builds (already implemented)
2. Minimize installed packages
3. Use `.dockerignore` (already configured)
4. Use alpine base image (already used)

Current image size should be around 150-200MB.

### Security Vulnerabilities

The workflow includes Docker Scout scanning. If vulnerabilities are found:

1. Check the Actions logs
2. Update dependencies in package.json
3. Rebuild base image
4. Or suppress if false positive

## Advanced Configuration

### Custom Registry

To use Docker Hub instead of GitHub Container Registry:

1. Update `.github/workflows/docker-build.yml`:

   ```yaml
   env:
     REGISTRY: docker.io
     IMAGE_NAME: YOUR_DOCKERHUB_USERNAME/video-looper-bridge
   ```

2. Add Docker Hub credentials as secrets:
   - Settings > Secrets > New repository secret
   - Name: `DOCKERHUB_USERNAME`
   - Name: `DOCKERHUB_TOKEN`

3. Update login step:

   ```yaml
   - name: Log in to Docker Hub
     uses: docker/login-action@v3
     with:
       username: ${{ secrets.DOCKERHUB_USERNAME }}
       password: ${{ secrets.DOCKERHUB_TOKEN }}
   ```

### Build on Schedule

To rebuild weekly (for security updates):

Add to workflow triggers:

```yaml
on:
  schedule:
    - cron: '0 0 * * 0'  # Every Sunday at midnight
```

### Build Notifications

To get notified of build failures, use GitHub Actions notifications:

1. Settings > Notifications
2. Enable "Actions" notifications
3. Choose email or web

## Local Testing

Test the workflow locally using [act](https://github.com/nektos/act):

```bash
# Install act
brew install act  # Mac
# or download from GitHub releases

# Run the workflow
act push -s GITHUB_TOKEN=your_token
```

## Best Practices

1. **Always test locally** before pushing
2. **Use semantic versioning** for releases
3. **Pin versions in production** (don't use `:latest`)
4. **Review security scans** regularly
5. **Keep dependencies updated**
6. **Document breaking changes** in releases
7. **Test on all platforms** if possible

## Migration from Local Build

If you were building locally and want to switch to pre-built:

1. **Update docker-compose.yml:**

   ```yaml
   # Old:
   # build: .

   # New:
   image: ghcr.io/YOUR_USERNAME/samsung_vjlooper/bridge-server:latest
   ```

2. **Pull the image:**

   ```bash
   docker-compose pull
   ```

3. **Recreate container:**

   ```bash
   docker-compose up -d
   ```

4. **Remove old local image (optional):**

   ```bash
   docker image prune
   ```

## Cost Considerations

- **GitHub Actions**: 2,000 free minutes/month for public repos
- **GitHub Container Registry**: Free for public packages
- **Bandwidth**: Free egress for public packages

For private repos:
- 500 free minutes/month
- 500MB free storage
- Additional usage is billed

## Next Steps

After setup:

1. ✅ Push code to GitHub
2. ✅ Verify workflow runs successfully
3. ✅ Update docker-compose.yml with your username
4. ✅ Test pulling and running the image
5. ✅ Create your first release
6. ✅ Add build status badge to README

## Getting Help

If you encounter issues:

1. Check workflow logs in Actions tab
2. Review GitHub Container Registry docs
3. Check Docker documentation
4. Open an issue on GitHub
