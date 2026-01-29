import { prisma } from '@/lib/prisma';
import { Users, Database, Shield, CheckCircle, AlertTriangle, Mail, Clock, Award, TrendingUp } from 'lucide-react';

interface DataOwnerWithDatasets {
    id: string;
    teamName: string;
    contactEmail: string;
    slackChannel: string | null;
    datasets: Array<{
        id: string;
        name: string;
        sensitivity: string;
        qualityRules: Array<{ id: string }>;
    }>;
}

async function getStewardshipData() {
    // Get all data owners with their datasets
    const owners = await prisma.dataOwner.findMany({
        include: {
            datasets: {
                include: {
                    qualityRules: {
                        where: { isActive: true },
                        select: { id: true },
                    },
                },
            },
        },
        orderBy: { teamName: 'asc' },
    }) as DataOwnerWithDatasets[];

    // Calculate stewardship metrics
    const totalDatasets = await prisma.dataset.count();
    // All datasets have owners (ownerTeam is required in schema)
    const datasetsWithOwner = totalDatasets;
    const ownershipCoverage = totalDatasets > 0
        ? Math.round((datasetsWithOwner / totalDatasets) * 100)
        : 0;

    return { owners, totalDatasets, datasetsWithOwner, ownershipCoverage };
}

export default async function DataStewardshipPage() {
    const { owners, totalDatasets, datasetsWithOwner, ownershipCoverage } = await getStewardshipData();

    // Calculate team-level statistics
    const teamStats = owners.reduce((acc, owner) => {
        const team = owner.teamName || 'Unassigned';
        if (!acc[team]) {
            acc[team] = { datasets: 0, phiCount: 0, owners: 1 };
        } else {
            acc[team].owners += 1;
        }
        acc[team].datasets += owner.datasets.length;
        acc[team].phiCount += owner.datasets.filter(d => d.sensitivity === 'PHI').length;
        return acc;
    }, {} as Record<string, { datasets: number; phiCount: number; owners: number }>);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        Data <span className="text-emerald-400 font-black tracking-widest uppercase">Stewardship</span>
                    </h1>
                    <p className="text-slate-400 font-medium leading-relaxed">
                        Accountability framework for healthcare data ownership and governance responsibilities.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`px-5 py-3 rounded-2xl border text-sm font-bold flex items-center gap-3 ${
                        ownershipCoverage >= 90
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : ownershipCoverage >= 70
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                        <Award size={18} />
                        <span className="uppercase tracking-widest text-xs">Ownership Coverage:</span>
                        <span className="text-2xl font-black">{ownershipCoverage}%</span>
                    </div>
                </div>
            </div>

            {/* Stewardship Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-900 border border-white/5 rounded-3xl p-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
                        <Users size={24} />
                    </div>
                    <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Data Stewards</h4>
                    <p className="text-3xl font-black text-white">{owners.length}</p>
                    <p className="text-slate-500 text-xs font-medium mt-2">
                        Assigned teams
                    </p>
                </div>

                <div className="bg-slate-900 border border-white/5 rounded-3xl p-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
                        <Database size={24} />
                    </div>
                    <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Managed Datasets</h4>
                    <p className="text-3xl font-black text-white">{datasetsWithOwner}</p>
                    <p className="text-slate-500 text-xs font-medium mt-2">
                        of {totalDatasets} total datasets
                    </p>
                </div>

                <div className="bg-slate-900 border border-white/5 rounded-3xl p-6">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400 mb-4">
                        <Shield size={24} />
                    </div>
                    <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">PHI Accountability</h4>
                    <p className="text-3xl font-black text-white">
                        {owners.reduce((sum, o) => sum + o.datasets.filter(d => d.sensitivity === 'PHI').length, 0)}
                    </p>
                    <p className="text-slate-500 text-xs font-medium mt-2">
                        PHI datasets with stewards
                    </p>
                </div>

                <div className="bg-slate-900 border border-white/5 rounded-3xl p-6">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4">
                        <TrendingUp size={24} />
                    </div>
                    <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Quality Rules</h4>
                    <p className="text-3xl font-black text-white">
                        {owners.reduce((sum, o) => sum + o.datasets.reduce((ds, d) => ds + d.qualityRules.length, 0), 0)}
                    </p>
                    <p className="text-slate-500 text-xs font-medium mt-2">
                        Active validation rules
                    </p>
                </div>
            </div>

            {/* Team Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-white/5 rounded-3xl p-8">
                    <h3 className="text-xl font-bold text-white mb-6 tracking-tight">Stewardship by Team</h3>
                    <div className="space-y-4">
                        {Object.entries(teamStats).map(([team, stats]) => (
                            <div key={team} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                            <Users size={18} className="text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold">{team}</h4>
                                            <p className="text-slate-500 text-xs">{stats.owners} steward team{stats.owners !== 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-white">{stats.datasets}</p>
                                        <p className="text-slate-500 text-xs">datasets</p>
                                    </div>
                                </div>
                                {stats.phiCount > 0 && (
                                    <div className="flex items-center gap-2 mt-2 text-xs">
                                        <Shield size={12} className="text-red-400" />
                                        <span className="text-red-400 font-bold">{stats.phiCount} PHI datasets</span>
                                    </div>
                                )}
                            </div>
                        ))}
                        {Object.keys(teamStats).length === 0 && (
                            <div className="text-center py-8 text-slate-500">
                                <Users size={32} className="mx-auto mb-2 opacity-50" />
                                <p>No stewardship data yet</p>
                                <p className="text-xs mt-1">Run setup-governance.ts to populate</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RACI Matrix Info */}
                <div className="bg-slate-900 border border-white/5 rounded-3xl p-8">
                    <h3 className="text-xl font-bold text-white mb-6 tracking-tight">RACI Accountability Matrix</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-sm">R</div>
                                <h4 className="text-emerald-400 font-bold">Responsible</h4>
                            </div>
                            <p className="text-slate-400 text-sm">Data Stewards who maintain data quality and documentation</p>
                        </div>
                        <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-black text-sm">A</div>
                                <h4 className="text-blue-400 font-bold">Accountable</h4>
                            </div>
                            <p className="text-slate-400 text-sm">Data Owners who approve changes and ensure compliance</p>
                        </div>
                        <div className="p-4 bg-violet-500/10 rounded-2xl border border-violet-500/20">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 font-black text-sm">C</div>
                                <h4 className="text-violet-400 font-bold">Consulted</h4>
                            </div>
                            <p className="text-slate-400 text-sm">Subject matter experts and compliance officers</p>
                        </div>
                        <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-black text-sm">I</div>
                                <h4 className="text-amber-400 font-bold">Informed</h4>
                            </div>
                            <p className="text-slate-400 text-sm">Data consumers and downstream system owners</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Steward Directory */}
            <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white tracking-tight">Steward Directory</h3>
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                        {owners.length} registered teams
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02]">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Team</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Datasets</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">PHI Access</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Quality Rules</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Slack</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Contact</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {owners.map((owner) => {
                                const phiDatasets = owner.datasets.filter(d => d.sensitivity === 'PHI');
                                const totalRules = owner.datasets.reduce((sum, d) => sum + d.qualityRules.length, 0);

                                return (
                                    <tr key={owner.id} className="hover:bg-emerald-500/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                                                    {owner.teamName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-bold group-hover:text-emerald-400 transition-colors">{owner.teamName}</h4>
                                                    <p className="text-slate-500 text-xs">Data Steward Team</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <Database size={14} className="text-blue-400" />
                                                <span className="text-white font-bold">{owner.datasets.length}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {phiDatasets.length > 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <Shield size={14} className="text-red-400" />
                                                    <span className="text-red-400 font-bold">{phiDatasets.length} PHI</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-500 text-sm">None</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle size={14} className="text-emerald-400" />
                                                <span className="text-white font-bold">{totalRules}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {owner.slackChannel ? (
                                                <span className="text-slate-300 text-sm">{owner.slackChannel}</span>
                                            ) : (
                                                <span className="text-slate-600 text-xs">Not set</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {owner.contactEmail ? (
                                                <a
                                                    href={`mailto:${owner.contactEmail}`}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-colors"
                                                >
                                                    <Mail size={12} />
                                                    Contact
                                                </a>
                                            ) : (
                                                <span className="text-slate-600 text-xs">No email</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {owners.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center opacity-40">
                                            <Users size={48} className="text-slate-500 mb-4" />
                                            <p className="text-lg font-bold text-white uppercase tracking-widest">No Stewards Registered</p>
                                            <p className="text-slate-500 text-sm font-medium">Run governance setup to create stewardship records</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
