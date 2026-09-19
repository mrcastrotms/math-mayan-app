// src/utils/joinHandler.js
export function handleStudentJoin({ name, code, uid, section, state, router }) {
  state?.setCustomStudentName?.(name);
  state?.setSessionCodeInput?.(code);
  state?.setSelectedSection?.(section);
  state?.setStudent?.({ name, uid, section });

  state?.handleVerifyAndStart?.(code, section);
}
