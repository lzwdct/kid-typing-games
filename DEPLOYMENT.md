# Deployment Guide - Cloudflare Pages

This guide will help you deploy the Kids English Typing Game to Cloudflare Pages with Workers AI.

## Prerequisites

1. A Cloudflare account (free tier is fine)
2. Wrangler CLI installed (already included in dev dependencies)
3. Your code pushed to a Git repository (GitHub, GitLab, etc.)

## Option 1: Deploy via Cloudflare Dashboard (Recommended)

### Step 1: Push to Git

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GIT_REPO_URL
git push -u origin main
```

### Step 2: Connect to Cloudflare Pages

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**
3. Select your repository
4. Configure build settings:
   - **Framework preset**: Next.js
   - **Build command**: `npx @cloudflare/next-on-pages`
   - **Build output directory**: `.vercel/output/static`
   - **Node version**: 18 or higher

### Step 3: Configure Environment Variables

In your Cloudflare Pages project settings:

1. Go to **Settings** > **Environment variables**
2. Add:
   ```
   NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN=your_token_here
   ```

### Step 4: Enable Workers AI Binding

1. Go to **Settings** > **Functions**
2. Add **AI Binding**:
   - Binding name: `AI`
   - Enable Workers AI

### Step 5: Deploy

Click **Save and Deploy**. Your app will be live at `https://kids-typing-game.pages.dev`

## Option 2: Deploy via CLI

### Step 1: Login to Cloudflare

```bash
npx wrangler login
```

### Step 2: Build the Project

```bash
npm run pages:build
```

### Step 3: Deploy

```bash
npm run deploy
```

Or manually:

```bash
npx wrangler pages deploy .vercel/output/static --project-name=kids-typing-game
```

### Step 4: Configure AI Binding

After first deployment, you need to add the AI binding via the dashboard:

1. Go to your project in Cloudflare Dashboard
2. **Settings** > **Functions** > **AI Bindings**
3. Add binding with name: `AI`

### Step 5: Set Environment Variables

```bash
npx wrangler pages secret put NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN
# Enter your token when prompted
```

Or set via dashboard as described in Option 1.

## Get Your Analytics Token

1. Go to https://dash.cloudflare.com/
2. Navigate to: **Account** > **Analytics & Logs** > **Web Analytics**
3. Click **Add a site**
4. Enter your site details
5. Copy the token from the setup code

## Verify Deployment

1. Visit your deployed URL
2. Test both game modes (Acid Rain and Spelling Bloom)
3. Check browser console for any errors
4. Verify words are being generated (check Network tab for `/api/generate` calls)

## Troubleshooting

### AI Binding Not Working

If you see "AI not available" in logs:
- Make sure AI binding is configured in Cloudflare Dashboard
- Binding name must be exactly `AI`
- Check Functions settings in your Pages project

### Build Fails

- Ensure Node.js version is 18+
- Clear build cache in Cloudflare Dashboard
- Check build logs for specific errors

### Analytics Not Showing

- Token must start with `NEXT_PUBLIC_` to be available in browser
- Check browser console for analytics errors
- Verify token is correct in environment variables

## Custom Domain

1. Go to **Custom domains** in your Pages project
2. Add your domain
3. Update DNS records as instructed
4. Wait for SSL certificate provisioning (automatic)

## Updates

To deploy updates:

### Via Dashboard:
- Push to your Git repository
- Cloudflare automatically rebuilds and deploys

### Via CLI:
```bash
npm run deploy
```

## Performance Tips

- Enable **Cloudflare Cache** for static assets
- Use **Cloudflare CDN** for global distribution
- Monitor usage in **Analytics** dashboard
- Check **Workers AI** usage in billing section

## Cost

- Cloudflare Pages: Free (500 builds/month)
- Workers AI: Free tier available
- Web Analytics: Free

Happy deploying! 🚀
