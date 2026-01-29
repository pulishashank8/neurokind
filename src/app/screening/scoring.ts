/**
 * Screening scoring logic - extracted for testing
 */

type Answer = "yes" | "no" | null;
type Group = "toddler" | "child";
type Category = "Low" | "Moderate" | "High";

export interface ScreeningSummary {
  score: number;
  category: Category;
  group: Group;
  rawScore: number;
  maxScore: number;
  createdAt: string;
  interpretation: string;
}

/**
 * Calculate toddler screening score (M-CHAT-R/F)
 * Reverse scored items: questions 2, 5, 12 (indices 1, 4, 11)
 */
export function calculateToddlerScore(answers: Answer[]): ScreeningSummary {
  let score = 0;
  const reverseScored = [1, 4, 11]; // indices for questions 2, 5, 12 (0-indexed)

  answers.forEach((answer, i) => {
    if (answer === null) return;
    if (reverseScored.includes(i)) {
      if (answer === "yes") score++;
    } else {
      if (answer === "no") score++;
    }
  });

  let category: Category = "Low";
  if (score >= 8) category = "High";
  else if (score >= 3) category = "Moderate";

  return {
    score,
    category,
    group: "toddler",
    rawScore: score,
    maxScore: 20,
    createdAt: new Date().toISOString(),
    interpretation: score <= 2
      ? "Low risk. Continue monitoring development. Re-screen at future well-child visits."
      : score <= 7
        ? "Moderate risk. Follow-up screening recommended. Discuss results with your pediatrician."
        : "High risk. Immediate referral for diagnostic evaluation and early intervention services is recommended.",
  };
}

/**
 * Calculate child screening score (ages 3-12)
 * All items scored the same way (yes = 1 point)
 */
export function calculateChildScore(answers: Answer[]): ScreeningSummary {
  let score = 0;
  answers.forEach((answer) => {
    if (answer === "yes") score++;
  });

  const percentage = Math.round((score / 20) * 100);
  let category: Category = "Low";
  if (percentage >= 50) category = "High";
  else if (percentage >= 25) category = "Moderate";

  return {
    score: percentage,
    category,
    group: "child",
    rawScore: score,
    maxScore: 20,
    createdAt: new Date().toISOString(),
    interpretation: percentage < 25
      ? "Low concern level. Continue monitoring and discuss at routine check-ups."
      : percentage < 50
        ? "Moderate concern level. Consider consultation with healthcare provider or developmental specialist."
        : "Higher concern level. Professional evaluation by a developmental specialist is recommended.",
  };
}
