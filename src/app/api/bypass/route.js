// src/app/api/bypass/route.js
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
    const { secret, requestedSection, requestedName } = body || {};

    if (!secret)
      return new Response(JSON.stringify({ error: "Missing secret" }), {
        status: 400,
      });

    if (secret !== process.env.BYPASS_SECRET) {
      return new Response(JSON.stringify({ error: "Invalid secret" }), {
        status: 403,
      });
    }

    const token = crypto.randomBytes(24).toString("hex");
    const now = admin.firestore.Timestamp.now();
    const expiresAt = admin.firestore.Timestamp.fromMillis(
      Date.now() + 5 * 60 * 1000,
    ); // 5 minutes

    await db
      .collection("bypassTokens")
      .doc(token)
      .set({
        token,
        createdAt: now,
        expiresAt,
        requestedSection: requestedSection || null,
        requestedName: requestedName || null,
        used: false,
      });

    await db.collection("bypassLogs").add({
      action: "issue",
      token,
      ip: req.headers.get("x-forwarded-for") || null,
      userAgent: req.headers.get("user-agent") || null,
      createdAt: now,
    });

    return new Response(
      JSON.stringify({ token, expiresAt: expiresAt.toMillis() }),
      { status: 200 },
    );
  } catch (err) {
    console.error("bypass POST error", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
