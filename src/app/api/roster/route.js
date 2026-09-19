import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebaseAdmin";
import { requireTeacherSession } from "../../../lib/teacherAuth";

export const dynamic = "force-dynamic";

const VALID_SECTIONS = ["4A", "4B", "4C", "4D", "4E", "5B"];

export async function GET(request) {
  try {
    if (!(await requireTeacherSession())) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");
    if (section && section !== "All" && !VALID_SECTIONS.includes(section)) {
      return NextResponse.json({ error: "Invalid section requested." }, { status: 400 });
    }
    const colRef = collection(adminDb, "class_rosters");
    const snapshot = await getDocs(colRef);
    const result = {};

    snapshot.forEach((d) => {
      const data = d.data();
      if (section && section !== "All" && d.id !== section) return;
      result[d.id] = (data.students || []).map((s) => ({
        id: s.id,
        rawName: s.rawName,
        displayName: s.displayName,
        firstName: s.firstName,
        lastName: s.lastName,
        section: s.section,
      }));
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API/ROSTER] Retrieval error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve roster data." },
      { status: 500 }
    );
  }
}

function normalizeName(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export async function POST(request) {
  try {
    const { section, name } = await request.json();
    if (!VALID_SECTIONS.includes(section) || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Section and name are required." }, { status: 400 });
    }

    const snapshot = await adminDb.collection("class_rosters").doc(section).get();
    const target = normalizeName(name);
    const students = snapshot.exists ? snapshot.data()?.students || [] : [];
    const match = students.find((student) => {
      const candidates = [
        student.rawName,
        student.displayName,
        [student.firstName, student.lastName].filter(Boolean).join(" "),
      ];
      return candidates.some((candidate) => normalizeName(candidate) === target);
    });

    if (!match) return NextResponse.json({ matched: false }, { status: 200 });
    return NextResponse.json({
      matched: true,
      officialName: match.displayName || match.rawName || name.trim(),
    });
  } catch (error) {
    console.error("[API/ROSTER] Validation error:", error);
    return NextResponse.json({ error: "Unable to validate roster entry." }, { status: 500 });
  }
}
