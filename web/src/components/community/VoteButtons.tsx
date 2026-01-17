"use client";

import { useState } from "react";

interface VoteButtonsProps {
  targetType: "POST" | "COMMENT";
  targetId: string;
  initialScore: number;
  initialUserVote?: number; // -1, 0, or 1
  onVote?: (newScore: number) => void;
  disabled?: boolean;
}

export function VoteButtons({
  targetType,
  targetId,
  initialScore,
  initialUserVote = 0,
  onVote,
  disabled = false,
}: VoteButtonsProps) {
  const [voteScore, setVoteScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = async (value: number) => {
    if (disabled || isLoading) return;

    // Optimistic update
    const previousScore = voteScore;
    const previousUserVote = userVote;

    // Calculate new vote (toggle if clicking same button)
    const newVote = userVote === value ? 0 : value;
    const scoreChange = newVote - userVote;

    setUserVote(newVote);
    setVoteScore(voteScore + scoreChange);

    setIsLoading(true);

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          value: newVote,
        }),
      });

      if (!response.ok) {
        throw new Error("Vote failed");
      }

      const data = await response.json();
      setVoteScore(data.voteScore);
      setUserVote(data.userVote);
      onVote?.(data.voteScore);
    } catch (error) {
      // Revert optimistic update on error
      setVoteScore(previousScore);
      setUserVote(previousUserVote);
      console.error("Error voting:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <button
        onClick={() => handleVote(1)}
        disabled={disabled || isLoading}
        className={`min-h-[44px] min-w-[44px] rounded-[var(--radius-md)] flex items-center justify-center transition-all ${
          userVote === 1
            ? "bg-[var(--primary)] text-white"
            : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated-hover)]"
        } ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-label="Upvote"
        title="Upvote"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      <span
        className={`min-w-[32px] text-center font-semibold text-sm sm:text-base ${
          userVote === 1
            ? "text-[var(--primary)]"
            : userVote === -1
            ? "text-[var(--danger)]"
            : "text-[var(--text-secondary)]"
        }`}
      >
        {voteScore}
      </span>

      <button
        onClick={() => handleVote(-1)}
        disabled={disabled || isLoading}
        className={`min-h-[44px] min-w-[44px] rounded-[var(--radius-md)] flex items-center justify-center transition-all ${
          userVote === -1
            ? "bg-[var(--danger)] text-white"
            : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated-hover)]"
        } ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-label="Downvote"
        title="Downvote"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}
