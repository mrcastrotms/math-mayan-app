export async function fetchExamQuestions(tier) {
  try {
    const url = tier ? `/api/questions?tier=${tier}` : "/api/questions";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch questions from server");
    const data = await res.json();
    return data.questions || [];
  } catch (err) {
    console.error("[QuestionService] Error loading questions:", err);
    return [];
  }
}

export async function fetchLiveQuestions(tier) {
  return fetchExamQuestions(tier);
}

export async function syncQuestionsToFirebase(questions) {
  // Questions are now seeded and managed server-side via Firestore & /api/questions
  console.warn("syncQuestionsToFirebase is deprecated. Questions are managed in Firestore.");
  return true;
}
