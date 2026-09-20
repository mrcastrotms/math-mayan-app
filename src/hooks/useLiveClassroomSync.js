// src/hooks/useLiveClassroomSync.js
import { useState, useEffect, useRef } from "react";
import {
  initStudentSession,
  pingHeartbeat,
  subscribeToLiveStudents,
  subscribeToStudentCommands,
  sendStudentCommand,
  updateStudentQuestion,
  cleanStudentSession,
} from "../services/liveSyncService";

export function useLiveClassroomSync({
  student,
  isTeacher = false,
  activeSection = "",
  commandHandlers = {},
  currentQuestionIndex = 0,
}) {
  const [liveStudents, setLiveStudents] = useState([]);

  const handlersRef = useRef(commandHandlers);
  useEffect(() => {
    handlersRef.current = commandHandlers;
  }, [commandHandlers]);

  // Student initialization: creates session, registers heartbeat, and listens for teacher commands
  useEffect(() => {
    if (isTeacher || !student?.uid) return;

    initStudentSession(student, currentQuestionIndex);
    const pingInterval = setInterval(() => pingHeartbeat(student.uid), 20000);
    const unsubCommands = subscribeToStudentCommands(student.uid, handlersRef);

    return () => {
      clearInterval(pingInterval);
      unsubCommands();
    };
  }, [student?.uid, isTeacher]);

  // Real-time question index synchronization
  useEffect(() => {
    if (isTeacher || !student?.uid) return;
    updateStudentQuestion(student.uid, currentQuestionIndex);
  }, [student?.uid, currentQuestionIndex, isTeacher]);

  // Clean departure: immediately remove session when student closes tab or navigates away
  useEffect(() => {
    if (isTeacher || !student?.uid) return;

    const handleExit = () => {
      cleanStudentSession(student.uid);
    };

    window.addEventListener("beforeunload", handleExit);
    window.addEventListener("pagehide", handleExit);

    return () => {
      window.removeEventListener("beforeunload", handleExit);
      window.removeEventListener("pagehide", handleExit);
      cleanStudentSession(student.uid);
    };
  }, [student?.uid, isTeacher]);

  // Teacher subscription: streams active students matching the section
  useEffect(() => {
    if (!isTeacher || !activeSection) return;
    return subscribeToLiveStudents(activeSection, setLiveStudents);
  }, [isTeacher, activeSection]);

  const sendCommand = (uid, type, payload = {}) => {
    if (type === "ADD_MERIT" || type === "ADD_DEMERIT") {
      updateStudentConduct(uid, type === "ADD_MERIT" ? "merits" : "demerits").catch((error) =>
        console.error("Unable to update student conduct:", error),
      );
    }
    return sendStudentCommand(uid, type, payload);
  };

  return {
    liveStudents,
    sendCommand,
  };
}
