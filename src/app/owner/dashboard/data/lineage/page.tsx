
import { prisma } from '@/lib/prisma';
import { Database, ArrowRight, Share2, FileText, BarChart, Server, Zap, Shield, GitBranch } from 'lucide-react';

async function getLineage() {
    return await prisma.dataLineageNode.findMany({
        include: {
            upcomingEdges: {
                include: { targetNode: true }
            }
        },
        orderBy: { name: 'asc' }
    });
}

export default async function DataLineagePage() {
    const nodes = await getLineage();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Data <span className="text-emerald-400 font-black tracking-widest uppercase">Lineage</span> Mapping</h1>
                    <p className="text-slate-400 font-medium leading-relaxed">End-to-end traceability of information flow from acquisition to insight.</p>
                </div>
                <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <Shield size={14} /> HIPAA COMPLIANT FLOW
                </div>
            </div>

            {/* Lineage Breakdown */}
            <div className="grid grid-cols-1 gap-12 relative py-8">
                {/* Visual Connector Line (Vertical) */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent hidden lg:block"></div>

                {/* Categories */}
                {['SOURCE', 'PROCESS', 'STORE', 'REPORT'].map((category, catIdx) => (
                    <div key={category} className="space-y-6 relative z-10">
                        <div className="flex items-center justify-center">
                            <span className="px-6 py-2 bg-slate-900 border border-white/5 rounded-full text-xs font-black text-slate-500 tracking-[0.3em] uppercase shadow-2xl">
                                {category} STAGE
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {nodes.filter(n => n.type === category).map((node) => (
                                <div key={node.id} className="group bg-slate-900 border border-white/5 rounded-3xl p-6 hover:border-emerald-500/30 transition-all hover:scale-[1.02] shadow-xl">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${category === 'SOURCE' ? 'bg-blue-500/10 text-blue-400' :
                                                category === 'PROCESS' ? 'bg-amber-500/10 text-amber-400' :
                                                    category === 'STORE' ? 'bg-emerald-500/10 text-emerald-400' :
                                                        'bg-purple-500/10 text-purple-400'
                                            }`}>
                                            {category === 'SOURCE' && <Server size={24} />}
                                            {category === 'PROCESS' && <Zap size={24} />}
                                            {category === 'STORE' && <Database size={24} />}
                                            {category === 'REPORT' && <BarChart size={24} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-bold truncate group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{node.name}</h3>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ID: {node.id.split('-')[0]}</p>
                                        </div>
                                    </div>

                                    {/* Edges / Connections */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-white/5 pb-1 flex items-center gap-2">
                                            <Share2 size={10} /> Downstream Flow
                                        </p>
                                        {node.upcomingEdges.map((edge) => (
                                            <div key={edge.id} className="flex items-center gap-2 group/edge">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover/edge:bg-emerald-500 transition-colors"></div>
                                                <ArrowRight size={12} className="text-slate-600 group-hover/edge:text-emerald-400 transition-all group-hover/edge:translate-x-1" />
                                                <span className="text-xs font-bold text-slate-400 group-hover/edge:text-white transition-colors">{edge.targetNode.name}</span>
                                            </div>
                                        ))}
                                        {node.upcomingEdges.length === 0 && (
                                            <p className="text-xs font-medium text-slate-600 italic">Endpoint Asset</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {nodes.length === 0 && (
                    <div className="py-24 text-center">
                        <GitBranch size={48} className="mx-auto text-slate-700 mb-4" />
                        <p className="text-lg font-bold text-white uppercase tracking-[0.2em]">Map is Offline</p>
                        <p className="text-slate-500 font-medium">Initialize lineage scanning in the Data Trust Center.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
