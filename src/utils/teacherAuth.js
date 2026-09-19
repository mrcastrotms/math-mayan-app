export async function verifyTeacherPin(pin) {
  const response = await fetch("/api/teacher/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin }),
  });
  if (!response.ok) return false;
  return true;
}
