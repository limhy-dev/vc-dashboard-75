# Production Deployment Guide (Vercel)

Your dashboard has been upgraded to **Next.js (App Router)**. This is the gold standard for deploying to Vercel, as it handles your API routes and Frontend in a single, high-performance package.

## 1. Environment Variables Configuration

Before deploying, you must set up the following environment variables in the **Vercel Project Dashboard** (Settings -> Environment Variables):

| Variable Name | Description | Value Example |
| :--- | :--- | :--- |
| `VITE_GEMINI_API_KEY` | Your Gemini Secret Key | `AIzaSy...` |
| `DATA_SOURCE` | Toggle between CSV or Database | `supabase` or `csv` |
| `SUPABASE_URL` | Your Supabase Project URL | `https://xyz.supabase.co` |
| `SUPABASE_ANON_KEY` | Your Supabase Anon Key | `eyJhb...` |

> [!IMPORTANT]
> Since we moved the Gemini logic to a **Server-Side API Route**, your API key is now 100% hidden from the browser. It never leaves Vercel's secure servers.

## 2. Deployment Steps

1. **Push to GitHub**:
   Since I've already initialized your Git repository, just run:
   ```bash
   git add .
   git commit -m "Migrate to Next.js App Router for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com/) and click **"Add New Project"**.
   - Import your `vc-dashboard-75` repository.
   - Expand the **Environment Variables** section and paste the keys listed above.
   - Click **Deploy**.

3. **Verify**:
   Vercel will build the project in about 1-2 minutes. Once finished, your dashboard will be available at a public `xxxx.vercel.app` URL!

## 3. Local Development

To run this new Next.js version locally:
```bash
npm run dev
```
The dashboard will be available at `http://localhost:3000`.
