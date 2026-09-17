// src/components/TeacherDashboard.js
import { useState } from "react";
import { useTeacherSession } from "../hooks/useTeacherSession";
import { useGradebookData } from "../hooks/useGradebookData";
import { useAIQuestionGenerator } from "../hooks/useAIQuestionGenerator";
import { useLiveClassroomSync } from "../hooks/useLiveClassroomSync";
import { syncQuestionsToFirebase } from "../services/questionService";

import StudentReportModal from "./StudentReportModal";
import TeacherGradebookContainer from "./TeacherGradebookContainer";
import SessionGeneratorCard from "./SessionGeneratorCard";
import GradebookSummaryCard from "./GradebookSummaryCard";
import TeacherJailMonitor from "./TeacherJailMonitor";
import ClassManagerCard from "./ClassManagerCard";
import CloudCmsCard from "./CloudCmsCard";
import QuestionCmsCard from "./QuestionCmsCard";
import TeacherSectionModals from "./TeacherSectionModals";

export default function TeacherDashboard({
  setIsAdminMode,
  availableSections,
  setAvailableSections,
  appText,
  setAppText,
}) {
  const [isViewingGradebook, setIsViewingGradebook] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);

  const session = useTeacherSession();
  const gradebook = useGradebookData();
  const { isGeneratingQuestions, handleGenerateAIQuestions } =
    useAIQuestionGenerator();

  const { liveStudents, sendCommand } = useLiveClassroomSync({
    isTeacher: true,
    activeSection:
      session.selectedSessionSection || availableSections?.[0] || "",
  });

  const handleOpenGradebook = () => {
    setIsViewingGradebook(true);
    setSelectedReport(null);
    gradebook.fetchGradebook();
  };

  if (selectedReport) {
    return (
      <StudentReportModal
        report={selectedReport}
        onBack={() => setSelectedReport(null)}
      />
    );
  }

  if (isViewingGradebook) {
    return (
      <TeacherGradebookContainer
        gradebook={gradebook}
        availableSections={availableSections}
        onBack={() => setIsViewingGradebook(false)}
        onViewReport={(report) => setSelectedReport(report)}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-start pt-16 min-h-screen bg-slate-900 text-white p-8 relative font-sans w-full z-50 absolute top-0 left-0 overflow-y-auto">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">
        Teacher Dashboard
      </h1>

      <div className="flex gap-6 w-full max-w-4xl justify-center mb-6">
        <SessionGeneratorCard
          generatedCode={session.generatedCode}
          selectedSessionSection={session.selectedSessionSection}
          setSelectedSessionSection={session.setSelectedSessionSection}
          selectedActivityType={session.selectedActivityType}
          setSelectedActivityType={session.setSelectedActivityType}
          activityOptions={session.activityOptions}
          availableSections={availableSections}
          isGenerating={session.isGenerating}
          onGenerateCode={session.generateCode}
          onResetSession={session.resetSession}
        />
        <GradebookSummaryCard onOpenGradebook={handleOpenGradebook} />
      </div>

      <TeacherJailMonitor
        liveStudents={liveStudents}
        activeSection={session.selectedSessionSection || availableSections?.[0]}
        onSendCommand={sendCommand}
      />

      <ClassManagerCard
        availableSections={availableSections}
        onAddSection={() => setShowAddSectionModal(true)}
        onDeleteSection={(sec) => setSectionToDelete(sec)}
      />

      <CloudCmsCard appText={appText} setAppText={setAppText} />

      <QuestionCmsCard
        onGenerateAI={handleGenerateAIQuestions}
        isGenerating={isGeneratingQuestions}
        onSyncCloud={syncQuestionsToFirebase}
      />

      <button
        type="button"
        onClick={() => setIsAdminMode(false)}
        className="text-slate-400 hover:text-white underline text-lg font-bold cursor-pointer"
      >
        Test Student Version -&gt;
      </button>

      <TeacherSectionModals
        availableSections={availableSections}
        setAvailableSections={setAvailableSections}
        showAddSectionModal={showAddSectionModal}
        setShowAddSectionModal={setShowAddSectionModal}
        sectionToDelete={sectionToDelete}
        setSectionToDelete={setSectionToDelete}
      />
    </div>
  );
}
