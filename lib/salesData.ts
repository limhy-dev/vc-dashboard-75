import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client (if keys are provided)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export async function getSalesData() {
    const dataSource = process.env.DATA_SOURCE || 'csv';

    // Attempt to read from Supabase
    if (dataSource.toLowerCase() === 'supabase') {
        if (!supabase) {
            throw new Error('Supabase URL or Anon Key is missing in environment variables. Data source is set to supabase.');
        }

        const { data: sales, error } = await supabase
            .from('sales_data')
            .select('*')
            .order('date', { ascending: true });

        if (error) {
            console.error("Supabase fetch failed", error);
            throw new Error('Error fetching from Supabase database.');
        }

        return sales.map(row => ({
            ...row,
            orders: Number(row.orders) || 0,
            revenue: Number(row.revenue) || 0,
            cost: Number(row.cost) || 0,
            visitors: Number(row.visitors) || 0,
            customers: Number(row.customers) || 0,
        }));
    }

    // Fallback to CSV (Server-side compatible)
    const filePath = path.join(process.cwd(), 'public', 'data', 'sales_data.csv');
    const csvString = fs.readFileSync(filePath, 'utf8');

    return new Promise((resolve, reject) => {
        Papa.parse(csvString, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
                const parsedData = results.data.map((row: any) => ({
                    ...row,
                    orders: Number(row.orders) || 0,
                    revenue: Number(row.revenue) || 0,
                    cost: Number(row.cost) || 0,
                }));
                resolve(parsedData);
            },
            error: (err: any) => {
                reject(new Error('Failed to parse CSV'));
            }
        });
    });
}
