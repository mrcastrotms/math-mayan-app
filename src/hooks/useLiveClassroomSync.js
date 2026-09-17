import { useState, useEffect, useRef } from "react";
import {
  initStudentSession,
  pingHeartbeat,
  subscribeToLiveStudents,
  subscribeToStudentCommands,
  sendStudentCommand,
} from "../services/liveSyncService";

export function useLiveClassroomSync({
  student,
  isTeacher = false,
  activeSection = "",
  commandHandlers = {},
}) {
  const [liveStudents, setLiveStudents] = useState([]);

  const handlersRef = useRef(commandHandlers);
  useEffect(() => {
    handlersRef.current = commandHandlers;
  }, [commandHandlers]);

  useEffect(() => {
    if (isTeacher || !student?.uid) return;

    initStudentSession(student);
    const pingInterval = setInterval(() => pingHeartbeat(student.uid), 20000);
    const unsubCommands = subscribeToStudentCommands(student.uid, handlersRef);

    return () => {
      clearInterval(pingInterval);
      unsubCommands();
    };
  }, [student?.uid, isTeacher]);

  useEffect(() => {
    if (!isTeacher || !activeSection) return;
    return subscribeToLiveStudents(activeSection, setLiveStudents);
  }, [isTeacher, activeSection]);

  const sendCommand = (uid, type, payload = {}) => {
    return sendStudentCommand(uid, type, payload);
  };

  return {
    liveStudents,
    sendCommand,
  };
}
