import { useEffect, useState } from "react";
import { subscribeToBehavior } from "../services/behaviorService";
import { dateKeyFromDate, relativeBehaviorScores } from "../utils/attendanceBehavior.mjs";

export function useBehaviorBook() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => subscribeToBehavior(setRecords, () => setError("Unable to load behavior records.")), []);
  return { records: relativeBehaviorScores(records), dateKey: dateKeyFromDate(), error };
}
