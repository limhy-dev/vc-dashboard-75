import express from 'express';
import cors from 'cors';
import { getSalesData } from './dataLayer.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());

app.get('/api/sales', async (req, res) => {
    try {
        const data = await getSalesData();
        res.json(data);
    } catch (err) {
        console.error("API error:", err);
        res.status(500).json({ error: err.message || 'Internal server error while fetching sales data.' });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`API server is running on http://localhost:${PORT}`);
});
