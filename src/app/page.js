"use client";

import { useEffect, useState, useRef, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useExamState } from "../hooks/useExamState";
import { useViewPersistence } from "../hooks/useViewPersistence";
import { useCachedSections } from "../hooks/useCachedSections";
import { useLockEnforcement } from "../hooks/useLockEnforcement";
import { useExamRemoteCommands } from "../hooks/useExamRemoteCommands";
import { useExamBypass } from "../hooks/useExamBypass";
import { useGhostKeyBypass } from "../hooks/useGhostKeyBypass";
import { useAppTheme } from "../hooks/useAppTheme";
import { handleStudentJoin } from "../utils/studentSessionManager";
import ExamAppRouter from "../components/ExamAppRouter";
import StudentLockOverlay from "../components/StudentLockOverlay";
import PinModal from "../components/PinModal";

const DevAdminPanel = dynamic(() => import("../components/DevAdminPanel"), { ssr: false });
const ExamGate = dynamic(() => import("../components/ExamGate"), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-slate-900" />,
});

export default function ExamApp() {
  const router = useRouter();
  const state = useExamState();
  const themeState = useAppTheme({ studentUid: state?.student?.uid });
  const { view, navigateTo } = useViewPersistence("start");
  const { displaySections, isLoading } = useCachedSections(state?.availableSections);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [isTeacherPinOpen, setIsTeacherPinOpen] = useState(false);
  const [scannedReportId] = useState(() => (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("report") || null : null));

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => {
    if (view === "dashboard" && !state?.isAdminMode) state?.setIsAdminMode?.(true);
  }, [view, state]);

  useLockEnforcement({ mounted, view, isTesterMode: state?.isTesterMode, stateRef });
  useExamRemoteCommands({ stateRef, student: state?.student, currentQuestionIndex: state?.currentQuestionIndex });

  const handleGateStart = async ({ studentName, section, isTester, deviceUuid, mdnsCandidate, code }) => {
    state?.setIsAdminMode?.(false);
    state?.setIsDevMode?.(Boolean(isTester));
    state?.setIsTesterMode?.(Boolean(isTester));
    state?.setStudent?.({ name: studentName, section, uid: deviceUuid });
    state?.setSelectedSection?.(section);
    state?.setExamStarted?.(false);
    state?.setExamFinished?.(false);

    await handleStudentJoin({
      name: studentName,
      code: code || "00000",
      uid: deviceUuid,
      section,
      state,
      router,
      telemetry: { deviceUuid, mdnsCandidate },
    });

    navigateTo("student-home");
  };

  const bypassRanRef = useRef(false);
  useExamBypass((name, code, uid, section) => {
    if (bypassRanRef.current) return;
    bypassRanRef.current = true;
    handleGateStart({ studentName: name, section, isTester: true, deviceUuid: uid, code });
  });

  useGhostKeyBypass(state);

  if (!mounted) return <div className="min-h-screen bg-slate-900" />;

  const adminPanel = (
    <DevAdminPanel
      isDevMode={state?.isDevMode || false}
      setIsLocked={state?.setIsLocked || (() => {})}
      handleFinishExam={state?.handleFinishExam || (() => {})}
    />
  );

  return (
    <>
      <StudentLockOverlay
        isLocked={state?.isLocked}
        studentName={state?.student?.name}
        timeLeft={state?.timeLeft}
        onUnlock={() => stateRef.current?.setIsLocked?.(false)}
      />

      {view === "start" && !state?.examStarted && !state?.isBypassActive ? (
        <ExamGate
          availableSections={displaySections}
          isLoading={isLoading}
          onExamStart={handleGateStart}
          onOpenDashboard={() => setIsTeacherPinOpen(true)}
          themeState={themeState}
        />
      ) : (
        <ExamAppRouter
          state={state}
          view={view}
          navigateTo={navigateTo}
          displaySections={displaySections}
          isLoading={isLoading}
          scannedReportId={scannedReportId}
          adminPanel={adminPanel}
          themeState={themeState}
          onJoin={(name, code, uid, section) =>
            handleStudentJoin({ name, code, uid, section, state, router })
          }
        />
      )}

      <PinModal
        isOpen={isTeacherPinOpen}
        onClose={() => setIsTeacherPinOpen(false)}
        title="Teacher Login"
        description=""
        placeholder="••••"
        onSubmit={(pin) => {
          if (["0801", "2026"].includes(pin.trim())) {
            window.sessionStorage.setItem("teacher_authorized", "true");
            state?.setIsAdminMode?.(true);
            navigateTo("dashboard");
            return true;
          } else {
            return false;
          }
        }}
      />
    </>
  );
}
