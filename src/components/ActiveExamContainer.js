// src/components/ActiveExamContainer.js
import ActiveExamScreen from "./ActiveExamScreen";

export default function ActiveExamContainer({ state, adminPanel }) {
  return (
    <ActiveExamScreen
      question={
        state?.currentQ ||
        state?.getCurrentQuestion?.() || { question: "Sample Test Question 1" }
      }
      questionIndex={state?.currentQuestionIndex || 0}
      questionsAttempted={state?.questionsAttempted || 0}
      formatTime={
        state?.formatTime ||
        ((s) => `${Math.floor(s / 60)}:${s % 60 < 10 ? "0" : ""}${s % 60}`)
      }
      timeLeft={state?.timeLeft || 300}
      showBehaviorMenu={state?.showBehaviorMenu || false}
      setShowBehaviorMenu={state?.setShowBehaviorMenu || (() => {})}
      setDemerits={state?.setDemerits || (() => {})}
      demerits={state?.demerits || 0}
      currentInput={state?.currentInput || ""}
      handlePadClick={state?.handlePadClick || (() => {})}
      handleBackspace={state?.handleBackspace || (() => {})}
      handleClear={state?.handleClear || (() => {})}
      showEndExamButton={true}
      handleFinishExam={state?.handleFinishExam || (() => {})}
      handleSubmitQuestion={state?.handleSubmitQuestion || (() => {})}
      handlePassQuestion={state?.handlePassQuestion || (() => {})}
      handleTryHarder={state?.handleTryHarder || (() => {})}
      handleSimulateCorrect={state?.handleSimulateCorrect || (() => {})}
      secondsOnCurrentQuestion={state?.secondsOnCurrentQuestion || 0}
      canTriggerHarder={state?.canTriggerHarder || false}
      isTeacherTesting={state?.isTeacher || false}
      isSaving={state?.isSaving || false}
      handleNinjaDoubleTime={state?.handleNinjaDoubleTime || (() => {})}
      handleNinjaOneMinute={state?.handleNinjaOneMinute || (() => {})}
    >
      {adminPanel}
    </ActiveExamScreen>
  );
}
