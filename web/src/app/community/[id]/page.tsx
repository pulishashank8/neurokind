"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/Button";
import { VoteButtons } from "@/components/community/VoteButtons";
import { BookmarkButton } from "@/components/community/BookmarkButton";
import { ReportButton } from "@/components/community/ReportButton";
import { CommentComposer } from "@/components/community/CommentComposer";
import { CommentThreadList } from "@/components/community/CommentThread";
import { CommentSkeleton, LoadingSpinner } from "@/components/community/LoadingSkeletons";
import { EmptyState } from "@/components/community/EmptyState";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  tags: Array<{ id: string; name: string; slug: string }>;
  author: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  voteScore: number;
  commentCount: number;
  isPinned: boolean;
  isLocked: boolean;
  isAnonymous: boolean;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  voteScore: number;
  isAnonymous: boolean;
  parentCommentId?: string;
  children?: Comment[];
}

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [postId, setPostId] = useState<string>("");
  const queryClient = useQueryClient();

  useEffect(() => {
    params.then((p) => setPostId(p.id));
  }, [params]);

  // Fetch post
  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      if (!postId) return null;
      const res = await fetch(`/api/posts/${postId}`);
      if (!res.ok) throw new Error("Failed to fetch post");
      return res.json() as Promise<Post>;
    },
    enabled: !!postId,
  });

  // Fetch comments
  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      if (!postId) return null;
      const res = await fetch(`/api/posts/${postId}/comments`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      return res.json();
    },
    enabled: !!postId,
  });

  const handleCommentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    queryClient.invalidateQueries({ queryKey: ["post", postId] });
  };

  const comments: Comment[] = commentsData?.comments || [];

  if (!postId) return <LoadingSpinner size="lg" />;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-6 sm:py-12 px-4">
      <div className="container max-w-3xl mx-auto">
        {/* Header Button */}
        <Link href="/community">
          <Button variant="ghost" size="sm">
            ← Back to Community
          </Button>
        </Link>

        {/* Post */}
        {postLoading ? (
          <LoadingSpinner size="lg" />
        ) : post ? (
          <>
            <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-light)] p-6 sm:p-8 mt-6">
              {/* Header */}
              {post.isPinned && (
                <div className="mb-4 inline-flex items-center gap-1 px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-semibold rounded-full">
                  📌 Pinned
                </div>
              )}

              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <img
                  src={post.author.avatarUrl || "/default-avatar.svg"}
                  alt={post.author.username}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-semibold text-[var(--text-primary)]">
                    {post.author.username}
                  </p>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </p>
                  {post.isLocked && (
                    <p className="text-xs text-[var(--danger)] font-medium mt-1">
                      🔒 Post locked
                    </p>
                  )}
                </div>
              </div>

              {/* Category & Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-block px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold rounded-full">
                  {post.category.name}
                </span>
                {post.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-block px-3 py-1 bg-[var(--bg-elevated)] text-[var(--text-secondary)] text-xs rounded-full"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
                {post.title}
              </h1>

              {/* Content */}
              <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-6 text-[var(--text-secondary)] whitespace-pre-wrap break-words">
                {post.content}
              </div>

              {/* Stats & Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-6 border-t border-[var(--border-light)]">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                    <span>{post.commentCount}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                  <VoteButtons
                    targetType="POST"
                    targetId={post.id}
                    initialScore={post.voteScore}
                  />
                  <BookmarkButton postId={post.id} />
                  <ReportButton targetType="POST" targetId={post.id} />
                </div>
              </div>
            </div>

            {/* Comment Composer */}
            {!post.isLocked && (
              <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-light)] p-6 sm:p-8 mt-6">
                <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-4">
                  Share your thoughts
                </h2>
                <CommentComposer
                  postId={post.id}
                  onSuccess={handleCommentSuccess}
                  placeholder="Write a comment..."
                />
              </div>
            )}

            {/* Comments Section */}
            <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-light)] p-6 sm:p-8 mt-6">
              <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-4 sm:mb-6">
                Comments ({post.commentCount})
              </h2>

              {commentsLoading ? (
                <>
                  <CommentSkeleton />
                  <CommentSkeleton />
                  <CommentSkeleton />
                </>
              ) : comments.length === 0 ? (
                <EmptyState
                  icon="💬"
                  title="No comments yet"
                  description="Be the first to share your thoughts!"
                />
              ) : (
                <CommentThreadList
                  comments={comments}
                  postId={post.id}
                  onUpdate={handleCommentSuccess}
                />
              )}
            </div>
          </>
        ) : (
          <EmptyState
            icon="❌"
            title="Post not found"
            description="This post may have been deleted or doesn't exist."
            action={{
              label: "Go back to community",
              href: "/community",
            }}
          />
        )}
      </div>
    </div>
  );
}
