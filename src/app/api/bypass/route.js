// src/app/api/bypass/route.js
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import crypto from "crypto";

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
    const { secret, requestedSection, requestedName } = body || {};

    if (!secret) {
      return Response.json({ error: "Missing secret" }, { status: 400 });
    }
    if (secret !== process.env.BYPASS_SECRET) {
      return Response.json({ error: "Invalid secret" }, { status: 403 });
    }

    const token = crypto.randomBytes(24).toString("hex");
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromMillis(Date.now() + 5 * 60 * 1000); // 5 min

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

    return Response.json(
      { token, expiresAt: expiresAt.toMillis() },
      { status: 200 },
    );
  } catch (err) {
    console.error("bypass POST error", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
