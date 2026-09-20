import { useEffect, useState } from "react";
import { subscribeToAttendance } from "../services/attendanceService";
import { attendanceStatus, dateKeyFromDate } from "../utils/attendanceBehavior.mjs";

export function useAttendanceBook() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => subscribeToAttendance(setRecords, () => setError("Unable to load attendance.")), []);
  return { records, dateKey: dateKeyFromDate(), status: attendanceStatus, error };
}
