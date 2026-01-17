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
    <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-light)] p-4 sm:p-6 hover:shadow-md transition-all group">
      {/* Pinned indicator */}
      {post.isPinned && (
        <div className="mb-3 inline-flex items-center gap-1 px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-semibold rounded-full">
          📌 Pinned
        </div>
      )}

      {/* Header with author */}
      <div className="flex items-start gap-3 sm:gap-4 mb-3">
        <img
          src={post.author.avatarUrl || "/default-avatar.svg"}
          alt={post.author.username}
          className="w-10 h-10 rounded-full flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] truncate">
            {post.author.username}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {formatDistanceToNow(createdDate, { addSuffix: true })}
          </p>
          {post.isLocked && (
            <p className="text-xs text-[var(--danger)] font-medium mt-1">🔒 Locked</p>
          )}
        </div>
      </div>

      {/* Title & Category */}
      <div className="mb-3">
        <Link href={`/community/${post.id}`}>
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>
        <div className="mt-2 inline-block">
          <span className="inline-block px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold rounded-full">
            {post.category.name}
          </span>
        </div>
      </div>

      {/* Snippet */}
      {!compact && (
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">
          {post.snippet}
        </p>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="inline-block px-2 py-1 bg-[var(--bg-elevated)] text-[var(--text-secondary)] text-xs rounded-full"
            >
              #{tag.name}
            </span>
          ))}
          {post.tags.length > 3 && (
            <span className="inline-block px-2 py-1 text-[var(--text-muted)] text-xs">
              +{post.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Stats & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4 border-t border-[var(--border-light)]">
        {/* Stats */}
        <div className="flex items-center gap-4 sm:gap-6 flex-1">
          <div className="flex items-center gap-1 text-xs sm:text-sm text-[var(--text-secondary)]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            <span>{post.commentCount}</span>
          </div>
          <div className="flex items-center gap-1 text-xs sm:text-sm text-[var(--text-secondary)]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
            <span>{Math.abs(post.voteScore)}</span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            <VoteButtons
              targetType="POST"
              targetId={post.id}
              initialScore={post.voteScore}
            />
            <BookmarkButton postId={post.id} />
            <ReportButton targetType="POST" targetId={post.id} />
          </div>
        )}
      </div>
    </div>
  );
}
