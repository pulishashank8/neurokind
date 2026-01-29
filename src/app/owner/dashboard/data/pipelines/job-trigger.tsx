
'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function JobTrigger() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const runETL = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/owner/data-ops/etl-trigger', { method: 'POST' });
            if (res.ok) {
                router.refresh();
            } else {
                alert('Failed to trigger ETL job.');
            }
        } catch {
            alert('Error connecting to Service.');
        } finally {
            setTimeout(() => {
                setLoading(false);
                router.refresh(); // Refresh again after a delay to catch quick jobs
            }, 2000);
        }
    };

    return (
        <button
            onClick={runETL}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all"
        >
            <Play size={16} className={loading ? "animate-spin" : ""} />
            {loading ? 'Running ETL...' : 'Run Daily Analytics Job'}
        </button>
    );
}
