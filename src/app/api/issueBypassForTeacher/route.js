// src/app/api/issueBypassForTeacher/route.js
import admin from "firebase-admin";
import crypto from "crypto";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_ADMIN_SDK || "{}"),
    ),
  });
}
const db = admin.firestore();

export async function POST(req) {
  try {
    const body = await req.json();
    const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!idToken)
      return new Response(JSON.stringify({ error: "Missing id token" }), {
        status: 401,
      });

    const decoded = await admin
      .auth()
      .verifyIdToken(idToken)
      .catch(() => null);
    if (!decoded)
      return new Response(JSON.stringify({ error: "Invalid id token" }), {
        status: 401,
      });

    const teacherDoc = await db.collection("teachers").doc(decoded.uid).get();
    if (!teacherDoc.exists)
      return new Response(JSON.stringify({ error: "Not a teacher" }), {
        status: 403,
      });

    // Issue bypass token for teacher
    const token = crypto.randomBytes(24).toString("hex");
    const now = admin.firestore.Timestamp.now();
    const expiresAt = admin.firestore.Timestamp.fromMillis(
      Date.now() + 5 * 60 * 1000,
    );

    await db
      .collection("bypassTokens")
      .doc(token)
      .set({
        token,
        createdAt: now,
        expiresAt,
        issuedBy: decoded.uid,
        requestedSection: body.requestedSection || null,
        requestedName: body.requestedName || null,
        used: false,
      });

    await db.collection("bypassLogs").add({
      action: "issue_by_teacher",
      token,
      issuedBy: decoded.uid,
      ip: req.headers.get("x-forwarded-for") || null,
      userAgent: req.headers.get("user-agent") || null,
      createdAt: now,
    });

    return new Response(
      JSON.stringify({ token, expiresAt: expiresAt.toMillis() }),
      { status: 200 },
    );
  } catch (err) {
    console.error("issueBypassForTeacher error", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
