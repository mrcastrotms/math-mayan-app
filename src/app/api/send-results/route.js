import { NextResponse } from "next/server";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { studentId, studentName, score, reportId } = await req.json();

    // --- SMART ID DISCOVERY ---
    let actualStudentId = studentId;
    if (!actualStudentId || actualStudentId.includes(" ") || actualStudentId === "MISSING") {
      const rostersSnap = await getDocs(collection(db, "class_rosters"));
      rostersSnap.forEach(roster => {
        const students = roster.data().students || [];
        const found = students.find(s => s.displayName === studentName || s.name === studentName);
        if (found && found.id) actualStudentId = found.id;
      });
      console.log("🔍 Smart Discovery resolved ID:", actualStudentId);
    }

    // 1. Get student contacts from Firestore
    const contactSnap = await getDoc(doc(db, "student_contacts", actualStudentId));
    if (!contactSnap.exists()) {
      return NextResponse.json({ success: false, message: "No contact info found." });
    }

    const contactData = contactSnap.data();
    const emails = [];
    if (contactData.studentEmail) emails.push(contactData.studentEmail);
    if (contactData.parent1?.email) emails.push(contactData.parent1.email);
    if (contactData.parent2?.email) emails.push(contactData.parent2.email);

    // Filter out empties or placeholders like "--"
    const validEmails = emails.filter(e => e && e.includes("@"));

    if (validEmails.length === 0) {
      return NextResponse.json({ success: false, message: "No valid emails on file." });
    }

    // 2. Configure Nodemailer (Using Gmail App Password)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 3. Construct the email
    const reportUrl = `https://mrcastro.vercel.app/?report=${reportId}`;
    
    const mailOptions = {
      from: `"Mr. Castro" <${process.env.EMAIL_USER}>`,
      to: validEmails.join(", "),
      subject: `Exam Results: ${studentName} - ${score}%`,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #ea580c; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Assessment Completed</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hello,</p>
            <p><strong>${studentName}</strong> has successfully submitted their recent assessment.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h2 style="margin: 0; font-size: 36px; color: #1f2937;">${score}%</h2>
              <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">Final Score</p>
            </div>
            <p>You can view the complete digital record, including specific questions and answers, at the secure link below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${reportUrl}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Digital Report</a>
            </div>
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">Or copy and paste this link: <br/> <a href="${reportUrl}" style="color: #ea580c;">${reportUrl}</a></p>
          </div>
        </div>
      `,
    };

    // 4. Send it!
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true, sentTo: validEmails });
    
  } catch (error) {
    console.error("Email Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
