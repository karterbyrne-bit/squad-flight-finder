# Deployment Guide - Squad Flight Finder

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Build Process](#build-process)
4. [Deployment Options](#deployment-options)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or yarn/pnpm)
- **Git**: For version control

### Required Accounts

- **Amadeus API**: Register at [developers.amadeus.com](https://developers.amadeus.com)
- **Google Analytics**: (Optional) For user tracking
- **Hosting Platform**: Choose one:
  - Vercel (Recommended)
  - Netlify
  - GitHub Pages
  - AWS S3 + CloudFront
  - Custom server

## Environment Setup

### 1. Create Environment Variables

Create a `.env` file in the project root:

```bash
# Amadeus API Credentials (TEST Environment)
VITE_AMADEUS_API_KEY=your_test_api_key_here
VITE_AMADEUS_API_SECRET=your_test_api_secret_here

# Google Analytics (Optional)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Environment
VITE_ENV=production
```

### 2. Get Amadeus API Credentials

1. Sign up at [developers.amadeus.com](https://developers.amadeus.com)
2. Create a new app in the dashboard
3. Note your API Key and API Secret
4. **Test Environment**: Use the test credentials for development
5. **Production Environment**: Apply for production credentials when ready

### 3. Security Warning

⚠️ **CRITICAL**: The current implementation exposes API keys client-side. This is acceptable for:
- Local development
- Testing/prototyping
- Low-traffic demos

For production use, you **MUST** implement a backend API proxy to secure credentials.

## Build Process

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### 3. Lint and Format

```bash
# Check formatting
npm run format:check

# Fix formatting
npm run format

# Run linter
npm run lint
```

### 4. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `/dist` directory.

### 5. Preview Build Locally

```bash
npm run preview
```

Opens the production build at `http://localhost:4173`

## Deployment Options

### Option 1: Vercel (Recommended)

**Pros**: Zero config, automatic deployments, free tier, excellent performance

#### Deploy via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

#### Deploy via Git

1. Push code to GitHub/GitLab/Bitbucket
2. Visit [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variables in project settings
5. Deploy

**Environment Variables in Vercel**:
- Go to Project Settings → Environment Variables
- Add each variable from your `.env` file
- Redeploy after adding variables

### Option 2: Netlify

**Pros**: Simple, free tier, form handling, serverless functions

#### Deploy via CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

#### Deploy via Git

1. Push code to GitHub/GitLab/Bitbucket
2. Visit [app.netlify.com](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variables in site settings
7. Deploy

**Build Settings**:
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3: GitHub Pages

**Pros**: Free, integrated with GitHub, easy setup

#### Setup

1. Install gh-pages package:

```bash
npm install --save-dev gh-pages
```

2. Add deploy script to `package.json`:

```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

3. Configure Vite for GitHub Pages:

```js
// vite.config.js
export default defineConfig({
  base: '/squad-flight-finder/', // Replace with your repo name
  plugins: [react()],
})
```

4. Deploy:

```bash
npm run deploy
```

5. Enable GitHub Pages in repository settings:
   - Settings → Pages
   - Source: gh-pages branch
   - Root directory

**Limitations**:
- Static sites only (no serverless functions)
- Custom domain requires CNAME file
- HTTPS on custom domains requires verification

### Option 4: AWS S3 + CloudFront

**Pros**: Scalable, CDN included, full control

#### Setup

1. Create S3 bucket
2. Enable static website hosting
3. Upload `/dist` files
4. Create CloudFront distribution
5. Point to S3 bucket
6. Configure custom domain (optional)

**Build and Upload**:

```bash
npm run build
aws s3 sync dist/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Option 5: Custom Server

**Pros**: Full control, can add backend later

#### Using nginx

```nginx
server {
    listen 80;
    server_name squadflightfinder.com;

    root /var/www/squad-flight-finder/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Using Apache

```apache
<VirtualHost *:80>
    ServerName squadflightfinder.com
    DocumentRoot /var/www/squad-flight-finder/dist

    <Directory /var/www/squad-flight-finder/dist>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted

        # SPA routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

## Post-Deployment

### 1. Verify Deployment

✅ **Checklist**:
- [ ] Site loads without errors
- [ ] Search functionality works
- [ ] API calls succeed
- [ ] Analytics tracking works
- [ ] All pages/routes accessible
- [ ] Mobile responsive
- [ ] Performance acceptable (Lighthouse score > 90)

### 2. Monitor Application

**Tools**:
- **Google Analytics**: User behavior and traffic
- **Sentry** (optional): Error tracking
- **Lighthouse**: Performance monitoring
- **Uptime monitoring**: (e.g., UptimeRobot, Pingdom)

### 3. Set Up Custom Domain (Optional)

#### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS records as instructed

#### Netlify
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Configure DNS records

### 4. Enable HTTPS

Most hosting platforms provide free SSL certificates via Let's Encrypt automatically.

**For custom servers**:
```bash
# Using Certbot for nginx
sudo certbot --nginx -d squadflightfinder.com
```

### 5. Configure Analytics

Verify Google Analytics is receiving data:
1. Visit your deployed site
2. Open Google Analytics Real-Time view
3. Confirm events are being tracked

## Troubleshooting

### Build Fails

**Issue**: `npm run build` fails

**Solutions**:
1. Clear node_modules: `rm -rf node_modules && npm install`
2. Clear cache: `rm -rf dist && npm run build`
3. Check Node version: `node --version` (must be v18+)
4. Review error messages for missing dependencies

### Environment Variables Not Working

**Issue**: API calls fail in production

**Solutions**:
1. Verify environment variables are set on hosting platform
2. Ensure variables start with `VITE_` prefix
3. Rebuild after adding environment variables
4. Check browser console for actual API errors

### Routing Issues (404 on Refresh)

**Issue**: Page refreshes show 404 errors

**Solution**: Configure SPA routing

**Vercel**: Auto-configured
**Netlify**: Add `_redirects` file:
```
/*    /index.html   200
```

**GitHub Pages**: Add `404.html` that redirects to `index.html`

### Performance Issues

**Issue**: Slow loading times

**Solutions**:
1. Enable Gzip compression
2. Configure CDN (CloudFront, Cloudflare)
3. Optimize images
4. Enable caching headers
5. Consider code splitting

### CORS Errors

**Issue**: API calls blocked by CORS

**Current**: Not an issue (Amadeus API supports CORS)
**Future**: If adding backend, configure CORS properly

### Out of API Quota

**Issue**: Amadeus API returns 429 errors

**Solutions**:
1. Check API usage in Amadeus dashboard
2. Implement caching (already implemented)
3. Add rate limiting (already implemented)
4. Apply for production tier with higher limits

## Continuous Deployment

### GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          VITE_AMADEUS_API_KEY: ${{ secrets.VITE_AMADEUS_API_KEY }}
          VITE_AMADEUS_API_SECRET: ${{ secrets.VITE_AMADEUS_API_SECRET }}
          VITE_GA_MEASUREMENT_ID: ${{ secrets.VITE_GA_MEASUREMENT_ID }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

Add secrets to GitHub repository settings.

## Performance Optimization

### Build Optimization

```js
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

### Caching Headers

```nginx
# nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
}

location ~* \.html$ {
    add_header Cache-Control "no-cache, must-revalidate";
}
```

## Rollback Procedure

### Vercel/Netlify
1. Go to Deployments tab
2. Find previous successful deployment
3. Click "Promote to production"

### GitHub Pages
```bash
git revert HEAD
git push origin main
npm run deploy
```

### Custom Server
```bash
# Keep backups of previous builds
cp -r dist dist.backup.$(date +%Y%m%d_%H%M%S)

# To rollback
cp -r dist.backup.YYYYMMDD_HHMMSS dist
```

## Security Checklist

- [ ] API keys secured (backend proxy recommended)
- [ ] HTTPS enabled
- [ ] Content Security Policy configured
- [ ] Environment variables not committed to git
- [ ] .env file in .gitignore
- [ ] Rate limiting implemented
- [ ] Input validation enabled
- [ ] XSS protection in place

## Support

For deployment issues:
1. Check this documentation
2. Review hosting platform docs
3. Search GitHub issues
4. Contact platform support

---

**Last Updated**: 2026-01-18
**Version**: 0.0.0
