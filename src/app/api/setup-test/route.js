
import { NextResponse } from "next/server";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase";

export async function GET() {
  try {
    await setDoc(doc(db, "student_contacts", "isolated_test"), {
      studentEmail: "cesar015.2016@gmail.com",
      parent1: { email: "cesar015.2016@gmail.com" }
    }, { merge: true });
    return NextResponse.json({ success: true, message: "Database test account ready! You can now run the fetch command in the console." });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
