
import { prisma } from '@/lib/prisma';
import { Play, CheckCircle, XCircle, Clock, Terminal } from 'lucide-react';
import { format } from 'date-fns';
import JobTrigger from './job-trigger';

async function getJobs() {
    return await prisma.jobExecution.findMany({
        take: 20,
        orderBy: { startedAt: 'desc' },
    });
}

export default async function PipelinesPage() {
    const jobs = await getJobs();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Pipeline Monitoring</h1>
                    <p className="text-slate-400">Status of internal ETL jobs and background processes.</p>
                </div>
                <JobTrigger />
            </div>

            <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden font-mono text-sm">
                {jobs.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        No job execution logs found. Run a job to see activity.
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {jobs.map((job) => (
                            <div key={job.id} className="p-4 hover:bg-white/5 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        {job.status === 'SUCCESS' && <CheckCircle size={16} className="text-emerald-400" />}
                                        {job.status === 'FAILED' && <XCircle size={16} className="text-red-400" />}
                                        {job.status === 'RUNNING' && <Clock size={16} className="text-blue-400 animate-pulse" />}
                                        <span className="font-bold text-slate-200">{job.jobName}</span>
                                    </div>
                                    <span className="text-xs text-slate-500">{format(job.startedAt, 'MMM d, HH:mm:ss')}</span>
                                </div>
                                <div className="pl-7 grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">Records Processed</div>
                                        <div className="text-slate-300">{job.recordsProcessed}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">Source</div>
                                        <div className="text-slate-300">{job.source || 'Unknown'}</div>
                                    </div>
                                </div>
                                {job.status === 'FAILED' && job.errorLog && (
                                    <div className="mt-3 pl-7">
                                        <div className="bg-red-500/10 border border-red-500/20 rounded p-3 text-red-300 text-xs overflow-x-auto">
                                            <div className="flex items-center gap-2 mb-1 text-red-400 font-bold uppercase tracking-wider">
                                                <Terminal size={12} /> Error Log
                                            </div>
                                            {job.errorLog}
                                        </div>
                                    </div>
                                )}
                                {job.metadata && (
                                    <div className="mt-3 pl-7">
                                        <pre className="text-[10px] text-slate-500 overflow-x-auto">
                                            {JSON.stringify(job.metadata, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
