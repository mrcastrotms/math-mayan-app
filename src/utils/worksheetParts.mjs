export const WORKSHEET_SCHEMA_VERSION = 2;

function normalizeQuestion(question, index, partId) {
  return {
    ...question,
    id: question.id || `${partId}-q${index + 1}`,
    partId,
    acceptedAnswers: question.acceptedAnswers?.length
      ? question.acceptedAnswers
      : [question.correctAnswer ?? ""],
  };
}

export function normalizeWorksheetParts(worksheet = {}) {
  const sourceParts = Array.isArray(worksheet.parts) && worksheet.parts.length
    ? worksheet.parts
    : [{ id: "part-a", title: "", instruction: "", questions: worksheet.questions || [] }];
  const parts = sourceParts.map((part, partIndex) => {
    const id = part.id || `part-${String.fromCharCode(97 + partIndex)}`;
    return {
      id,
      title: part.title || part.name || `Part ${String.fromCharCode(65 + partIndex)}`,
      instruction: part.instruction || part.instructions || "",
      questions: (part.questions || []).map((question, index) => normalizeQuestion(question, index, id)),
    };
  });
  return {
    ...worksheet,
    schemaVersion: Number(worksheet.schemaVersion) || WORKSHEET_SCHEMA_VERSION,
    parts,
    questions: parts.flatMap((part) => part.questions),
  };
}
