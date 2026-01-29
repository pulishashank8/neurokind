
'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CheckRunner() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const runChecks = async () => {
        setLoading(true);
        try {
            // In a real app, this might query the internal Python API directly 
            // or via a Next.js proxy route to avoid CORS if on different ports.
            // For simplicity, we assume we have a Next.js API route acting as proxy.
            const res = await fetch('/api/owner/data-ops/quality-trigger', { method: 'POST' });
            if (res.ok) {
                alert('Checks triggered successfully! Results will appear shortly.');
                router.refresh();
            } else {
                alert('Failed to trigger checks.');
            }
        } catch (e) {
            alert('Error connecting to ML Service.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={runChecks}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-lg shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all"
        >
            <Play size={16} className={loading ? "animate-spin" : ""} />
            {loading ? 'Running ML Models...' : 'Run Quality Checks'}
        </button>
    );
}
