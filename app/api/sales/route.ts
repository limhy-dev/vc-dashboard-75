import { NextResponse } from 'next/server';
import { getSalesData } from '../../../lib/salesData';

export async function GET() {
    try {
        const data = await getSalesData();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("API error:", err);
        return NextResponse.json({ error: err.message || 'Internal server error while fetching sales data.' }, { status: 500 });
    }
}
