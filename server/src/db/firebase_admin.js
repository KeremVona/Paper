import {
  initializeApp,
  credential as _credential,
  firestore,
} from "firebase-admin";

const SERVICE_ACCOUNT_KEY_JSON = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!SERVICE_ACCOUNT_KEY_JSON) {
  console.error(
    "FATAL ERROR: FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set."
  );
  process.exit(1);
}

try {
  const serviceAccount = JSON.parse(SERVICE_ACCOUNT_KEY_JSON);

  initializeApp({
    credential: _credential.cert(serviceAccount),
  });

  console.log("✅ Firebase Admin SDK Initialized.");
} catch (error) {
  console.error(
    "FATAL ERROR: Failed to initialize Firebase Admin SDK. Check SERVICE_ACCOUNT_KEY format.",
    error
  );
  process.exit(1);
}

const db = firestore();
export default { db };
