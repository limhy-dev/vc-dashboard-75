# Sales BI Dashboard (Next.js Edition)

A premium Business Intelligence dashboard built with **Next.js (App Router)** and **Tailwind CSS**, featuring real-time data visualization and **Gemini AI** strategy insights.

## 🚀 Deployment Status: Ready for Vercel

This project is optimized for deployment on Vercel. 
- **Next.js App Router**: Utilizing the latest React server components and API routes.
- **Server-Side AI**: Gemini API calls are handled securely on the server (Vercel Functions).
- **Flexible Data**: Seamlessly toggle between local CSV data and a live **Supabase** database.

## 🛠 Features

- **KPI Engine**: Real-time calculation of Revenue, Profit, Orders, and AOV.
- **AI Strategy Insights**: Connects to Gemini (3.1 Flash/Pro) to generate Alerts, Opportunities, and Suggestions.
- **Dynamic Charts**: Interactive performance trends using Recharts.
- **Modern UI**: Clean, SaaS-inspired design with dark-mode support and mobile responsiveness.

## 📦 Setup & Installation

1. **Clone & Install**:
   ```bash
   git clone [your-repo-url]
   cd vc-dashboard
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file (or set these in Vercel):
   ```env
   VITE_GEMINI_API_KEY="your_gemini_key"
   DATA_SOURCE="csv" # or "supabase"
   SUPABASE_URL="your_url"
   SUPABASE_ANON_KEY="your_key"
   ```

3. **Development**:
   ```bash
   npm run dev
   ```

## 🌍 Production

For step-by-step production deployment instructions, please refer to:
[**production.md**](file:///c:/Users/USER/vc-dashboard/production.md)

---
*Built with ❤️ for Business Intelligence.*
