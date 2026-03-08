import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase Client (if keys are provided)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * Reads from either Supabase or falls back to CSV depending on env configurations.
 */
export async function getSalesData() {
    const dataSource = process.env.DATA_SOURCE || 'csv';

    // Attempt to read from Supabase
    if (dataSource.toLowerCase() === 'supabase') {
        if (!supabase) {
            throw new Error('Supabase URL or Anon Key is missing in the .env file. Data source is set to supabase.');
        }

        const { data: sales, error } = await supabase
            .from('sales_data')
            .select('*')
            .order('date', { ascending: true });

        if (error) {
            console.error("Supabase fetch failed", error);
            throw new Error('Error fetching from Supabase database.');
        }

        // Ensures we return consistent numbers as the CSV does
        return sales.map(row => ({
            ...row,
            orders: Number(row.orders) || 0,
            revenue: Number(row.revenue) || 0,
            cost: Number(row.cost) || 0,
            visitors: Number(row.visitors) || 0,
            customers: Number(row.customers) || 0,
        }));
    }

    // Fallback to CSV
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, 'public', 'data', 'sales_data.csv');
        try {
            const csvString = fs.readFileSync(filePath, 'utf8');
            Papa.parse(csvString, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const parsedData = results.data.map((row) => ({
                        ...row,
                        orders: Number(row.orders) || 0,
                        revenue: Number(row.revenue) || 0,
                        cost: Number(row.cost) || 0,
                    }));
                    resolve(parsedData);
                },
                error: (err) => {
                    reject(new Error('Failed to parse CSV'));
                }
            });
        } catch (err) {
            reject(new Error('Failed to read CSV file'));
        }
    });
}
