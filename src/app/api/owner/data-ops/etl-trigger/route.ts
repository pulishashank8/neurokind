
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const res = await fetch('http://127.0.0.1:8000/api/jobs/etl/daily', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!res.ok) {
            throw new Error('Python service returned ' + res.status);
        }

        const data = await res.json();
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Failed to trigger ETL:", error);
        return NextResponse.json({ success: false, error: 'Failed to connect to Service' }, { status: 500 });
    }
}
