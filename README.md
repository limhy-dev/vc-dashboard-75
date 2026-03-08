# Sales Dashboard

A modern, clean, SaaS-like dashboard built with React, Vite, and Tailwind CSS. The dashboard automatically loads and displays sales data from a local CSV file, providing key performance indicators (KPIs), a performance chart, and a detailed transaction table.

## Features

- **Modern UI**: Sleek, responsive design with clear typography and carefully chosen color palettes for a premium feel.
- **KPI Cards**: Instantly view critical metrics at a glance:
  - Total Revenue
  - Total Orders
  - Total Profit
  - Average Order Value (AOV)
- **Interactive Chart**: A daily Revenue vs. Profit Area Chart built with Recharts, complete with gradients and tooltips.
- **Detailed Transactions Table**: A complete view of all rows from the dataset that looks clean and highlights profit margins.
- **Backend API Layer**: A dedicated Express.js backend serves structured JSON data to the frontend at `/api/sales`.
- **Dual Data Sources**: Seamlessly toggle between parsing a local CSV file or fetching from a live **Supabase** Postgres database.
## Tech Stack

- **Framework**: React (Bootstrapped with Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **Data Visualization**: Recharts
- **Backend**: Node.js, Express, Supabase (PostgreSQL)
- **Data Parsing**: PapaParse (CSV fallback)

## Getting Started

### Prerequisites

- Node.js (v16.0 or higher)
- npm or yarn

### Installation

1. **Clone or Download** the repository to your local machine.
2. **Navigate** into the project directory:
   ```bash
   cd vc-dashboard
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   ```

### Running the App

To start the local development server:

```bash
npm run dev
```

> **Note for Windows Users:** If you get an error like *"npm.ps1 cannot be loaded because running scripts is disabled on this system"*, you can either:
> 1. Run it via command prompt: `cmd /c "npm run dev"`
> 2. Or, change your PowerShell execution policy by running PowerShell as Administrator and entering: `Set-ExecutionPolicy RemoteSigned`

Open your browser and navigate to the URL provided in the terminal (typically `http://localhost:5173/`).

### Building for Production

To create a production-ready build:

```bash
npm run build
```
The compiled static files will be placed in the `dist/` directory, ready to be deployed to any static host.

## Data Sources

The backend API is configured to read data from a local CSV by default, but is fully ready to connect to Supabase.

1. Go to Supabase and create a new project.
2. In the SQL Editor, create the sales_data table by running this SQL snippet:
   ```sql
   CREATE TABLE sales_data (
     id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
     date text NOT NULL,
     product text NOT NULL,
     channel text NOT NULL,
     orders integer NOT NULL DEFAULT 0,
     revenue numeric NOT NULL DEFAULT 0,
     cost numeric NOT NULL DEFAULT 0,
     visitors integer NOT NULL DEFAULT 0,
     customers integer NOT NULL DEFAULT 0
   );
   ```
3. Import your CSV data into this table via the Supabase Table Editor.
4. Go to Project Settings -> API to get your URL and Anon Key.
5. In your local `.env` file, add your credentials and set the DATA_SOURCE:
   ```env
   DATA_SOURCE=supabase
   SUPABASE_URL=your_project_url
   SUPABASE_ANON_KEY=your_anon_key
   ```
6. Restart your development server. The API will now serve data directly from Supabase!
