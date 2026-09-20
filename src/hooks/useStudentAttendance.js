import { useEffect, useRef } from "react";
import {
  heartbeatAttendance,
  markAttendancePresence,
  qualifyAttendance,
} from "../services/attendanceService";

export function useStudentAttendance({ studentName, section, uid, sessionCode = "" }) {
  const recordIdRef = useRef("");

  useEffect(() => {
    if (!uid || !section) return undefined;
    let cancelled = false;
    const startedAt = Date.now();
    let interval;
    let qualifyTimer;

    async function start() {
      const id = await markAttendancePresence({
        uid,
        studentName,
        section,
        sessionCode,
        now: startedAt,
      });
      if (cancelled) return;
      recordIdRef.current = id;
      qualifyTimer = setTimeout(() => qualifyAttendance(id).catch(() => {}), 10 * 60 * 1000);
      interval = setInterval(() => heartbeatAttendance(id).catch(() => {}), 30 * 1000);
    }
    start().catch((error) => console.error("Unable to record attendance presence:", error));

    return () => {
      cancelled = true;
      clearTimeout(qualifyTimer);
      clearInterval(interval);
    };
  }, [studentName, section, uid, sessionCode]);
}
