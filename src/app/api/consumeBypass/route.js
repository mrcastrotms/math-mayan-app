// src/app/api/consumeBypass/route.js
import admin from "firebase-admin";

if (!admin.apps || admin.apps.length === 0) {
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
    const { token, name, section } = body || {};
    if (!token)
      return new Response(JSON.stringify({ error: "Missing token" }), {
        status: 400,
      });

    const docRef = db.collection("bypassTokens").doc(token);
    const doc = await docRef.get();
    if (!doc.exists)
      return new Response(JSON.stringify({ error: "Token not found" }), {
        status: 404,
      });

    const data = doc.data();
    if (data.used)
      return new Response(JSON.stringify({ error: "Token already used" }), {
        status: 410,
      });
    if (data.expiresAt.toMillis() < Date.now()) {
      return new Response(JSON.stringify({ error: "Token expired" }), {
        status: 410,
      });
    }

    await docRef.update({
      used: true,
      usedAt: admin.firestore.Timestamp.now(),
    });

    await db.collection("bypassLogs").add({
      action: "consume",
      token,
      name: name || data.requestedName || null,
      section: section || data.requestedSection || null,
      ip: req.headers.get("x-forwarded-for") || null,
      userAgent: req.headers.get("user-agent") || null,
      createdAt: admin.firestore.Timestamp.now(),
    });

    return new Response(
      JSON.stringify({
        ok: true,
        name: name || data.requestedName || null,
        section: section || data.requestedSection || null,
      }),
      { status: 200 },
    );
  } catch (err) {
    console.error("consumeBypass POST error", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
