import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import * as dotenv from "dotenv";


// Load the appropriate .env file based on NODE_ENV
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env' });
} else {
  dotenv.config({ path: '.env.development' });
}

console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("FIREBASE_API_KEY:", process.env.FIREBASE_API_KEY);



// Firebase configuration object, loaded from environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};





// Initialize Firebase with the configuration
const app = initializeApp(firebaseConfig);

// Log the Firestore project ID (Database ID)
const databaseLocation = 'nam5';  // Manually set the region from your Firestore details
const databaseId = `${firebaseConfig.projectId}-${databaseLocation}`;

// Log the constructed Database ID
console.log("Connected Firestore Database ID:", databaseId);

console.log("Firebase initialized:", app.name); 
console.log("Connected Firestore Project ID (Database ID):", firebaseConfig.projectId);

// Export Firestore and Firebase Authentication instances
export const auth = getAuth(app);
export const firestore = getFirestore(app);
