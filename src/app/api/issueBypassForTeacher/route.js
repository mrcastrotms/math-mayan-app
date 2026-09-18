// src/app/api/issueBypassForTeacher/route.js
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function initAdmin() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_ADMIN_SDK;
    if (!raw) throw new Error("FIREBASE_ADMIN_SDK is not set");
    initializeApp({ credential: cert(JSON.parse(raw)) });
  }
}

export async function POST(req) {
  try {
    initAdmin();
    const db = getFirestore();
    const body = await req.json();

    const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!idToken) {
      return Response.json({ error: "Missing id token" }, { status: 401 });
    }

    const decoded = await getAuth()
      .verifyIdToken(idToken)
      .catch(() => null);
    if (!decoded) {
      return Response.json({ error: "Invalid id token" }, { status: 401 });
    }

    const teacherDoc = await db.collection("teachers").doc(decoded.uid).get();
    if (!teacherDoc.exists) {
      return Response.json({ error: "Not a teacher" }, { status: 403 });
    }

    const token = crypto.randomBytes(24).toString("hex");
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromMillis(Date.now() + 5 * 60 * 1000);

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

    return Response.json(
      { token, expiresAt: expiresAt.toMillis() },
      { status: 200 },
    );
  } catch (err) {
    console.error("issueBypassForTeacher error", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
