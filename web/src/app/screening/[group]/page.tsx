"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type QA = { id: number; text: string };

const TODDLER_QUESTIONS: QA[] = [
  { id: 1, text: "Does your child respond to their name most of the time?" },
  { id: 2, text: "Does your child make consistent eye contact during interaction?" },
  { id: 3, text: "Does your child try to get your attention to share enjoyment (not only to request help)?" },
  { id: 4, text: "Does your child point to show you something interesting (not just to request)?" },
  { id: 5, text: "Does your child look back and forth between you and an object to share attention?" },
  { id: 6, text: "Does your child copy your actions (clapping, brushing hair, making faces)?" },
  { id: 7, text: "Does your child bring objects to you to show them (not only to get help)?" },
  { id: 8, text: "Does your child use gestures like waving bye-bye or nodding/shaking head?" },
  { id: 9, text: "Does your child enjoy simple interactive games (peek-a-boo, pat-a-cake)?" },
  { id: 10, text: "Does your child use words or meaningful sounds to communicate needs?" },
  { id: 11, text: "Does your child combine two words meaningfully (example: 'want water')?" },
  { id: 12, text: "Does your child engage in pretend play (feeding doll, talking on toy phone)?" },
  { id: 13, text: "Does your child show interest in other children (watching, approaching, copying)?" },
  { id: 14, text: "Does your child show a wide range of facial expressions (happy, sad, surprise)?" },
  { id: 15, text: "Does your child have repetitive movements (hand flapping, rocking, finger flicking)?" },
  { id: 16, text: "Does your child become very distressed with small changes in routine?" },
  { id: 17, text: "Does your child repeatedly line up objects or focus on parts (wheels, buttons)?" },
  { id: 18, text: "Does your child have unusually strong sensory reactions (sound, textures, lights)?" },
  { id: 19, text: "Does your child seem unusually focused on one object/topic for long periods?" },
  { id: 20, text: "Does your child often have difficulty calming down after upset (frequent intense meltdowns)?" },
];

const CHILD_QUESTIONS: QA[] = [
  { id: 1, text: "Does your child struggle to make or keep friends?" },
  { id: 2, text: "Does your child have difficulty starting conversations with peers?" },
  { id: 3, text: "Does your child avoid eye contact or use it inconsistently?" },
  { id: 4, text: "Does your child struggle to understand others’ feelings or perspectives?" },
  { id: 5, text: "Does your child miss social cues (tone of voice, facial expression, body language)?" },
  { id: 6, text: "Does your child have difficulty with back-and-forth conversation?" },
  { id: 7, text: "Does your child speak in an unusual way (very formal, monotone, scripted)?" },
  { id: 8, text: "Does your child repeat words/phrases or ask the same questions repeatedly?" },
  { id: 9, text: "Does your child talk mostly about one preferred topic and resist changing topics?" },
  { id: 10, text: "Does your child prefer being alone rather than playing with peers?" },
  { id: 11, text: "Does your child become highly upset by routine changes or transitions?" },
  { id: 12, text: "Does your child have sensory sensitivities (noise, clothes tags, textures, bright lights)?" },
  { id: 13, text: "Does your child have repetitive movements (rocking, hand flapping, pacing)?" },
  { id: 14, text: "Does your child play in repetitive ways (same exact scenario repeatedly)?" },
  { id: 15, text: "Does your child have unusually intense interests compared to peers?" },
  { id: 16, text: "Does your child insist things be done in a specific way (rigid thinking)?" },
  { id: 17, text: "Does your child have big emotional outbursts that seem bigger than the situation?" },
  { id: 18, text: "Does your child struggle with group activities/team games?" },
  { id: 19, text: "Does your child struggle with personal space/social boundaries?" },
  { id: 20, text: "Have teachers/caregivers expressed concerns about social communication/behavior?" },
];

const WEIGHTS = Array(6).fill(3).concat(Array(8).fill(2), Array(6).fill(1)); // 20
const MAX_RAW = WEIGHTS.reduce((a, b) => a + b, 0); // 40

export default function ScreeningFlowPage() {
  const router = useRouter();
  const params = useParams();
  const group = (params?.group as "toddler" | "child") || "child";

  const questions = useMemo(() => (group === "toddler" ? TODDLER_QUESTIONS : CHILD_QUESTIONS), [group]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<("yes" | "no" | null)[]>(Array(20).fill(null));

  useEffect(() => {
    const intake = sessionStorage.getItem("nk-screening-intake");
    if (!intake) {
      // Go back to intro if no intake captured
      router.replace("/screening");
    }
  }, [router]);

  const setAnswer = (value: "yes" | "no") => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const computeScore = () => {
    // risk mapping: Q1–Q14 NO = risk; Q15–Q20 YES = risk
    const raw = answers.reduce((sum, a, i) => {
      if (a === null) return sum;
      const risk = i <= 13 ? a === "no" : a === "yes";
      return sum + (risk ? WEIGHTS[i] : 0);
    }, 0);
    const score = Math.round((raw / MAX_RAW) * 100);
    let category: "Low" | "Mild" | "Moderate" | "High" = "Low";
    if (score >= 75) category = "High";
    else if (score >= 50) category = "Moderate";
    else if (score >= 25) category = "Mild";

    // Breakdown
    const socialRaw = answers.slice(0, 14).reduce((sum, a, i) => {
      if (a === null) return sum;
      const risk = a === "no";
      return sum + (risk ? WEIGHTS[i] : 0);
    }, 0);
    const repSensRaw = answers.slice(14, 19).reduce((sum, a, j) => {
      if (a === null) return sum;
      const i = 14 + j;
      const risk = a === "yes";
      return sum + (risk ? WEIGHTS[i] : 0);
    }, 0);
    const regulationRaw = answers[19] === "yes" ? WEIGHTS[19] : 0;

    const summary = {
      score,
      category,
      group,
      totals: { socialRaw, repSensRaw, regulationRaw, maxRaw: MAX_RAW },
      createdAt: new Date().toISOString(),
    };
    try {
      sessionStorage.setItem("nk-screening-summary", JSON.stringify(summary));
    } catch {}
    router.push("/screening/result");
  };

  const progressPct = Math.round(((index + 1) / questions.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-indigo-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Autism Screening — {group === "toddler" ? "Toddler (18–36 months)" : "Child (3–12 years)"}</h1>
          <span className="text-sm text-gray-600">{index + 1}/20</span>
        </div>

        {/* Progress */}
        <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-indigo-600 transition-all"
            style={{ width: `${progressPct}%` }}
          ></div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
          <p className="text-lg font-medium text-gray-900">{questions[index].text}</p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setAnswer("yes")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold border ${
                answers[index] === "yes" ? "bg-indigo-600 text-white" : "bg-white"
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => setAnswer("no")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold border ${
                answers[index] === "no" ? "bg-indigo-600 text-white" : "bg-white"
              }`}
            >
              No
            </button>
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Back
            </button>
            {index < 19 ? (
              <button
                onClick={() => setIndex((i) => Math.min(19, i + 1))}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                disabled={answers[index] === null}
              >
                Next
              </button>
            ) : (
              <button
                onClick={computeScore}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                disabled={answers.some((a) => a === null)}
              >
                See Results
              </button>
            )}
          </div>

          <p className="mt-6 text-xs text-gray-500">
            Disclaimer: This screening does not diagnose autism. It only indicates whether a professional evaluation may be helpful.
          </p>
        </div>
      </div>
    </div>
  );
}
