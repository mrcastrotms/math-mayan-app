import crypto from "crypto";
import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { adminDb } from "./firebaseAdmin";

const COOKIE_NAME = "teacher_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const attempts = new Map();

function initAdmin() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_ADMIN_SDK;
    if (raw) initializeApp({ credential: cert(JSON.parse(raw)) });
  }
}

function getPinHash() {
  return process.env.TEACHER_PIN_SHA256 || "";
}

function hashPin(pin) {
  return crypto.createHash("sha256").update(pin).digest("hex");
}

function getAttemptKey(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export function isPinRateLimited(request) {
  const key = getAttemptKey(request);
  const record = attempts.get(key);
  if (!record) return false;
  if (record.resetAt <= Date.now()) {
    attempts.delete(key);
    return false;
  }
  return record.count >= 5;
}

export function recordPinAttempt(request, succeeded) {
  const key = getAttemptKey(request);
  if (succeeded) {
    attempts.delete(key);
    return;
  }
  const record = attempts.get(key);
  const next = {
    count: (record?.count || 0) + 1,
    resetAt: record?.resetAt || Date.now() + 60_000,
  };
  attempts.set(key, next);
}

export function verifyConfiguredPin(pin) {
  const expected = getPinHash();
  if (!expected || !/^[a-f0-9]{64}$/i.test(expected)) return false;
  const actualBuffer = Buffer.from(hashPin(pin), "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

export async function createTeacherSession() {
  initAdmin();
  const session = crypto.randomBytes(32).toString("hex");
  await adminDb.collection("teacherSessions").doc(session).set({
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + SESSION_TTL_SECONDS * 1000),
  });
  return session;
}

export async function requireTeacherSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME)?.value;
  if (!session) return false;
  const snapshot = await adminDb.collection("teacherSessions").doc(session).get();
  if (!snapshot.exists) return false;
  const data = snapshot.data();
  if (!data?.expiresAt || data.expiresAt.toMillis?.() < Date.now()) return false;
  return true;
}

export function teacherSessionCookie(session) {
  return {
    name: COOKIE_NAME,
    value: session,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

export async function requireTeacherIdToken(request) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";
  if (!token) return null;
  initAdmin();
  try {
    const decoded = await getAuth().verifyIdToken(token);
    const teacher = await adminDb.collection("teachers").doc(decoded.uid).get();
    return teacher.exists ? decoded : null;
  } catch {
    return null;
  }
}
