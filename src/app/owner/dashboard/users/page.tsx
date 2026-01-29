import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import Link from 'next/link';
import { Eye, Mail, Calendar, Clock } from 'lucide-react';

async function getUsers(page: number = 1, search: string = '') {
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const where = search
    ? {
      OR: [
        { email: { contains: search, mode: 'insensitive' as const } },
        { profile: { username: { contains: search, mode: 'insensitive' as const } } },
        { profile: { displayName: { contains: search, mode: 'insensitive' as const } } },
      ],
    }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        profile: true,
        userRoles: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            votes: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, pageSize, page };
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const search = params.search || '';
  const { users, total, pageSize } = await getUsers(page, search);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Users</h1>
        <p className="text-slate-400">View all registered users and their activity</p>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 shadow-xl overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-white/5">
          <form method="GET" className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search by email, username, or name..."
              className="flex-1 px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all font-medium"
            >
              Search
            </button>
          </form>
        </div>

        <div className="p-4 lg:px-6">
          <p className="text-sm text-slate-400">
            Showing <span className="text-white font-medium">{users.length}</span> of <span className="text-white font-medium">{total}</span> users
          </p>
        </div>

        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="text-left py-4 px-6 text-slate-400 font-semibold text-xs uppercase tracking-wider">User</th>
                <th className="text-left py-4 px-6 text-slate-400 font-semibold text-xs uppercase tracking-wider">Email</th>
                <th className="text-left py-4 px-6 text-slate-400 font-semibold text-xs uppercase tracking-wider">Roles</th>
                <th className="text-left py-4 px-6 text-slate-400 font-semibold text-xs uppercase tracking-wider text-center">Stats</th>
                <th className="text-left py-4 px-6 text-slate-400 font-semibold text-xs uppercase tracking-wider">Last Activity</th>
                <th className="text-left py-4 px-6 text-slate-400 font-semibold text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                        {user.profile?.displayName?.[0] || user.email[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate">
                          {user.profile?.displayName || 'No Name'}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          @{user.profile?.username || 'no-username'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Mail size={14} className="text-slate-500" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                    {user.emailVerified && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-full font-medium mt-1 inline-block">Verified</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1.5">
                      {user.userRoles.map((role) => (
                        <span
                          key={role.id}
                          className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        >
                          {role.role}
                        </span>
                      ))}
                      {user.userRoles.length === 0 && (
                        <span className="text-slate-600 text-xs italic">No roles</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-4 text-slate-400">
                      <div className="text-center" title="Posts">
                        <div className="text-white font-bold text-sm">{user._count.posts}</div>
                        <div className="text-[10px] uppercase">P</div>
                      </div>
                      <div className="text-center" title="Comments">
                        <div className="text-white font-bold text-sm">{user._count.comments}</div>
                        <div className="text-[10px] uppercase">C</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Clock size={12} className="text-slate-500" />
                        {user.lastLoginAt ? format(user.lastLoginAt, 'MMM d, yyyy') : 'Never'}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar size={12} />
                        Joined {format(user.createdAt, 'MMM d')}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Link
                      href={`/owner/dashboard/users/${user.id}`}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
                    >
                      <Eye size={14} />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex justify-center gap-2">
            {page > 1 && (
              <Link
                href={`/owner/dashboard/users?page=${page - 1}&search=${search}`}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Previous
              </Link>
            )}
            <span className="px-4 py-2 text-gray-600">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/owner/dashboard/users?page=${page + 1}&search=${search}`}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
