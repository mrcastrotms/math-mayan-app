import React from "react";
import TeacherJailMonitor from "../TeacherJailMonitor";
import AttendanceBook from "../AttendanceBook";
import BehaviorBook from "../BehaviorBook";

export default function TrackingTab({
  liveStudents,
  activeSection,
  sendCommand,
  setIsViewingAttendanceHistory,
}) {
  return (
    <div className="w-full max-w-4xl flex flex-col gap-6 animate-in fade-in duration-200">
      <TeacherJailMonitor
        liveStudents={liveStudents}
        activeSection={activeSection}
        onSendCommand={sendCommand}
      />
      <AttendanceBook activeSection={activeSection} onOpenHistory={() => setIsViewingAttendanceHistory(true)} />
      <BehaviorBook activeSection={activeSection} onOpenHistory={() => setIsViewingAttendanceHistory(true)} />
    </div>
  );
}
