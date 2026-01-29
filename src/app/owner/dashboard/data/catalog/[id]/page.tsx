import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
    Database, Shield, ArrowLeft, Clock, User, FileText, CheckCircle,
    AlertTriangle, Lock, Eye, Layers, Tag, Calendar, BarChart
} from 'lucide-react';
import { format } from 'date-fns';

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getDataset(id: string) {
    const dataset = await prisma.dataset.findUnique({
        where: { id },
        include: {
            fields: {
                orderBy: { name: 'asc' },
            },
            owner: true,
            qualityRules: {
                where: { isActive: true },
                include: {
                    executions: {
                        orderBy: { runDate: 'desc' },
                        take: 1,
                    }
                }
            },
            glossaryTerms: {
                include: { term: true }
            },
        },
    });
    return dataset;
}

export default async function DatasetDetailPage({ params }: PageProps) {
    const { id } = await params;
    const dataset = await getDataset(id);

    if (!dataset) {
        notFound();
    }

    const sensitivityColors: Record<string, string> = {
        'PHI': 'bg-red-500/10 text-red-500 border-red-500/20',
        'PII': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        'SENSITIVE': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        'INTERNAL': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        'PUBLIC': 'bg-green-500/10 text-green-500 border-green-500/20',
    };

    const passedRules = dataset.qualityRules.filter(
        r => r.executions[0]?.status === 'PASS'
    ).length;
    const totalRules = dataset.qualityRules.length;
    const qualityScore = totalRules > 0 ? Math.round((passedRules / totalRules) * 100) : 100;

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Back Button & Header */}
            <div className="flex flex-col gap-4 sm:gap-6">
                <Link
                    href="/owner/dashboard/data/catalog"
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-fit"
                >
                    <ArrowLeft size={16} />
                    <span className="text-sm font-medium">Back to Catalog</span>
                </Link>

                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 sm:gap-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                            <Database className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2 break-words">{dataset.name}</h1>
                            <p className="text-sm sm:text-base text-slate-400 max-w-2xl">{dataset.description}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest border ${sensitivityColors[dataset.sensitivity]}`}>
                            {dataset.sensitivity}
                        </div>
                        {(dataset.sensitivity === 'PHI' || dataset.sensitivity === 'PII') && (
                            <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-red-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
                                <Lock size={10} className="sm:hidden" />
                                <Lock size={12} className="hidden sm:block" />
                                Protected Data
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Metadata Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <div className="bg-slate-900 border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3 sm:mb-4">
                        <BarChart className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h4 className="text-slate-400 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-1">Quality Score</h4>
                    <p className="text-2xl sm:text-3xl font-black text-white">{qualityScore}%</p>
                    <p className="text-slate-500 text-[10px] sm:text-xs font-medium mt-1 sm:mt-2">
                        {passedRules}/{totalRules} rules passing
                    </p>
                </div>

                <div className="bg-slate-900 border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-3 sm:mb-4">
                        <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h4 className="text-slate-400 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-1">Total Fields</h4>
                    <p className="text-2xl sm:text-3xl font-black text-white">{dataset.fields.length}</p>
                    <p className="text-slate-500 text-[10px] sm:text-xs font-medium mt-1 sm:mt-2">
                        {dataset.fields.filter(f => f.sensitivity === 'PHI' || f.sensitivity === 'PII').length} sensitive
                    </p>
                </div>

                <div className="bg-slate-900 border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400 mb-3 sm:mb-4">
                        <User className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h4 className="text-slate-400 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-1">Data Steward</h4>
                    <p className="text-sm sm:text-lg font-bold text-white truncate">{dataset.ownerTeam}</p>
                    <p className="text-slate-500 text-[10px] sm:text-xs font-medium mt-1 sm:mt-2 truncate">
                        {dataset.owner?.contactEmail || 'Contact configured'}
                    </p>
                </div>

                <div className="bg-slate-900 border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-3 sm:mb-4">
                        <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h4 className="text-slate-400 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-1">Retention</h4>
                    <p className="text-sm sm:text-lg font-bold text-white">{dataset.retentionPolicy || 'Not set'}</p>
                    <p className="text-slate-500 text-[10px] sm:text-xs font-medium mt-1 sm:mt-2">
                        Update: {dataset.updateFrequency || 'As needed'}
                    </p>
                </div>
            </div>

            {/* Field Schema */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="p-4 sm:p-8 border-b border-white/5 bg-white/[0.01]">
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">Field Schema</h3>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">Complete column-level documentation with sensitivity classification</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead>
                            <tr className="bg-white/[0.02]">
                                <th className="px-4 sm:px-8 py-3 sm:py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Field Name</th>
                                <th className="px-4 sm:px-8 py-3 sm:py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Type</th>
                                <th className="px-4 sm:px-8 py-3 sm:py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Sensitivity</th>
                                <th className="px-4 sm:px-8 py-3 sm:py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Nullable</th>
                                <th className="px-4 sm:px-8 py-3 sm:py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {dataset.fields.map((field) => (
                                <tr key={field.id} className="hover:bg-emerald-500/[0.02] transition-colors">
                                    <td className="px-4 sm:px-8 py-3 sm:py-5">
                                        <code className="text-xs sm:text-sm font-bold text-white bg-white/5 px-2 py-1 rounded">
                                            {field.name}
                                        </code>
                                    </td>
                                    <td className="px-4 sm:px-8 py-3 sm:py-5">
                                        <span className="text-xs sm:text-sm text-slate-400">{field.type}</span>
                                    </td>
                                    <td className="px-4 sm:px-8 py-3 sm:py-5">
                                        <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${sensitivityColors[field.sensitivity]}`}>
                                            {field.sensitivity}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-8 py-3 sm:py-5">
                                        {field.isNullable ? (
                                            <span className="text-slate-500 text-xs sm:text-sm">Yes</span>
                                        ) : (
                                            <span className="text-emerald-400 text-xs sm:text-sm font-bold">Required</span>
                                        )}
                                    </td>
                                    <td className="px-4 sm:px-8 py-3 sm:py-5">
                                        <span className="text-xs sm:text-sm text-slate-400">{field.description}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quality Rules */}
            {dataset.qualityRules.length > 0 && (
                <div className="bg-slate-900 border border-white/5 rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="p-4 sm:p-8 border-b border-white/5 bg-white/[0.01]">
                        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">Active Quality Rules</h3>
                        <p className="text-slate-500 text-xs sm:text-sm mt-1">Automated validation rules protecting data integrity</p>
                    </div>
                    <div className="p-4 sm:p-8 grid gap-3 sm:gap-4">
                        {dataset.qualityRules.map((rule) => {
                            const lastResult = rule.executions[0];
                            const isPassing = lastResult?.status === 'PASS';

                            return (
                                <div
                                    key={rule.id}
                                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border ${isPassing ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
                                        }`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                                            {isPassing ? (
                                                <CheckCircle size={18} className="text-emerald-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                                            ) : (
                                                <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                                            )}
                                            <div className="min-w-0">
                                                <h4 className="text-white font-bold text-sm sm:text-base">{rule.name}</h4>
                                                <p className="text-slate-500 text-xs line-clamp-2">{rule.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                                            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white/5 text-slate-400">
                                                {rule.ruleType}
                                            </span>
                                            <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${rule.severity === 'CRITICAL'
                                                    ? 'bg-red-500/10 text-red-400'
                                                    : 'bg-amber-500/10 text-amber-400'
                                                }`}>
                                                {rule.severity}
                                            </span>
                                        </div>
                                    </div>
                                    {lastResult && (
                                        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/5 flex flex-wrap gap-3 sm:gap-6 text-[10px] sm:text-xs text-slate-500">
                                            <span>Last run: {format(lastResult.runDate, 'MMM d, HH:mm')}</span>
                                            <span>Records: {lastResult.recordsChecked.toLocaleString()}</span>
                                            {lastResult.failuresFound > 0 && (
                                                <span className="text-red-400">Failures: {lastResult.failuresFound}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Glossary Terms */}
            {dataset.glossaryTerms.length > 0 && (
                <div className="bg-slate-900 border border-white/5 rounded-3xl p-8">
                    <h3 className="text-xl font-bold text-white mb-6 tracking-tight">Business Glossary Terms</h3>
                    <div className="flex flex-wrap gap-3">
                        {dataset.glossaryTerms.map((gt) => (
                            <div
                                key={gt.id}
                                className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 hover:border-emerald-500/30 transition-colors"
                                title={gt.term.definition}
                            >
                                <span className="text-sm font-bold text-white">{gt.term.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tags */}
            {dataset.tags && dataset.tags.length > 0 && (
                <div className="flex items-center gap-4">
                    <Tag size={16} className="text-slate-500" />
                    <div className="flex flex-wrap gap-2">
                        {dataset.tags.map((tag, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-slate-400"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
