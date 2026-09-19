import { NextResponse } from "next/server";
import {
  createTeacherSession,
  isPinRateLimited,
  recordPinAttempt,
  teacherSessionCookie,
  verifyConfiguredPin,
} from "../../../../lib/teacherAuth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  if (isPinRateLimited(request)) {
    return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
  }

  try {
    const { pin } = await request.json();
    const valid = typeof pin === "string" && verifyConfiguredPin(pin.trim());
    recordPinAttempt(request, valid);
    if (!valid) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const session = await createTeacherSession();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(teacherSessionCookie(session));
    return response;
  } catch (error) {
    console.error("[API/TEACHER/VERIFY] Error:", error);
    return NextResponse.json({ error: "Unable to verify teacher access." }, { status: 500 });
  }
}
