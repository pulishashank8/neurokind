"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface BookmarkButtonProps {
  postId: string;
  initialBookmarked?: boolean;
  onToggle?: (bookmarked: boolean) => void;
}

export function BookmarkButton({
  postId,
  initialBookmarked = false,
  onToggle,
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (isLoading) return;

    const previousBookmarked = bookmarked;
    setBookmarked(!bookmarked); // Optimistic update

    setIsLoading(true);

    try {
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        throw new Error("Bookmark toggle failed");
      }

      const data = await response.json();
      setBookmarked(data.bookmarked);
      onToggle?.(data.bookmarked);

      toast.success(data.message);
    } catch (error) {
      setBookmarked(previousBookmarked);
      toast.error("Failed to update bookmark");
      console.error("Error toggling bookmark:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`min-h-[44px] px-3 sm:px-4 rounded-[var(--radius-md)] flex items-center gap-2 transition-all ${
        bookmarked
          ? "bg-[var(--accent)] text-white"
          : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated-hover)]"
      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      aria-label={bookmarked ? "Remove bookmark" : "Bookmark post"}
      title={bookmarked ? "Remove bookmark" : "Bookmark post"}
    >
      <svg
        className="w-5 h-5"
        fill={bookmarked ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
      <span className="hidden sm:inline text-sm font-medium">
        {bookmarked ? "Saved" : "Save"}
      </span>
    </button>
  );
}
