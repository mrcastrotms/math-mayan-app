/**
 * scripts/createTeacher.js
 * Usage:
 *   export FIREBASE_ADMIN_SDK="$(cat serviceAccount.json)"
 *   node scripts/createTeacher.js --uid=TEACHER_UID --email=teacher@example.com --name="Teacher Name"
 *
 * Or set GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json and run without exporting FIREBASE_ADMIN_SDK.
 */
const fs = require('fs');
const admin = require('firebase-admin');

function getArg(name) {
  const arg = process.argv.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : null;
}

const uid = getArg('uid');
const email = getArg('email');
const name = getArg('name') || null;

if (!uid || !email) {
  console.error('Missing required args. Example: --uid=UID --email=teacher@example.com --name="Teacher Name"');
  process.exit(1);
}

// Initialize admin SDK using either FIREBASE_ADMIN_SDK env var (stringified JSON) or GOOGLE_APPLICATION_CREDENTIALS file
if (!admin.apps.length) {
  const sdkJson = process.env.FIREBASE_ADMIN_SDK;
  if (sdkJson) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(sdkJson)),
    });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    admin.initializeApp({
      credential: admin.credential.cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS)),
    });
  } else if (fs.existsSync('./serviceAccount.json')) {
    admin.initializeApp({
      credential: admin.credential.cert(require('./serviceAccount.json')),
    });
  } else {
    console.error('No Firebase admin credentials found. Set FIREBASE_ADMIN_SDK env var or create serviceAccount.json or set GOOGLE_APPLICATION_CREDENTIALS.');
    process.exit(1);
  }
}

const db = admin.firestore();

(async () => {
  try {
    const docRef = db.collection('teachers').doc(uid);
    const now = admin.firestore.Timestamp.now();
    const payload = {
      uid,
      email,
      displayName: name,
      createdAt: now,
      role: 'teacher'
    };
    await docRef.set(payload, { merge: true });
    console.log('Teacher record created/updated:', uid);
    console.log(JSON.stringify(payload, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error creating teacher record:', err);
    process.exit(1);
  }
})();
