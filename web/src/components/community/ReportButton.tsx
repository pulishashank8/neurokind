"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface ReportButtonProps {
  targetType: "POST" | "COMMENT" | "USER";
  targetId: string;
}

export function ReportButton({ targetType, targetId }: ReportButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const reasons = [
    { value: "SPAM", label: "Spam or advertising" },
    { value: "HARASSMENT", label: "Harassment or bullying" },
    { value: "MISINFORMATION", label: "Misinformation" },
    { value: "INAPPROPRIATE_CONTENT", label: "Inappropriate content" },
    { value: "HATE_SPEECH", label: "Hate speech" },
    { value: "OTHER", label: "Other" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) {
      toast.error("Please select a reason");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          reason,
          details: details || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Report submission failed");
      }

      toast.success(data.message);
      setShowDialog(false);
      setReason("");
      setDetails("");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit report");
      console.error("Error submitting report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="min-h-[44px] px-3 sm:px-4 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated-hover)] flex items-center gap-2 transition-all"
        aria-label="Report content"
        title="Report"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
          />
        </svg>
        <span className="hidden sm:inline text-sm font-medium">Report</span>
      </button>

      {showDialog && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDialog(false)}
        >
          <div
            className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] p-6 sm:p-8 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-4">
              Report {targetType.toLowerCase()}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Reason for reporting
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-[var(--radius-md)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] min-h-[48px]"
                  required
                >
                  <option value="">Select a reason...</option>
                  {reasons.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Additional details (optional)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Please provide any additional context..."
                  className="w-full px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-[var(--radius-md)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none min-h-[120px]"
                  maxLength={1000}
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {details.length}/1000 characters
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setShowDialog(false)}
                  className="min-h-[48px] px-6 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated-hover)] font-medium transition-all flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !reason}
                  className="min-h-[48px] px-6 rounded-[var(--radius-md)] bg-[var(--danger)] text-white hover:opacity-90 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                >
                  {isLoading ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
