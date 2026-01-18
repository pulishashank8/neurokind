"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { VoteButtons } from "./VoteButtons";
import { BookmarkButton } from "./BookmarkButton";
import { ReportButton } from "./ReportButton";

interface Post {
  id: string;
  title: string;
  snippet: string;
  createdAt: Date | string;
  status?: "ACTIVE" | "REMOVED" | "LOCKED" | "ARCHIVED";
  category: {
    id: string;
    name: string;
    slug: string;
  };
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  author: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  voteScore: number;
  commentCount: number;
  isPinned?: boolean;
  isLocked?: boolean;
  isAnonymous?: boolean;
}

interface PostCardProps {
  post: Post;
  compact?: boolean;
  showActions?: boolean;
}

export function PostCard({
  post,
  compact = false,
  showActions = true,
}: PostCardProps) {
  const createdDate = new Date(post.createdAt);

  return (
    <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-light)] hover:shadow-md transition-all group flex">
      {/* LEFT: Vote Bar (Reddit-style) - Desktop: vertical, Mobile: horizontal row */}
      <div className="hidden sm:flex flex-col items-center gap-1 p-3 bg-[var(--bg-elevated)] rounded-l-[var(--radius-lg)] border-r border-[var(--border-light)]">
        <VoteButtons
          targetType="POST"
          targetId={post.id}
          initialScore={post.voteScore}
        />
      </div>

      {/* RIGHT: Content */}
      <div className="flex-1 p-4 sm:p-6 flex flex-col">
        {/* Status & Pinned indicators */}
        <div className="mb-2 flex flex-wrap gap-2">
          {post.status === "REMOVED" && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
              🚫 Removed
            </div>
          )}
          {post.isPinned && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-semibold rounded-full">
              📌 Pinned
            </div>
          )}
          {post.isLocked && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
              🔒 Locked
            </div>
          )}
        </div>

        {/* Title */}
        <Link href={`/community/${post.id}`}>
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors line-clamp-2 mb-2">
            {post.title}
          </h3>
        </Link>

        {/* Snippet */}
        {!compact && (
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">
            {post.snippet}
          </p>
        )}

        {/* Meta row: Author, Category, Timestamp */}
        <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-[var(--text-muted)]">
          <span className="font-semibold text-[var(--text-primary)]">
            {post.isAnonymous ? "Anonymous" : post.author.username}
          </span>
          {post.isAnonymous && post.author && (
            <span className="text-[var(--text-muted)]">(by verified user)</span>
          )}
          <span>•</span>
          <span className="inline-block px-2 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold rounded">
            {post.category.name}
          </span>
          <span>•</span>
          <span>{formatDistanceToNow(createdDate, { addSuffix: true })}</span>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="inline-block px-2 py-0.5 bg-[var(--bg-elevated)] text-[var(--text-secondary)] text-xs rounded-full"
              >
                #{tag.name}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="inline-block px-2 py-0.5 text-[var(--text-muted)] text-xs">
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* BOTTOM: Actions row */}
        <div className="flex items-center gap-3 pt-3 border-t border-[var(--border-light)] mt-auto">
          {/* Comment count link */}
          <Link href={`/community/${post.id}`} className="flex items-center gap-1 text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            <span className="font-semibold">{post.commentCount}</span>
          </Link>

          {/* Mobile: Vote buttons inline */}
          <div className="sm:hidden flex items-center gap-1 ml-auto">
            <VoteButtons
              targetType="POST"
              targetId={post.id}
              initialScore={post.voteScore}
            />
          </div>

          {/* Bookmark + Report */}
          {showActions && (
            <div className="flex items-center gap-2 ml-auto sm:ml-0">
              <BookmarkButton postId={post.id} />
              <ReportButton targetType="POST" targetId={post.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
