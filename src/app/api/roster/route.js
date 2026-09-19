import { NextResponse } from "next/server";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";

export const dynamic = "force-dynamic";

const VALID_SECTIONS = ["4A", "4B", "4C", "4D", "4E", "5B"];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");
    const authHeader = request.headers.get("x-teacher-pin");
    const isTeacher = authHeader === "0801";

    if (section && section !== "All") {
      if (!VALID_SECTIONS.includes(section)) {
        return NextResponse.json(
          { error: "Invalid section requested." },
          { status: 400 }
        );
      }

      const docRef = doc(db, "class_rosters", section);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return NextResponse.json({ section, students: [] }, { status: 200 });
      }

      const data = snapshot.data();
      const students = (data.students || []).map((s) => ({
        id: s.id,
        rawName: s.rawName,
        displayName: s.displayName,
        firstName: s.firstName,
        lastName: s.lastName,
        section: s.section,
      }));

      return NextResponse.json({
        section,
        studentCount: students.length,
        students,
      });
    }

    if (!isTeacher) {
      return NextResponse.json(
        { error: "Unauthorized access to complete directory." },
        { status: 401 }
      );
    }

    const colRef = collection(db, "class_rosters");
    const snapshot = await getDocs(colRef);
    const result = {};

    snapshot.forEach((d) => {
      const data = d.data();
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
