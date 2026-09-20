import { useEffect, useState } from "react";
import { subscribeToAssignedWorks } from "../services/worksheetService";

export function useAssignedWorks(section) {
  const [works, setWorks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!section) return undefined;
    return subscribeToAssignedWorks(
      section,
      setWorks,
      () => setError("Assigned work is temporarily unavailable."),
    );
  }, [section]);

  return { works, error };
}
