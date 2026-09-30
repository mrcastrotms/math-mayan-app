// src/utils/scoringUtils.js

export const DEFAULT_GRADING_CONFIG = {
  baseScore: 60,
  accuracyWeight: 40,
  demeritPenalty: 5,
  minFloor: 50,
  zeroEffortFloor: 40,
  maxScore: 100,
};

export function getActiveGradingConfig() {
  if (typeof window === "undefined") return DEFAULT_GRADING_CONFIG;
  try {
    const saved = localStorage.getItem("app_grading_config");
    return saved ? { ...DEFAULT_GRADING_CONFIG, ...JSON.parse(saved) } : DEFAULT_GRADING_CONFIG;
  } catch {
    return DEFAULT_GRADING_CONFIG;
  }
}

export function saveActiveGradingConfig(newConfig) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("app_grading_config", JSON.stringify(newConfig));
  } catch (e) {
    console.error("Failed to save grading config:", e);
  }
}

export function computeEnhancedScore(answers, demerits, examDuration, customConfig = null) {
  const config = customConfig || getActiveGradingConfig();

  if (!answers || answers.length === 0) {
    return config.zeroEffortFloor;
  }

  const minRequired = examDuration <= 600 ? 8 : 12;
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const gradedOutOf = Math.max(answers.length, minRequired);
  const accuracy = correctCount / gradedOutOf;

  let finalScore = config.baseScore + accuracy * config.accuracyWeight;
  finalScore -= (demerits || 0) * config.demeritPenalty;

  return Math.max(config.minFloor, Math.min(config.maxScore, Math.round(finalScore)));
}
