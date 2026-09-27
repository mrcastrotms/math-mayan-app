import React from "react";
import WorksheetBuilderCard from "../WorksheetBuilderCard";
import WorksheetManagerCard from "../WorksheetManagerCard";
import QuestionCmsCard from "../QuestionCmsCard";

export default function AcademicsTab({
  availableSections,
  handleGenerateAIQuestions,
  isGeneratingQuestions,
  syncQuestionsToFirebase,
}) {
  return (
    <div className="w-full max-w-4xl flex flex-col gap-6 animate-in fade-in duration-200">
      <WorksheetBuilderCard availableSections={availableSections} />
      <WorksheetManagerCard availableSections={availableSections} />
      <QuestionCmsCard
        onGenerateAI={handleGenerateAIQuestions}
        isGenerating={isGeneratingQuestions}
        onSyncCloud={syncQuestionsToFirebase}
      />
    </div>
  );
}
