
import { NextResponse } from "next/server";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase";

export async function GET() {
  try {
    const studentId = "4a_test_castro";
    const studentName = "Mr. Castro Test";
    const sectionName = "4A"; 
    const myEmail = "cesar015.2016@gmail.com";
    
    // 1. Add to official 4A roster
    const rosterRef = doc(db, "class_rosters", sectionName);
    const rosterSnap = await getDoc(rosterRef);
    let students = rosterSnap.exists() ? rosterSnap.data().students || [] : [];
    
    if (!students.some(s => s.id === studentId)) {
      students.push({ id: studentId, displayName: studentName });
      await setDoc(rosterRef, { students }, { merge: true });
    }

    // 2. Add to student_contacts so the Directory sees it
    await setDoc(doc(db, "student_contacts", studentId), {
      studentEmail: myEmail,
      dob: "07/19/2000",
      udid: "TEST-UDID-001",
      address: "Teacher Desk",
      parent1: { name: "Test Parent", email: myEmail, phone: "" },
      updatedAt: serverTimestamp(),
      isTestAccount: true
    });

    return NextResponse.json({ success: true, message: "Mr. Castro Test is now officially in Section 4A!" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
