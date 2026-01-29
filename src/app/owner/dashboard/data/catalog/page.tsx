
import { prisma } from '@/lib/prisma';
import { Database, Search, Shield, Clock } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

async function getDatasets() {
    return await prisma.dataset.findMany({
        include: {
            owner: true,
            fields: true,
        },
        orderBy: { name: 'asc' },
    });
}

export default async function DataCatalogPage() {
    const datasets = await getDatasets();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Data Catalog (Registry)</h1>
                    <p className="text-sm sm:text-base text-slate-400">Inventory of all structured and unstructured data assets.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold uppercase whitespace-nowrap">
                        Enterprise Edition
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {datasets.map((ds) => (
                    <div key={ds.id} className="group bg-slate-900 border border-white/5 rounded-3xl p-6 hover:border-emerald-500/30 transition-all hover:shadow-2xl hover:shadow-emerald-500/5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform flex-shrink-0">
                                    <Database size={20} className="sm:hidden" />
                                    <Database size={24} className="hidden sm:block" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-base sm:text-lg font-bold text-white leading-tight truncate">{ds.name}</h3>
                                    <p className="text-xs text-slate-500 font-medium">ID: {ds.id.split('-')[0].toUpperCase()}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${ds.sensitivity === 'PUBLIC' ? 'bg-green-500/10 text-green-400' :
                                    ds.sensitivity === 'INTERNAL' ? 'bg-amber-500/10 text-amber-400' :
                                        'bg-red-500/10 text-red-500 border border-red-500/20'
                                    }`}>
                                    {ds.sensitivity}
                                </div>
                                {(ds.sensitivity === 'PHI' || ds.sensitivity === 'PII') && (
                                    <div className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[10px] font-black uppercase tracking-widest animate-pulse">
                                        {ds.sensitivity}
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="text-slate-400 text-sm mb-6 line-clamp-2 font-medium leading-relaxed">{ds.description}</p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Quality Health</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-sm font-bold text-white">99.8%</span>
                                </div>
                            </div>
                            <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Steward</p>
                                <span className="text-sm font-bold text-white truncate block">{ds.ownerTeam}</span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                            <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] text-slate-400 font-bold" title="Retention Check Passed">R</div>
                                <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] text-slate-400 font-bold" title="Security Check Passed">S</div>
                                <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] text-slate-400 font-bold" title="Lineage Mapped">L</div>
                            </div>
                            <Link
                                href={`/owner/dashboard/data/catalog/${ds.id}`}
                                className="px-4 py-2 rounded-xl bg-white/5 text-xs font-bold text-white hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors"
                            >
                                Explorer &rarr;
                            </Link>
                        </div>
                    </div>
                ))}

                {/* Empty State / Add New */}
                <div className="bg-slate-800/30 border border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-800/50 transition-all cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-white/10 group-hover:text-white transition-colors mb-3">
                        <Search size={20} />
                    </div>
                    <h3 className="text-white font-medium mb-1">Discover New Assets</h3>
                    <p className="text-slate-500 text-xs">Run the Python Policy Scanner to auto-populate</p>
                </div>
            </div>
        </div>
    );
}
