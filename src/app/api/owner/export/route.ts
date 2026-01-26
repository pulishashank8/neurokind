import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { format } from 'date-fns';

async function verifyOwnerAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('owner_session')?.value;
  if (!token) return false;
  
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  
  const crypto = await import('crypto');
  const expectedToken = crypto.createHash('sha256').update(adminPassword).digest('hex');
  return token === expectedToken;
}

function toCSV(data: Record<string, unknown>[], columns: string[]): string {
  const header = columns.join(',');
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      if (value instanceof Date) {
        return format(value, 'yyyy-MM-dd HH:mm:ss');
      }
      return String(value);
    }).join(',')
  );
  return [header, ...rows].join('\n');
}

export async function GET(request: NextRequest) {
  if (!(await verifyOwnerAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    let csv: string;
    let filename: string;

    switch (type) {
      case 'users': {
        const users = await prisma.user.findMany({
          include: { profile: true, userRoles: true, _count: { select: { posts: true, comments: true } } },
          orderBy: { createdAt: 'desc' },
        });
        const data = users.map(u => ({
          id: u.id,
          email: u.email,
          username: u.profile?.username || '',
          displayName: u.profile?.displayName || '',
          emailVerified: u.emailVerified,
          isBanned: u.isBanned,
          roles: u.userRoles.map(r => r.role).join(';'),
          postsCount: u._count.posts,
          commentsCount: u._count.comments,
          createdAt: u.createdAt,
          lastLoginAt: u.lastLoginAt || '',
        }));
        csv = toCSV(data, ['id', 'email', 'username', 'displayName', 'emailVerified', 'isBanned', 'roles', 'postsCount', 'commentsCount', 'createdAt', 'lastLoginAt']);
        filename = `users-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        break;
      }

      case 'activity': {
        const logs = await prisma.auditLog.findMany({
          include: { user: { include: { profile: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10000,
        });
        const data = logs.map(l => ({
          id: l.id,
          userId: l.userId,
          userEmail: l.user.email,
          username: l.user.profile?.username || '',
          action: l.action,
          targetType: l.targetType || '',
          targetId: l.targetId || '',
          ipAddress: l.ipAddress || '',
          createdAt: l.createdAt,
        }));
        csv = toCSV(data, ['id', 'userId', 'userEmail', 'username', 'action', 'targetType', 'targetId', 'ipAddress', 'createdAt']);
        filename = `activity-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        break;
      }

      case 'posts': {
        const posts = await prisma.post.findMany({
          include: { author: { include: { profile: true } }, category: true },
          orderBy: { createdAt: 'desc' },
        });
        const data = posts.map(p => ({
          id: p.id,
          title: p.title,
          authorEmail: p.author?.email || 'anonymous',
          authorUsername: p.author?.profile?.username || '',
          category: p.category.name,
          status: p.status,
          viewCount: p.viewCount,
          commentCount: p.commentCount,
          voteScore: p.voteScore,
          createdAt: p.createdAt,
        }));
        csv = toCSV(data, ['id', 'title', 'authorEmail', 'authorUsername', 'category', 'status', 'viewCount', 'commentCount', 'voteScore', 'createdAt']);
        filename = `posts-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
