// src/app/api/consumeBypass/route.js
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

function getDb() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_ADMIN_SDK;
    if (!raw) throw new Error("FIREBASE_ADMIN_SDK is not set");
    initializeApp({ credential: cert(JSON.parse(raw)) });
  }
  return getFirestore();
}

export async function POST(req) {
  try {
    const db = getDb();
    const body = await req.json();
    const { token, name, section } = body || {};

    if (!token) {
      return Response.json({ error: "Missing token" }, { status: 400 });
    }

    const docRef = db.collection("bypassTokens").doc(token);
    const doc = await docRef.get();

    if (!doc.exists) {
      return Response.json({ error: "Token not found" }, { status: 404 });
    }

    const data = doc.data();

    if (data.used) {
      return Response.json({ error: "Token already used" }, { status: 410 });
    }
    if (data.expiresAt.toMillis() < Date.now()) {
      return Response.json({ error: "Token expired" }, { status: 410 });
    }

    await docRef.update({ used: true, usedAt: Timestamp.now() });

    await db.collection("bypassLogs").add({
      action: "consume",
      token,
      name: name || data.requestedName || null,
      section: section || data.requestedSection || null,
      ip: req.headers.get("x-forwarded-for") || null,
      userAgent: req.headers.get("user-agent") || null,
      createdAt: Timestamp.now(),
    });

    return Response.json(
      {
        ok: true,
        name: name || data.requestedName || null,
        section: section || data.requestedSection || null,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("consumeBypass POST error", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
