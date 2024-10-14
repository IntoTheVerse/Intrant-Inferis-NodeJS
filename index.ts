import * as express from 'express';
import * as dotenv from "dotenv";
import axios from 'axios';
import { Request, Response } from 'express';
import * as crypto from 'crypto';
import { auth, firestore } from './config/firebaseConfig';
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail, updatePassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getDocs, doc, collection, setDoc, updateDoc, deleteDoc, increment, getDoc } from 'firebase/firestore';
import { setLogLevel } from 'firebase/app';

dotenv.config();

const app: express.Application = express();
const port = process.env.PORT || 8080;
const cors = require('cors');
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Load the appropriate .env file based on NODE_ENV
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env' });
} else {
  dotenv.config({ path: '.env.development' });
}

console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("FIREBASE_API_KEY:", process.env.FIREBASE_API_KEY);

console.log('Firebase Config:', {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
});


axios.get('https://firebase.google.com')
  .then(response => console.log('Network Request Successful:', response.status))
  .catch(error => console.error('Network Request Failed:', error));



// const allXpLevels = [400, 1000, 1700, 2500, 3600, 5000];
// const allRewardsLevels = [10_000, 8_000, 6_500, 5_000, 3_500, 2_000, 1_000, 800, 400, 100];

/* -------------------------------------------------------------------------- */
/*                                Helper Code                                 */
/* -------------------------------------------------------------------------- */

/* ------------------------------ Burn NFT ------------------------------ */


/* -------------------------------------------------------------------------- */
/*                                End of Helper Code                          */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/*                                Search Code                               */
/* -------------------------------------------------------------------------- */

/* ------------------------------ Search By NFTId ------------------------------ */



/* ------------------------------ Get Collection By Owner ------------------------------ */


/* -------------------------------------------------------------------------- */
/*                                End of Search Code                         */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/*                                Get All Default Code                        */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/*                      Register New User Code                                */

/* 

Firestore (Root)
└── users (Collection)
    ├── userId1 (Document)   <-- Firebase UID and referenceId from GameShift
    │   ├── email: "user1@example.com"
    │   ├── referenceId: "userId1"  <-- Same as the document ID (userId)
    │   ├── walletAddress: "E1B7CmYQtWZUdJqtERcszT2ovPESM5A2aWpbrCXYob1q"
    │   ├── walletProvider: "GameShift"
    ├── userId2 (Document)
    │   ├── email: "user2@example.com"
    │   ├── referenceId: "userId2"
    │   ├── walletAddress: "A5D8CmYQtWZUdJqtERcszT2ovPESM5A2aWpbrCXYob3c"
    │   ├── walletProvider: "GameShift"
    └── ... (Other user documents)

*/

/* -------------------------------------------------------------------------- */

/* ----------------- Register User with Gameshift --------------------------- */

app.post('/registerUser', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Log incoming request
    console.log('Register User API hit. Request Body:', { email, password });

    // Create user in Firebase Auth
    console.log('Attempting to create user in Firebase Auth...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid; // Firebase UID will be used as document ID
    console.log(`User created in Firebase Auth. UID: ${userId}`);

    // Register user with GameShift using Firebase UID as the referenceId
    console.log(`Registering user with GameShift API. UID: ${userId}`);
    const gameShiftResponse = await axios.post(
      'https://api.gameshift.dev/nx/users',
      {
        referenceId: userId,  // Using Firebase UID as referenceId
        email: email,
      },
      {
        headers: {
          'accept': 'application/json',
          'x-api-key': process.env.GAMESHIFT_API_KEY,
          'content-type': 'application/json',
        },
      }
    );
    console.log('User registered with GameShift. Response:', gameShiftResponse.data);

    // Store user details in Firestore, using userId (Firebase UID) as the document ID
    const userDoc = doc(firestore, 'users', userId);
    console.log('Storing user details in Firestore...');
    await setDoc(userDoc, {
      email,  // Store only the email and referenceId (which is the same as userId)
      referenceId: gameShiftResponse.data.referenceId,
    });
    console.log('User details stored in Firestore successfully.');

    // Get the wallet address from GameShift using the referenceId
    console.log('Fetching wallet details from GameShift...');
    const walletResponse = await axios.get(
      `https://api.gameshift.dev/nx/users/${gameShiftResponse.data.referenceId}/wallet-address`,
      {
        headers: {
          'accept': 'application/json',
          'x-api-key': process.env.GAMESHIFT_API_KEY,
        },
      }
    );
    console.log('Wallet details retrieved from GameShift:', walletResponse.data);

    // Update the Firestore document with wallet address and provider
    console.log('Updating Firestore document with wallet details...');
    await updateDoc(userDoc, {
      walletAddress: walletResponse.data.address,
      walletProvider: walletResponse.data.walletProvider,
    });
    console.log('Firestore document updated with wallet details successfully.');

    // Respond with success
    res.status(200).json({
      message: 'User registered successfully',
      gameShiftData: gameShiftResponse.data,
      walletData: walletResponse.data,
    });

  } catch (error: unknown) {
    console.error('Error during user registration:', error);
  
    // Type-check and cast the error to an instance of Error
    if (error instanceof Error) {
      console.error("Error during Firebase Auth:", error);
      console.error("Error details:", error.message, error.name, error.stack);
      res.status(500).send({ message: 'User registration failed', error: error.message });
    } else {
      // This handles any non-standard error object (e.g., strings, other objects)
      console.error("Unexpected error:", error);
      res.status(500).send({ message: 'An unexpected error occurred', error: String(error) });
    }
  }
});





/* ----------------- Reset Password with Firebase Auth --------------------------- */

app.post('/resetPassword', async (req, res) => {
  const { email } = req.body;

  try {
    // Send password reset email using Firebase Auth
    await sendPasswordResetEmail(auth, email);

    res.status(200).json({
      message: 'Password reset email sent successfully!',
    });

  } catch (error) {
    // Handle the unknown error properly by checking its type
    if (error instanceof Error) {
      console.error(error.message);
      res.status(500).send({
        message: 'Failed to send password reset email.',
        error: error.message,
      });
    } else {
      console.error("Unexpected error", error);
      res.status(500).send({
        message: 'An unexpected error occurred.',
        error: String(error),
      });
    }
  }
});

/* ----------------- Change/Update Password with Firebase Auth --------------------------- */


// app.post('/changePassword', async (req, res) => {
//   const { newPassword } = req.body;

//   try {
//     const user = auth.currentUser; // Get the currently logged-in user

//     if (user) {
//       await updatePassword(user, newPassword); // Update password
//       res.status(200).json({
//         message: 'Password updated successfully!',
//       });
//     } else {
//       res.status(400).json({
//         message: 'No user is logged in.',
//       });
//     }
    
//   } catch (error) {
//     console.error("Unexpected error", error);
//       res.status(500).send({
//         message: 'Failed to update password.',
//         error: String(error),
//       });
//   }
// });

app.post('/changePassword', async (req, res) => {
  const { newPassword } = req.body;

  try {
    const user = auth.currentUser; // Get the currently logged-in user

    if (user) {
      // Get the ID token for the currently authenticated user
      const token = await user.getIdToken();
      console.log('ID Token:', token);

      // Update password
      await updatePassword(user, newPassword); 
      res.status(200).json({
        message: 'Password updated successfully!',
      });
    } else {
      res.status(400).json({
        message: 'No user is logged in.',
      });
    }

  } catch (error) {
    console.error("Unexpected error", error);
    res.status(500).send({
      message: 'Failed to update password.',
      error: String(error),
    });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Log in the user with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password); // Corrected function usage
    const user = userCredential.user;

    // Get the ID token after login
    const token = await user.getIdToken();

    // Respond with the ID token and user info
    res.status(200).json({
      message: 'Login successful',
      token: token,
      user: {
        uid: user.uid,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);

    if (error instanceof Error) {
      res.status(500).json({
        message: 'Login failed',
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: 'An unexpected error occurred during login',
        error: String(error),
      });
    }
  }
});

/* -------------------------------------------------------------------------- */
/* ----------------- Check if User is Logged In --------------------------- */
app.get('/checkLoginStatus', async (req, res) => {
  try {
    const user = auth.currentUser; // Check the currently logged-in user

    if (user) {
      const token = await user.getIdToken();
      res.status(200).json({
        isLoggedIn: true,
        message: 'User is logged in',
        token: token,
        user: {
          uid: user.uid,
          email: user.email,
        },
      });
    } else {
      res.status(200).json({
        isLoggedIn: false,
        message: 'No user is logged in',
      });
    }
  } catch (error) {
    console.error('Error checking login status:', error);

    if (error instanceof Error) {
      res.status(500).json({
        message: 'Failed to check login status',
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: 'An unexpected error occurred while checking login status',
        error: String(error),
      });
    }
  }
});


/* ----------------- LOGOUT --------------------- */

app.post('/logout', async (req, res) => {
  try {
    await signOut(auth); // Sign out the user

    res.status(200).json({
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Error during logout:', error);

    if (error instanceof Error) {
      res.status(500).json({
        message: 'Logout failed',
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: 'An unexpected error occurred during logout',
        error: String(error),
      });
    }
  }
});


/* -------------------------------------------------------------------------- */
/*               End of Register User with Gameshift Code                     */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                             Asset Collection                               */
/* -------------------------------------------------------------------------- */

/* ---------------------------- Mint Collection------------------------------ */
app.post('/createCollection', async (req, res) => {
  const { name, description, imageUrl, contains } = req.body;

  try {
    console.log('Create Collection API hit. Request Body:', { name, description, imageUrl, contains });

    // Step 1: Create the collection with GameShift
    const gameShiftResponse = await axios.post(
      'https://api.gameshift.dev/nx/asset-collections',
      { name, description, imageUrl, contains },
      {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'x-api-key': process.env.GAMESHIFT_API_KEY,
        },
      }
    );

    const collectionId = gameShiftResponse.data.id;
    console.log(`Collection created. ID: ${collectionId}`);

    res.status(200).json({
      message: 'Collection created successfully. Waiting for minting completion.',
      collectionId,
    });

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('AxiosError during collection creation:', error.message);
      res.status(500).send({
        message: 'Collection creation failed',
        error: error.message,
        details: error.response?.data,
      });
    } else if (error instanceof Error) {
      console.error('Error during collection creation:', error.message);
      res.status(500).send({
        message: 'Collection creation failed',
        error: error.message,
      });
    } else {
      console.error('Unknown error during collection creation:', error);
      res.status(500).send({
        message: 'An unexpected error occurred',
        error: String(error),
      });
    }
  }
});

/* ---------------------------- WEBHOOK: Collection Mint Completed ------------------------------ */
app.post('/webhooks/collection-mint-completed', async (req, res) => {
  const webhookSecret = process.env.GAMESHIFT_WEBHOOK_VALIDATION_KEY;

  if (!webhookSecret) {
    return res.status(500).json({ message: 'Webhook secret not configured' });
  }

  // Extract headers for webhook signature verification
  const webhookId = Array.isArray(req.headers['webhook-id']) 
    ? req.headers['webhook-id'][0] 
    : req.headers['webhook-id'];
  const webhookTimestamp = Array.isArray(req.headers['webhook-timestamp']) 
    ? req.headers['webhook-timestamp'][0] 
    : req.headers['webhook-timestamp'];
  const webhookSignature = Array.isArray(req.headers['webhook-signature']) 
    ? req.headers['webhook-signature'][0] 
    : req.headers['webhook-signature'];

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    return res.status(400).json({ message: 'Missing webhook headers' });
  }

  // Extract the event data
  const webhookData = req.body?.data;
  const eventType = req.body?.type;
  const collectionId = webhookData?.collectionId;
  const status = webhookData?.status;

  // Verify the webhook signature
  const isVerified = verifyWebhook(webhookId, webhookTimestamp, webhookSignature, webhookData, webhookSecret);
  if (!isVerified) {
    console.log('Invalid webhook signature');
    return res.status(403).json({ message: 'Invalid webhook signature' });
  }

  if (!collectionId) {
    return res.status(400).json({ message: 'Missing collectionId' });
  }

  try {
    // Proceed only if the event status is 'completed'
    if (status === 'completed') {
      const apiUrl = `https://api.gameshift.dev/nx/asset-collections/${collectionId}?includeStats=false`;
      const apiOptions = {
        method: 'GET',
        url: apiUrl,
        headers: {
          accept: 'application/json',
          'x-api-key': process.env.GAMESHIFT_API_KEY,
        },
      };

      const apiResponse = await axios.request(apiOptions);
      const collectionDetails = apiResponse.data;

      if (!collectionDetails || !collectionDetails.id) {
        throw new Error('Unable to fetch collection details from GameShift');
      }

      console.log('Collection details retrieved:', collectionDetails);

      // Store collection details in Firestore using the collectionId as document ID under ii-collections
      const collectionDoc = doc(firestore, 'ii-collections', collectionId);

      await setDoc(collectionDoc, {
        id: collectionDetails.id,
        name: collectionDetails.name,
        description: collectionDetails.description,
        environment: collectionDetails.environment,
        imageUrl: collectionDetails.imageUrl,
        imported: collectionDetails.imported,
        mintAddress: collectionDetails.mintAddress,
        created: collectionDetails.created,
        contains: collectionDetails.contains,
      });

      console.log('Collection details stored in Firestore successfully.');

      res.status(200).json({
        message: 'Collection mint completed and details stored successfully',
      });
    } else {
      // Handle other event statuses (like initiated or failed)
      res.status(200).json({ message: `Event received: ${status}` });
    }

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('Unexpected error:', error);
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
});


interface Collection {
  id: string;
  name: string;
  description: string;
  environment: string;
  imageUrl: string;
  imported: boolean;
  mintAddress: string;
  created: number;
  contains: string;
}

/* ---------------- Fetch All Collections and store new collections in Firestore 'all-collections' ------------------------------ */
// Route to fetch all collections from GameShift and update Firestore
app.get('/fetchCollections', async (req, res) => {
  try {
    // Step 1: Fetch all collections from GameShift API
    console.log('Fetching all collections from GameShift...');
    const gameShiftResponse = await axios.get('https://api.gameshift.dev/nx/asset-collections', {
      headers: {
        accept: 'application/json',
        'x-api-key': process.env.GAMESHIFT_API_KEY,
      },
    });

    const collectionsData: Collection[] = gameShiftResponse.data.data; // The list of collections from the API
    console.log(`Fetched ${collectionsData.length} collections from GameShift.`);

    // Step 2: Check Firestore for existing collections and compare with the fetched data
    const firestoreCollectionRef = collection(firestore, 'all-collections');
    const existingCollectionsSnapshot = await getDocs(firestoreCollectionRef);
    const existingCollections = existingCollectionsSnapshot.docs.map(doc => doc.id);

    // Step 3: Iterate over the fetched collections and store any new collections in Firestore
    const newCollections = collectionsData.filter((collection: Collection) => !existingCollections.includes(collection.id));
    if (newCollections.length === 0) {
      console.log('No new collections to add.');
    } else {
      console.log(`Adding ${newCollections.length} new collections to Firestore.`);
    }

    for (const newCollection of newCollections) {
      const collectionDoc = doc(firestore, 'all-collections', newCollection.id);
      await setDoc(collectionDoc, {
        id: newCollection.id,
        name: newCollection.name,
        description: newCollection.description,
        environment: newCollection.environment,
        imageUrl: newCollection.imageUrl,
        imported: newCollection.imported,
        mintAddress: newCollection.mintAddress,
        created: newCollection.created,
        contains: newCollection.contains,
      });
      console.log(`Stored new collection with ID: ${newCollection.id}`);
    }

    // Step 4: Respond with the list of new collections added to Firestore and all GameShift collections
    res.status(200).json({
      message: `${newCollections.length} new collections added to Firestore.`,
      newCollections,
      allGameShiftCollections: collectionsData, // Adding all collections from GameShift in the response
    });

  } catch (error: unknown) {
    // Handle errors with axios and Firestore
    if (axios.isAxiosError(error)) {
      console.error('AxiosError during collection fetch:', error.message);
      res.status(500).send({
        message: 'Failed to fetch collections from GameShift',
        error: error.message,
      });
    } else if (error instanceof Error) {
      console.error('Error during collection fetch:', error.message);
      res.status(500).send({
        message: 'An error occurred during collection fetch',
        error: error.message,
      });
    } else {
      console.error('Unknown error during collection fetch:', error);
      res.status(500).send({
        message: 'An unexpected error occurred',
        error: String(error),
      });
    }
  }
});


/* -------------------- Import External Collection and store in 'ii-collections'  --------------------------- */

/// Route to import an external asset collection into GameShift
app.post('/importCollection', async (req, res) => {
  const { collectionAddress } = req.body;

  try {
    // Log incoming request
    console.log('Import Collection API hit. Request Body:', { collectionAddress });

    // Step 1: Check if the collection is already imported by querying all existing collections
    console.log('Fetching all existing collections to check for duplicates...');
    const existingCollectionsResponse = await axios.get(
      'https://api.gameshift.dev/nx/asset-collections',
      {
        headers: {
          accept: 'application/json',
          'x-api-key': process.env.GAMESHIFT_API_KEY,
        },
      }
    );

    const existingCollections: Collection[] = existingCollectionsResponse.data.data;

    // Specify that the collection object being checked is of type 'Collection'
    const existingCollection = existingCollections.find((collection: Collection) => collection.mintAddress === collectionAddress);

    if (existingCollection) {
      // If the collection with the mint address already exists, return a response
      console.log(`Collection with mint address ${collectionAddress} already exists. ID: ${existingCollection.id}`);
      return res.status(200).json({
        message: 'Collection already imported',
        collectionData: existingCollection,
      });
    }

    // Step 2: Import the collection into GameShift if it doesn't exist already
    console.log('Importing external collection into GameShift...');
    const gameShiftResponse = await axios.post(
      'https://api.gameshift.dev/nx/asset-collections/import',
      { collectionAddress },
      {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'x-api-key': process.env.GAMESHIFT_API_KEY,
        },
      }
    );

    const importedCollection: Collection = gameShiftResponse.data;
    console.log('Collection imported successfully:', importedCollection);

    // Step 3: Store the imported collection details in Firestore
    console.log('Storing imported collection details in Firestore...');
    const collectionDoc = doc(firestore, 'ii-collections', importedCollection.id);
    await setDoc(collectionDoc, {
      id: importedCollection.id,
      name: importedCollection.name,
      description: importedCollection.description,
      environment: importedCollection.environment,
      imageUrl: importedCollection.imageUrl,
      imported: importedCollection.imported,
      mintAddress: importedCollection.mintAddress,
      created: importedCollection.created,
      contains: importedCollection.contains,
    });
    console.log('Imported collection details stored in Firestore successfully.');

    // Respond with success
    res.status(200).json({
      message: 'Collection imported and stored successfully',
      gameShiftData: importedCollection,
    });

  } catch (error) {
    // Handle errors
    if (axios.isAxiosError(error)) {
      console.error('AxiosError during collection import:', error.message);
      res.status(500).send({
        message: 'Collection import failed',
        error: error.message,
        details: error.response?.data,  // Include additional details if available
      });
    } else if (error instanceof Error) {
      console.error('Error during collection import:', error.message);
      res.status(500).send({
        message: 'Collection import failed',
        error: error.message,
      });
    } else {
      console.error('Unknown error during collection import:', error);
      res.status(500).send({
        message: 'An unexpected error occurred',
        error: String(error),
      });
    }
  }
});

/* ------------------------------ Unimport External Collections in Gameshift ------------------------------ */
app.post('/unimportCollection', async (req, res) => {
  const { collectionId } = req.body;

  try {
    // Log incoming request
    console.log(`Unimport Collection API hit. Request Body:`, { collectionId });

    // Step 1: Unimport the collection from GameShift
    console.log(`Unimporting collection from GameShift with ID: ${collectionId}...`);
    const gameShiftResponse = await axios.post(
      `https://api.gameshift.dev/nx/asset-collections/${collectionId}/un-import`,
      {},
      {
        headers: {
          accept: 'application/json',
          'x-api-key': process.env.GAMESHIFT_API_KEY,
        },
      }
    );

    // Get the response data
    const unimportedCollection = gameShiftResponse.data;
    console.log('Collection unimported successfully:', unimportedCollection);

    // Step 2: Remove the collection from Firestore in 'all-collections' and 'ii-collections'
    console.log(`Removing collection from Firestore collections 'all-collections' and 'ii-collections'...`);

    // Reference to both collections
    const allCollectionsDoc = doc(firestore, 'all-collections', collectionId);
    const iiCollectionsDoc = doc(firestore, 'ii-collections', collectionId);

    // Delete the documents from Firestore
    await deleteDoc(allCollectionsDoc);
    await deleteDoc(iiCollectionsDoc);

    console.log(`Collection with ID: ${collectionId} removed from Firestore.`);

    // Step 3: Respond with success message
    res.status(200).json({
      message: 'Collection unimported and removed from Firestore successfully',
      unimportedCollection,
    });

  } catch (error) {
    // Handle errors
    if (axios.isAxiosError(error)) {
      console.error('AxiosError during collection unimport:', error.message);
      res.status(500).send({
        message: 'Collection unimport failed',
        error: error.message,
        details: error.response?.data,  // Include additional details if available
      });
    } else if (error instanceof Error) {
      console.error('Error during collection unimport:', error.message);
      res.status(500).send({
        message: 'Collection unimport failed',
        error: error.message,
      });
    } else {
      console.error('Unknown error during collection unimport:', error);
      res.status(500).send({
        message: 'An unexpected error occurred',
        error: String(error),
      });
    }
  }
});


/* -------------------- Fetch Asset Collection's Asset Items ------------------------------ */

app.get('/fetchCollectionAssets/:collectionId', async (req, res) => {
  const { collectionId } = req.params; // Get the collection ID from the request parameters

  try {
    // Log the incoming request
    console.log(`Fetching assets for collection ID: ${collectionId}`);

    // Step 1: Fetch the assets for the given collection ID from GameShift API
    const gameShiftResponse = await axios.get(
      `https://api.gameshift.dev/nx/asset-collections/${collectionId}/assets`,
      {
        headers: {
          accept: 'application/json',
          'x-api-key': process.env.GAMESHIFT_API_KEY,  // Use your GameShift API key from environment variables
        },
      }
    );

    const assetsData = gameShiftResponse.data; // The list of assets from the API
    console.log(`Fetched ${assetsData.length} assets for collection ID: ${collectionId}`);

    // Step 2: Respond with the fetched assets
    res.status(200).json({
      message: `Fetched ${assetsData.length} assets for collection ID: ${collectionId}`,
      assets: assetsData,
    });

  } catch (error) {
    // Handle errors
    if (axios.isAxiosError(error)) {
      console.error('AxiosError during asset collection fetch:', error.message);
      res.status(500).send({
        message: 'Failed to fetch assets from GameShift',
        error: error.message,
      });
    } else if (error instanceof Error) {
      console.error('Error during asset collection fetch:', error.message);
      res.status(500).send({
        message: 'An error occurred during asset collection fetch',
        error: error.message,
      });
    } else {
      console.error('Unknown error during asset collection fetch:', error);
      res.status(500).send({
        message: 'An unexpected error occurred',
        error: String(error),
      });
    }
  }
});



/* -------------------------------------------------------------------------- */
/*                                Mint Warrior                               */
/* -------------------------------------------------------------------------- */

/* ------------------------------ Mint Warrior Webhook ------------------------------ */


// Webhook Verification standard function
function verifyWebhook(
  webhookId: string,
  webhookTimestamp: string,
  webhookSignature: string,
  webhookData: object,
  secretKey: string
): boolean {
  const webhookDataStr = JSON.stringify(webhookData);  // Stringify the webhook data
  const signedContent = `${webhookId}.${webhookTimestamp}.${webhookDataStr}`;  // Concatenate signature components
  const secretBytes = Buffer.from(secretKey, 'base64');  // Convert secret key to bytes
  const expectedSignature = crypto
    .createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64');

  console.log("Webhook Timestamp:", webhookTimestamp);
  console.log("Webhook Signature:", webhookSignature);
  console.log("Generated Signature:", `v1,${expectedSignature}`);
  console.log("Webhook Data String:", webhookDataStr);

  return `v1,${expectedSignature}` === webhookSignature;
}

// Webhook: Mint Completed 
app.post('/webhooks/mint-completed', async (req, res) => {
  const webhookSecret = process.env.GAMESHIFT_WEBHOOK_VALIDATION_KEY;

  if (!webhookSecret) {
    console.error('Webhook secret not found');
    return res.status(500).json({ message: 'Webhook secret not configured' });
  }

  // Extract headers for webhook signature verification
  const webhookId = Array.isArray(req.headers['webhook-id']) 
    ? req.headers['webhook-id'][0] 
    : req.headers['webhook-id'];
  const webhookTimestamp = Array.isArray(req.headers['webhook-timestamp']) 
    ? req.headers['webhook-timestamp'][0] 
    : req.headers['webhook-timestamp'];
  const webhookSignature = Array.isArray(req.headers['webhook-signature']) 
    ? req.headers['webhook-signature'][0] 
    : req.headers['webhook-signature'];

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    console.log('Missing webhook headers');
    return res.status(400).json({ message: 'Missing webhook headers' });
  }

  // Extract the event data from the body
  const webhookData = req.body?.data;
  
  // Verify required fields are present
  const assetId = webhookData?.assetId;
  const ownerReferenceId = webhookData?.userId; // Use userId as ownerReferenceId

  if (!assetId || !ownerReferenceId) {
    console.log('Missing required assetId or ownerReferenceId');
    return res.status(400).json({ message: 'Missing required assetId or ownerReferenceId' });
  }

  // Verify the webhook signature
  const isVerified = verifyWebhook(webhookId, webhookTimestamp, webhookSignature, webhookData, webhookSecret);
  
  if (!isVerified) {
    console.log('Invalid webhook signature, rejecting request');
    return res.status(403).json({ message: 'Invalid webhook signature' });
  }

  // Now proceed with your API call and Firestore update
  try {
    // Fetch item details from GameShift API using axios
    const apiUrl = `https://api.gameshift.dev/nx/items/${assetId}`;
    const apiOptions = {
      method: 'GET',
      url: apiUrl,
      headers: {
        accept: 'application/json',
        'x-api-key': process.env.GAMESHIFT_API_KEY  // Use your stored GameShift API key
      }
    };

    const apiResponse = await axios.request(apiOptions);
    const itemDetails = apiResponse.data;

    if (!itemDetails || !itemDetails.item) {
      throw new Error('Unable to fetch item details from GameShift API');
    }

    const item = itemDetails.item;

    // Ensure owner address is not undefined, otherwise use an empty string
    const ownerAddress = item.owner?.address || '';

    // Prepare Firestore update with fetched item details
    const assetDoc = doc(collection(firestore, 'users'), ownerReferenceId, 'assets', assetId);
    await setDoc(assetDoc, {
      status: 'Minted',
      mintCompletedAt: new Date(),
      collectionId: item.collection.id,
      assetDetails: itemDetails,  // Update with the full fetched item details
      mintAddress: item.mintAddress,  // Update with the fetched mint address
      owner: {
        address: ownerAddress,  // Ensure owner address is valid
        referenceId: ownerReferenceId
      },
      attributes: item.attributes,
      imageUrl: item.imageUrl,
      description: item.description,
      name: item.name
    }, { merge: true });

    res.status(200).json({ message: 'Mint completed and item details updated successfully' });
  } catch (error) {
        if (error instanceof Error) {
          // Handle the error
          console.error('Error:', error.message);
          res.status(500).json({ message: error.message });
        } else {
          // Handle non-Error case (if necessary)
          console.error('Unexpected error:', error);
          res.status(500).json({ message: 'An unexpected error occurred' });
        }
      }
});

/* ------------------------------ Create Unique Asset ------------------------------ */
type CharacterLevel = {
  attributes: { traitType: string, value: string }[];
  collectionId: string;
  description: string;
  name: string;
  imageUrl: string;
};

type Character = {
  levels: { [key: string]: CharacterLevel }; // Using string as key type
};

const characters: { [key: string]: Character } = {
  tennon: {
    levels: {
      '1': { // Use string key
        attributes: [
          { traitType: 'HP', value: '190' },
          { traitType: 'STM', value: '190' },
          { traitType: 'LVL', value: '1' },
          { traitType: 'GLD', value: 'Strykur' }
        ],
        collectionId: 'cb122588-74a2-4386-90c4-b6b8980180b3',
        description: 'The mighty Tennon of Guild Strykur',
        name: 'Tennon',
        imageUrl: 'https://bafybeidxbix7k7qc76ufrzcoktlixahyvdbycyu2zudgz7e3faspdxqvvi.ipfs.nftstorage.link/'
      }
      // Add more levels if needed
    }
  }
};


app.post('/createUniqueAsset', async (req, res) => {
  const { destinationUserReferenceId, character, level } = req.body;
  const developerWalletAddress = "35VNSn71tXhXDkqhQt4DejoWBQ8F7fnSFoTW2gWyutnG";

  try {
    console.log('Incoming Request:', req.body);

    // Fetch character and level details from the reference object
    const characterDetails = characters[character]?.levels[level];
    console.log('Character Details:', characterDetails);

    if (!characterDetails) {
      return res.status(400).json({ message: 'Invalid character or level' });
    }

    // Define the royaltyInfo
    // const royaltyInfo = {
    //   recipients: [{ address: developerWalletAddress, share: 100 }],
    //   sellerFeeBasisPoints: 500 // 5% royalty
    // };

    // Prepare the request body for the unique asset creation
    const requestBody = {
      details: {
        // royaltyInfo: royaltyInfo,
        attributes: characterDetails.attributes,
        collectionId: characterDetails.collectionId,
        description: characterDetails.description,
        name: characterDetails.name,
        imageUrl: characterDetails.imageUrl
      },
      destinationUserReferenceId: destinationUserReferenceId
    };

    // Make the POST request to create the unique asset
    const createAssetResponse = await axios.post(
      'https://api.gameshift.dev/nx/unique-assets',
      requestBody,
      {
        headers: {
          accept: 'application/json',
          'x-api-key': process.env.GAMESHIFT_API_KEY,
          'content-type': 'application/json'
        }
      }
    );

    console.log('Create Asset Response:', createAssetResponse.data);
    const assetId = createAssetResponse.data?.id;

    if (!assetId) {
      throw new Error('Asset ID is undefined in response');
    }

    // Fetch the item details using the newly created asset ID
    const itemUrl = `https://api.gameshift.dev/nx/items/${assetId}`;
    const itemResponse = await axios.get(itemUrl, {
      headers: {
        accept: 'application/json',
        'x-api-key': process.env.GAMESHIFT_API_KEY
      }
    });

    const itemDetails = itemResponse.data;

    if (!itemDetails || !itemDetails.item) {
      throw new Error('Unable to fetch item details from GameShift API');
    }

    const item = itemDetails.item;

    // Store the asset data along with fetched item details in Firestore
    const assetData = {
      assetId: assetId,
      assetDetails: item,  // Store the complete item details
      createdAt: new Date(),
      ownerReferenceId: destinationUserReferenceId,
      developerWallet: developerWalletAddress,
      status: 'Pending Mint',
      mintAddress: item.mintAddress,  // Update with fetched mint address
      attributes: item.attributes,
      imageUrl: item.imageUrl,
      description: item.description,
      name: item.name
    };

    await setDoc(doc(collection(firestore, 'users'), destinationUserReferenceId, 'assets', assetId), assetData);

    // Respond with the asset details
    res.status(200).json({
      message: 'Unique asset created and item details fetched successfully',
      assetData: itemDetails
    });

  } catch (error: unknown) {
    // Error handling
    if (axios.isAxiosError(error)) {
      console.error('AxiosError:', error.message);
      res.status(500).send({
        message: 'Failed to create unique asset or fetch item details',
        error: error.message,
        details: error.response?.data, // Include additional details if available
      });
    } else if (error instanceof Error) {
      // Handling general errors
      console.error('Error:', error.message);
      res.status(500).send({
        message: 'An error occurred during unique asset creation or item fetching',
        error: error.message,
      });
    } else {
      // Catch-all for unknown errors
      console.error('Unknown error:', error);
      res.status(500).send({
        message: 'An unexpected error occurred',
        error: String(error),
      });
    }
  }
});

/* -------------------------------------------------------------------------- */
/*                 End of Mint Warrior Code                                   */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/*                 List Warrior for Sale on Marketplace                       */
/* -------------------------------------------------------------------------- */

/* ------------------------------ List Asset Route ------------------------------ */

// List Warrior
app.post('/list-asset-for-sale', async (req, res) => {
  const { assetId, price, currencyId } = req.body;

  try {
    // Make the request to list the asset for sale
    const options = {
      method: 'POST',
      url: `https://api.gameshift.dev/nx/unique-assets/${assetId}/list-for-sale`,
      headers: {
        accept: 'application/json',
        'x-api-key': process.env.GAMESHIFT_API_KEY, // GameShift API key from env variables
        'content-type': 'application/json',
      },
      data: { 
        price: { 
          currencyId,  // Currency like 'USDC', 'SOL', or custom ones
          naturalAmount: price  // Price to be set (must be a natural amount)
        }
      }
    };

    const response = await axios.request(options);

    // Extract transaction ID and consent URL from the response
    const { transactionId, consentUrl } = response.data;

    // Return transaction details and consent URL to frontend
    res.status(200).json({
      message: 'Asset listed for sale successfully',
      transactionId,
      consentUrl
    });
  } catch (error: unknown) {
    // Error handling
    if (axios.isAxiosError(error)) {
      console.error('AxiosError:', error.message);
      res.status(500).send({
        message: 'Failed to list unique asset or fetch listing details',
        error: error.message,
        details: error.response?.data, // Include additional details if available
      });
    } else if (error instanceof Error) {
      // Handling general errors
      console.error('Error:', error.message);
      res.status(500).send({
        message: 'An error occurred during unique asset listing or asset fetching',
        error: error.message,
      });
    } else {
      // Catch-all for unknown errors
      console.error('Unknown error:', error);
      res.status(500).send({
        message: 'An unexpected error occurred',
        error: String(error),
      });
    }
  }
});

/* ------------------------------ Asset Listing Completed Webhook ------------------------------ */

app.post('/webhooks/listing-complete', async (req, res) => {
  const webhookSecret = process.env.GAMESHIFT_WEBHOOK_VALIDATION_KEY;

  if (!webhookSecret) {
    return res.status(500).json({ message: 'Webhook secret not configured' });
  }

  // Extract headers for webhook signature verification
  const webhookId = Array.isArray(req.headers['webhook-id']) 
    ? req.headers['webhook-id'][0] 
    : req.headers['webhook-id'];
  const webhookTimestamp = Array.isArray(req.headers['webhook-timestamp']) 
    ? req.headers['webhook-timestamp'][0] 
    : req.headers['webhook-timestamp'];
  const webhookSignature = Array.isArray(req.headers['webhook-signature']) 
    ? req.headers['webhook-signature'][0] 
    : req.headers['webhook-signature'];

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    return res.status(400).json({ message: 'Missing webhook headers' });
  }

  // Extract event data from the body
  const webhookData = req.body?.data;

  // Verify the signature
  const isVerified = verifyWebhook(webhookId, webhookTimestamp, webhookSignature, webhookData, webhookSecret);

  if (!isVerified) {
    console.log('Invalid webhook signature');
    return res.status(403).json({ message: 'Invalid webhook signature' });
  }

  const assetId = webhookData?.assetId;
  const ownerReferenceId = webhookData?.sellerId; // Adjusted to sellerId

  if (!assetId || !ownerReferenceId) {
    return res.status(400).json({ message: 'Missing assetId or ownerReferenceId' });
  }

  // Fetch the updated asset details from GameShift API
  try {
    const apiUrl = `https://api.gameshift.dev/nx/items/${assetId}`;
    const apiOptions = {
      method: 'GET',
      url: apiUrl,
      headers: {
        accept: 'application/json',
        'x-api-key': process.env.GAMESHIFT_API_KEY
      }
    };

    const apiResponse = await axios.request(apiOptions);
    const itemDetails = apiResponse.data;

    if (!itemDetails || !itemDetails.item) {
      throw new Error('Unable to fetch item details from GameShift API');
    }

    const item = itemDetails.item;
    const ownerAddress = item.owner?.address || '';

    // Prepare Firestore update with fetched item details
    const assetDoc = doc(collection(firestore, 'users'), ownerReferenceId, 'assets', assetId);
    await setDoc(assetDoc, {
      status: 'Listed',
      listedAt: new Date(),
      forSale: item.forSale,  
      price: item.price,  
      assetDetails: itemDetails,  
      mintAddress: item.mintAddress,  
      owner: {
        address: ownerAddress,  
        referenceId: ownerReferenceId
      },
      attributes: item.attributes,
      imageUrl: item.imageUrl,
      description: item.description,
      name: item.name
    }, { merge: true });

    res.status(200).json({ message: 'Asset listed successfully and details updated' });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('Unexpected error:', error);
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
});


/* -------------------------------------------------------------------------- */
/*                 End of Listing Warrior for Sale Route                      */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/*     Unlisting Warrior previously listed for Sale on Marketplace             */
/* -------------------------------------------------------------------------- */

/* ------------------------------ Unlist Asset Route ------------------------------ */
app.post('/cancel-listing', async (req, res) => {
  const { assetId } = req.body;

  try {
    // Ensure assetId is provided
    if (!assetId) {
      return res.status(400).json({ message: 'Asset ID is required' });
    }

    // Make the request to cancel the listing of the asset
    const options = {
      method: 'POST',
      url: `https://api.gameshift.dev/nx/unique-assets/${assetId}/cancel-listing`,
      headers: {
        accept: 'application/json',
        'x-api-key': process.env.GAMESHIFT_API_KEY,  // Your GameShift API key from environment variables
        'content-type': 'application/json',
      },
      data: {}  // No body required for this request
    };

    const response = await axios.request(options);

    // Extract the transactionId and consentUrl from the response
    const { transactionId, consentUrl } = response.data;

    // Return the transaction details and consent URL to the frontend
    res.status(200).json({
      message: 'Asset unlisting initiated',
      transactionId,
      consentUrl
    });

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('AxiosError:', error.message);
      res.status(500).send({
        message: 'Failed to cancel asset listing',
        error: error.message,
        details: error.response?.data,
      });
    } else if (error instanceof Error) {
      console.error('Error:', error.message);
      res.status(500).send({
        message: 'An error occurred during asset unlisting',
        error: error.message,
      });
    } else {
      console.error('Unknown error:', error);
      res.status(500).send({
        message: 'An unexpected error occurred',
        error: String(error),
      });
    }
  }
});


/* ------------------------------ WEBHOOK: asset.marketplace.unlisted ------------------------------ */

app.post('/webhooks/unlisting-complete', async (req, res) => {
  const webhookSecret = process.env.GAMESHIFT_WEBHOOK_VALIDATION_KEY;

  if (!webhookSecret) {
    return res.status(500).json({ message: 'Webhook secret not configured' });
  }

  // Extract headers for webhook signature verification
  const webhookId = Array.isArray(req.headers['webhook-id']) 
    ? req.headers['webhook-id'][0] 
    : req.headers['webhook-id'];
  const webhookTimestamp = Array.isArray(req.headers['webhook-timestamp']) 
    ? req.headers['webhook-timestamp'][0] 
    : req.headers['webhook-timestamp'];
  const webhookSignature = Array.isArray(req.headers['webhook-signature']) 
    ? req.headers['webhook-signature'][0] 
    : req.headers['webhook-signature'];

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    return res.status(400).json({ message: 'Missing webhook headers' });
  }

  // Extract the event data
  const webhookData = req.body?.data;

  // Verify the webhook signature
  const isVerified = verifyWebhook(webhookId, webhookTimestamp, webhookSignature, webhookData, webhookSecret);

  if (!isVerified) {
    console.log('Invalid webhook signature');
    return res.status(403).json({ message: 'Invalid webhook signature' });
  }

  const assetId = webhookData?.assetId;
  const ownerReferenceId = webhookData?.sellerId;  // Assuming sellerId represents the owner

  if (!assetId || !ownerReferenceId) {
    return res.status(400).json({ message: 'Missing assetId or ownerReferenceId' });
  }

  // Fetch the updated asset details from GameShift API
  try {
    const apiUrl = `https://api.gameshift.dev/nx/items/${assetId}`;
    const apiOptions = {
      method: 'GET',
      url: apiUrl,
      headers: {
        accept: 'application/json',
        'x-api-key': process.env.GAMESHIFT_API_KEY
      }
    };

    const apiResponse = await axios.request(apiOptions);
    const itemDetails = apiResponse.data;

    if (!itemDetails || !itemDetails.item) {
      throw new Error('Unable to fetch item details from GameShift API');
    }

    const item = itemDetails.item;
    const ownerAddress = item.owner?.address || '';

    // Update the Firestore database to reflect the asset is no longer for sale
    const assetDoc = doc(collection(firestore, 'users'), ownerReferenceId, 'assets', assetId);
    await setDoc(assetDoc, {
      status: 'Unlisted',
      unlistedAt: new Date(),
      forSale: false,  // Set forSale to false
      price: null,  // Clear price information
      assetDetails: itemDetails,  // Store full asset details
      mintAddress: item.mintAddress,  // Keep the mint address updated
      owner: {
        address: ownerAddress,
        referenceId: ownerReferenceId
      },
      attributes: item.attributes,
      imageUrl: item.imageUrl,
      description: item.description,
      name: item.name
    }, { merge: true });

    res.status(200).json({ message: 'Asset unlisted and details updated successfully' });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('Unexpected error:', error);
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
});

/* -------------------------------------------------------------------------- */
/*                 End of Unlisting Warrior from Sale Route                      */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/*        Buying Warrior previously listed for Sale on Marketplace            */
/* -------------------------------------------------------------------------- */

/* ------------------------------ Buy Asset Route ------------------------------ */
app.post('/buy-item', async (req, res) => {
  const { assetId, buyerId } = req.body;

  try {
    // Make the request to buy the listed asset
    const options = {
      method: 'POST',
      url: `https://api.gameshift.dev/nx/unique-assets/${assetId}/buy`,
      headers: {
        accept: 'application/json',
        'x-api-key': process.env.GAMESHIFT_API_KEY,  // Your GameShift API key from environment variables
        'content-type': 'application/json',
      },
      data: { buyerId }  // Buyer ID from the request
    };

    const response = await axios.request(options);

    // Extract transactionId and consentUrl from the response
    const { transactionId, consentUrl } = response.data;

    // Return the transaction details and consent URL to the frontend
    res.status(200).json({
      message: 'Asset purchase initiated',
      transactionId,
      consentUrl
    });

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('AxiosError:', error.message);
      res.status(500).send({
        message: 'Failed to purchase asset',
        error: error.message,
        details: error.response?.data,
      });
    } else if (error instanceof Error) {
      console.error('Error:', error.message);
      res.status(500).send({
        message: 'An error occurred during asset purchase',
        error: error.message,
      });
    } else {
      console.error('Unknown error:', error);
      res.status(500).send({
        message: 'An unexpected error occurred',
        error: String(error),
      });
    }
  }
});



/* ------------------------------ WEBHOOK: Buy Asset Status Fetch ------------------------------ */
app.post('/webhooks/buy-complete', async (req, res) => {
  const webhookSecret = process.env.GAMESHIFT_WEBHOOK_VALIDATION_KEY;

  if (!webhookSecret) {
    return res.status(500).json({ message: 'Webhook secret not configured' });
  }

  // Extract headers for webhook signature verification
  const webhookId = Array.isArray(req.headers['webhook-id']) 
    ? req.headers['webhook-id'][0] 
    : req.headers['webhook-id'];
  const webhookTimestamp = Array.isArray(req.headers['webhook-timestamp']) 
    ? req.headers['webhook-timestamp'][0] 
    : req.headers['webhook-timestamp'];
  const webhookSignature = Array.isArray(req.headers['webhook-signature']) 
    ? req.headers['webhook-signature'][0] 
    : req.headers['webhook-signature'];

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    return res.status(400).json({ message: 'Missing webhook headers' });
  }

  // Extract the event data
  const webhookData = req.body?.data;

  // Verify the webhook signature
  const isVerified = verifyWebhook(webhookId, webhookTimestamp, webhookSignature, webhookData, webhookSecret);

  if (!isVerified) {
    console.log('Invalid webhook signature');
    return res.status(403).json({ message: 'Invalid webhook signature' });
  }

  const assetId = webhookData?.assetId;
  const oldOwnerReferenceId = webhookData?.sellerId; // Assuming sellerId is the old owner
  const newOwnerReferenceId = webhookData?.buyerId; // Assuming buyerId is the new owner

  if (!assetId || !oldOwnerReferenceId || !newOwnerReferenceId) {
    return res.status(400).json({ message: 'Missing assetId or ownerReferenceId' });
  }

  // Fetch the updated asset details from GameShift API
  try {
    const apiUrl = `https://api.gameshift.dev/nx/items/${assetId}`;
    const apiOptions = {
      method: 'GET',
      url: apiUrl,
      headers: {
        accept: 'application/json',
        'x-api-key': process.env.GAMESHIFT_API_KEY
      }
    };

    const apiResponse = await axios.request(apiOptions);
    const itemDetails = apiResponse.data;

    if (!itemDetails || !itemDetails.item) {
      throw new Error('Unable to fetch item details from GameShift API');
    }

    const item = itemDetails.item;
    const ownerAddress = item.owner?.address || '';

    // Delete the asset document from the old owner
    const oldOwnerAssetDoc = doc(collection(firestore, 'users'), oldOwnerReferenceId, 'assets', assetId);
    await deleteDoc(oldOwnerAssetDoc);

    // Add the asset document to the new owner
    const newOwnerAssetDoc = doc(collection(firestore, 'users'), newOwnerReferenceId, 'assets', assetId);
    await setDoc(newOwnerAssetDoc, {
      status: 'Owned',
      ownedAt: new Date(),
      forSale: false,  // Asset is no longer for sale
      price: null,  // Clear price information
      assetDetails: itemDetails,  // Store full asset details
      mintAddress: item.mintAddress,  // Keep the mint address updated
      owner: {
        address: ownerAddress,
        referenceId: newOwnerReferenceId
      },
      attributes: item.attributes,
      imageUrl: item.imageUrl,
      description: item.description,
      name: item.name
    }, { merge: true });

    res.status(200).json({ message: 'Asset transfer completed and details updated successfully' });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('Unexpected error:', error);
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
});

/* -------------------------------------------------------------------------- */
/*                 Stackable Assets: Artifacts Code                           */
/* -------------------------------------------------------------------------- */

/* ------------------------------ Mint Artifact ------------------------------ */

// This object will hold stackable assets dynamically and can be expanded in the future
// Expanded StackableAssetTypes to include all asset types
type StackableAssetTypes = 'theracode' | 'therabox' | 'magicalScroll' | 'fixerElixir' | 'quarterRevivalElixir' | 'halfRevivalElixir' | 'plus15Powerup' | 'plus20Powerup';

const stackableAssets: Record<StackableAssetTypes, {
  name: string;
  description: string;
  imageUrl: string;
  attributes: {
    traitType: string;
    value: string;
  }[];
  symbol: string;
  collectionId: string;
}> = {
  theracode: {
    name: "Theracode",
    description: "Mystical book revealing binary secrets",
    imageUrl: "https://bafkreicli7hzoarg4a22ebuu2spjajx6c6f4m7wzoegzhebrn2kw2ur5oa.ipfs.nftstorage.link/",
    attributes: [{ traitType: 'color', value: 'blue' }],
    symbol: "tcd",
    collectionId: "3e7b3bdf-47ca-4495-8cdb-cae5f6a64092"
  },
  therabox: {
    name: "Thera Box",
    description: "Glowing box with hidden artifacts",
    imageUrl: "https://bafkreia4z6j6ghh2q2s7bdhbkiqitrwbivqpqdqftblni2f45xu4vousxu.ipfs.nftstorage.link/",
    attributes: [{ traitType: 'color', value: 'yellow' }],
    symbol: "tbx",
    collectionId: "ffce5f8d-d7bc-48be-b429-5d9461d9f721"
  },
  magicalScroll: {
    name: "Magical Scroll",
    description: "Partially open scroll with ancient writings",
    imageUrl: "https://bafkreicbengkiedvzbgrtfjbxzwd4udnnbkctqfl5m3hs5a56fdzie7iiu.ipfs.nftstorage.link/",
    attributes: [{ traitType: 'color', value: 'white' }],
    symbol: "mgs",
    collectionId: "7a41d736-e48c-405e-b95f-5d725fa216f6"
  },
  fixerElixir: {
    name: "Fixer Elixir",
    description: "Restores full stamina/health temporarily",
    imageUrl: "https://bafkreietd6olqr2ci2dc7si4vy6hf6pv7hyxsiq46rk32xpkuzzbbrwy7e.ipfs.nftstorage.link/",
    attributes: [{ traitType: 'color', value: 'Purple' }],
    symbol: "fixr",
    collectionId: "ceacdc47-5a6c-4711-8225-70d87ee896ba"
  },
  quarterRevivalElixir: {
    name: "Quarter Rev Elixir",
    description: "Restores quarter stamina/health temporarily",
    imageUrl: "https://bafkreidvep3viw3nqqkqb5k2o2ywzkau2boyslujr63pj5gcbap6s37jeq.ipfs.nftstorage.link/",
    attributes: [{ traitType: 'color', value: 'Green' }],
    symbol: "qrev",
    collectionId: "05083879-1002-44af-94b9-203980a02de1"
  },
  halfRevivalElixir: {
    name: "Half Rev Elixir",
    description: "Restores half stamina/health temporarily",
    imageUrl: "https://bafkreideyeu5onx4oq5b2o4vzf7wuuk3ugfqynblqdyk4haf4q4uqxlw74.ipfs.nftstorage.link/",
    attributes: [{ traitType: 'color', value: 'Red' }],
    symbol: "hrev",
    collectionId: "ee0fe50f-ff6e-441f-a2af-1cc9c685aa30"
  },
  plus15Powerup: {
    name: "Plus 15 Powerup",
    description: "Boost STM/HP by +15 units, permanent",
    imageUrl: "https://bafkreicp7qmmf2c5iyftsxhzf34vz3qllbr3k3xdwgxvsbnlbgokm5i3gy.ipfs.nftstorage.link/",
    attributes: [{ traitType: 'color', value: 'Cyan' }],
    symbol: "p15p",
    collectionId: "ace2eb6b-6cbd-4f22-a00e-1dbf9e7a7a97"
  },
  plus20Powerup: {
    name: "Plus 20 Powerup",
    description: "Boost STM/HP by +20 units, permanent",
    imageUrl: "https://bafkreihytm5tseo52ff3xzhcggbzfhzvns5wfteppubufzfltuov5pnv3q.ipfs.nftstorage.link/",
    attributes: [{ traitType: 'color', value: 'Pink' }],
    symbol: "p20p",
    collectionId: "0dbd7713-b24a-4458-b6c7-bd5fc321d010"
  }
};

// Route to mint a stackable asset dynamically
// Route to mint a stackable asset dynamically
app.post('/mintStackableAsset', async (req, res) => {
  const { assetType }: { assetType: StackableAssetTypes } = req.body;

  const assetDetails = stackableAssets[assetType];

  if (!assetDetails) {
    return res.status(400).json({ message: 'Invalid asset type.' });
  }

  // Ensure that the description, name, and symbol meet the API requirements
  if (assetDetails.description.length > 64) {
    return res.status(400).json({ message: 'Description exceeds 64 characters.' });
  }

  if (assetDetails.name.length > 32) {
    return res.status(400).json({ message: 'Name exceeds 32 characters.' });
  }

  if (assetDetails.symbol.length > 5) {
    return res.status(400).json({ message: 'Symbol exceeds 5 characters.' });
  }

  try {
    const options = {
      method: 'POST',
      url: 'https://api.gameshift.dev/nx/stackable-assets',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-api-key': process.env.GAMESHIFT_API_KEY,
      },
      data: {
        attributes: assetDetails.attributes,
        collectionId: assetDetails.collectionId,
        description: assetDetails.description,
        name: assetDetails.name,
        imageUrl: assetDetails.imageUrl,
        symbol: assetDetails.symbol,
      }
    };

    console.log('Sending request to GameShift with data:', options.data);

    const response = await axios.request(options);
    console.log('GameShift response:', response.data);

    res.status(200).json({
      message: 'Stackable asset minted successfully',
      data: response.data
    });

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error minting stackable asset:', error.message);
      console.error('Response data:', error.response?.data);

      res.status(500).json({
        message: 'Failed to mint stackable asset',
        error: error.message,
        details: error.response?.data || 'No additional details'
      });
    } else if (error instanceof Error) {
      console.error('Error minting stackable asset:', error.message);
      res.status(500).json({ message: 'Failed to mint stackable asset', error: error.message });
    } else {
      console.error('Unexpected error:', String(error));
      res.status(500).json({ message: 'Failed to mint stackable asset', error: String(error) });
    }
  }
});



/* ----------------- WEBHOOK: Mint Stackable Asset Check -------------------- */
app.post('/webhooks/stackableasset-mint-complete', async (req, res) => {
  const webhookSecret = process.env.GAMESHIFT_WEBHOOK_VALIDATION_KEY;

  if (!webhookSecret) {
    return res.status(500).json({ message: 'Webhook secret not configured' });
  }

  // Extract headers for webhook signature verification
  const webhookId = Array.isArray(req.headers['webhook-id']) ? req.headers['webhook-id'][0] : req.headers['webhook-id'];
  const webhookTimestamp = Array.isArray(req.headers['webhook-timestamp']) ? req.headers['webhook-timestamp'][0] : req.headers['webhook-timestamp'];
  const webhookSignature = Array.isArray(req.headers['webhook-signature']) ? req.headers['webhook-signature'][0] : req.headers['webhook-signature'];

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    return res.status(400).json({ message: 'Missing webhook headers' });
  }

  // Extract the event data
  const eventType = req.body?.type;
  const webhookData = req.body?.data;
  const assetId = webhookData?.assetId;
  const collectionId = webhookData?.collectionId;

  if (!collectionId || !assetId) {
    return res.status(400).json({ message: 'Missing collectionId or assetId' });
  }

  // Verify webhook signature (reuse existing verifyWebhook function)
  const isVerified = verifyWebhook(webhookId, webhookTimestamp, webhookSignature, webhookData, webhookSecret);
  if (!isVerified) {
    console.log('Invalid webhook signature');
    return res.status(403).json({ message: 'Invalid webhook signature' });
  }

  try {
    if (eventType === 'stackableAsset.setup.completed') {
      console.log(`Setup completed for assetId: ${assetId}, collectionId: ${collectionId}`);

      // Fetch the complete asset details from GameShift API using the assetId
      const gameShiftResponse = await axios.request({
        method: 'GET',
        url: `https://api.gameshift.dev/nx/items/${assetId}`,
        headers: {
          accept: 'application/json',
          'x-api-key': process.env.GAMESHIFT_API_KEY
        }
      });

      const assetDetails = gameShiftResponse.data?.item;
      if (!assetDetails) {
        throw new Error('Unable to fetch asset details from GameShift');
      }

      // Update Firestore subcollection with complete asset details
      const assetDoc = doc(firestore, `ii-collections/${collectionId}/stackable-assets`, assetId);
      await setDoc(assetDoc, {
        assetId: assetDetails.id,
        name: assetDetails.name,
        description: assetDetails.description,
        symbol: assetDetails.symbol,
        status: assetDetails.status || 'Processing',
        imageUrl: assetDetails.imageUrl,
        attributes: assetDetails.attributes,
        mintAddress: assetDetails.mintAddress,
        timestamp: assetDetails.created,
        collection: assetDetails.collection,
      });

      console.log('Stackable asset details stored in Firestore subcollection.');
      res.status(200).json({ message: 'Asset setup completed and details updated successfully in Firestore' });

    } else if (eventType === 'stackableAsset.setup.initiated') {
      console.log('Setup initiated event received.');
      res.status(200).json({ message: 'Setup initiated' });
    } else if (eventType === 'stackableAsset.setup.failed') {
      console.log('Setup failed event received.');
      res.status(200).json({ message: 'Setup failed' });
    } else {
      console.log('Unknown event received.');
      res.status(400).json({ message: 'Unknown event type' });
    }

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('Unexpected error:', error);
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
});


/* ---------------- Issue artefacts to Player in-game collection ------------------------ */

const stackableAssetCollections: {
  therabox: string;
  theracode: string;
  magicalScroll: string;
} = {
  therabox: 'df9d328b-1e59-4fa7-8650-8afb6f11cc9b',
  theracode: 'e40dde00-b894-4cd9-bd93-ad26fdf7425e',
  magicalScroll: '122bc263-6fc8-485a-a11a-8dce7931fb57',
};

// Type for assetType that matches keys of stackableAssetCollections
type AssetType = keyof typeof stackableAssetCollections;

// Route to issue stackable asset
app.post('/issueStackableAsset', async (req, res) => {
  const { assetType, destinationUserReferenceId } = req.body as {
    assetType: AssetType;
    destinationUserReferenceId: string;
  };

  if (!stackableAssetCollections[assetType]) {
    return res.status(400).json({ message: 'Invalid asset type.' });
  }

  try {
    const options = {
      method: 'POST',
      url: `https://api.gameshift.dev/nx/stackable-assets/${stackableAssetCollections[assetType]}`,
      headers: {
        accept: 'application/json',
        'x-api-key': process.env.GAMESHIFT_API_KEY,
        'content-type': 'application/json',
      },
      data: {
        amount: 1,
        destinationUserReferenceId,
      },
    };

    const response = await axios.request(options);
    res.status(200).json({
      message: 'Stackable asset issue initiated',
      data: response.data,
    });
  } catch (error: unknown) {
    // Handle axios errors with proper type check
    if (axios.isAxiosError(error)) {
      // If the error has a response, log and return it
      if (error.response) {
        console.error('Error issuing stackable asset:', error.response.data);
        return res.status(500).json({ message: 'Failed to issue stackable asset', error: error.response.data });
      }
      // Handle other axios-specific errors
      console.error('Error issuing stackable asset:', error.message);
      return res.status(500).json({ message: 'Failed to issue stackable asset', error: error.message });
    }
    // Handle unknown errors
    console.error('Unexpected error:', error);
    res.status(500).json({ message: 'An unexpected error occurred', error: String(error) });
  }
});


/* ----------------------- WEBHOOK: Verify artefact mint ----------------------------- */

app.post('/webhooks/issue-artefacts-completed', async (req, res) => {
  const webhookSecret = process.env.GAMESHIFT_WEBHOOK_VALIDATION_KEY;

  if (!webhookSecret) {
    return res.status(500).json({ message: 'Webhook secret not configured' });
  }

  // Extract headers and ensure they are strings
  const webhookId = Array.isArray(req.headers['webhook-id']) ? req.headers['webhook-id'][0] : req.headers['webhook-id'];
  const webhookTimestamp = Array.isArray(req.headers['webhook-timestamp']) ? req.headers['webhook-timestamp'][0] : req.headers['webhook-timestamp'];
  const webhookSignature = Array.isArray(req.headers['webhook-signature']) ? req.headers['webhook-signature'][0] : req.headers['webhook-signature'];

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    return res.status(400).json({ message: 'Missing webhook headers' });
  }

  // Extract event data from the webhook payload
  const eventType = req.body?.type;
  const webhookData = req.body?.data;

  try {
    if (eventType === 'stackableAsset.issue.completed') {
      // Extract wallet address from the payload
      const destinationUserWalletAddress = webhookData?.details?.data?.recipient?.walletAddress;

      if (!destinationUserWalletAddress) {
        return res.status(400).json({ message: 'Missing wallet address from recipient.' });
      }

      // Fetch the user reference ID using the wallet address
      const userReferenceResponse = await axios.request({
        method: 'GET',
        url: `https://api.gameshift.dev/nx/users/wallet/${destinationUserWalletAddress}`,
        headers: {
          accept: 'application/json',
          'x-api-key': process.env.GAMESHIFT_API_KEY,
        },
      });

      const destinationUserReferenceId = userReferenceResponse.data?.referenceId;

      if (!destinationUserReferenceId) {
        return res.status(400).json({ message: 'Failed to fetch destinationUserReferenceId.' });
      }

      const assetId = webhookData?.assetId;
      if (!assetId) {
        return res.status(400).json({ message: 'Missing assetId from the webhook data.' });
      }

      // Verify the webhook signature
      const isVerified = verifyWebhook(webhookId, webhookTimestamp, webhookSignature, webhookData, webhookSecret);
      if (!isVerified) {
        console.log('Invalid webhook signature');
        return res.status(403).json({ message: 'Invalid webhook signature' });
      }

      // Fetch additional asset data from the external API
      const assetResponse = await axios.request({
        method: 'GET',
        url: `https://api.gameshift.dev/nx/items/${assetId}`,  // Fetching asset data using assetId
        headers: {
          accept: 'application/json',
          'x-api-key': process.env.GAMESHIFT_API_KEY,
        },
      });

      const assetData = assetResponse.data;

      // Now save this asset to the 'stackable-assets' sub-collection in Firestore
      const userDocRef = doc(firestore, 'users', destinationUserReferenceId, 'stackable-assets', assetId);  // Saving to 'stackable-assets'

      // Retrieve the current document to check if it already exists
      const assetDoc = await getDoc(userDocRef);

      if (assetDoc.exists()) {
        // If the asset already exists, increment the quantity
        await updateDoc(userDocRef, {
          quantity: increment(1),  // Increment the quantity by 1
          lastUpdated: new Date().getTime(),  // Optionally track when it was last updated
        });
      } else {
        // If the asset doesn't exist, create it with quantity 1
        await setDoc(userDocRef, {
          assetId,
          status: 'Owned',
          timestamp: new Date().getTime(),
          quantity: 1,  // Set initial quantity to 1
          ...assetData,  // Save additional asset data from the GET request
        });
      }

      console.log('Stackable asset added or updated in user\'s Firestore document.');
      return res.status(200).json({ message: 'Stackable asset added or updated in user\'s Firestore document successfully' });

    } else if (eventType === 'stackableAsset.issue.failed') {
      console.error('Stackable asset issue failed');
      return res.status(500).json({ message: 'Asset issue failed' });

    } else if (eventType === 'stackableAsset.issue.initiated') {
      console.log('Stackable asset issue initiated');
      return res.status(200).json({ message: 'Stackable asset issue initiated' });

    } else {
      console.error('Unknown event type');
      return res.status(400).json({ message: 'Unknown event type' });
    }

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error handling webhook:', error.message);
      return res.status(500).json({ message: 'Failed to handle webhook', error: error.message });
    } else {
      console.error('Unexpected error:', error);
      return res.status(500).json({ message: 'An unexpected error occurred', error: String(error) });
    }
  }
});


/* -------------------------------------------------------------------------- */
/*                 End Of Stackable Asset Mint Code                           */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/*                 Crafting Module for Potions and Powerups                   */
/* -------------------------------------------------------------------------- */


// Define the types for crafting recipes
type itemType = 'fixerelixir' | 'quarterrevelixir' | 'halfrevelixir' | 'plus15powerup' | 'plus20powerup';

const craftingRecipes: Record<itemType, {
  metadata: {
    completionMessage: {
      primary: string;
      secondary: string;
    };
    attributes: {
      traitType: string;
      value: string;
    }[];
    title: string;
    description: string;
    image: string;
  };
  // craftingUserReferenceId: string;
  consumes: {
    id: string;
    naturalAmount: string;
    type: 'Currency' | 'StackableAsset';
  }[];
}> = {
  fixerelixir: {
    metadata: {
      completionMessage: {
        primary: 'Successfully brewed Fixer Elixir',
        secondary: 'You can now access it in your inventory and use in-game to revive your warrior to full capacity'
      },
      attributes: [{ traitType: 'color', value: 'Purple' }],
      title: 'Fixer Elixir',
      description: 'Restores full stamina/health temporarily',
      image: 'https://bafkreietd6olqr2ci2dc7si4vy6hf6pv7hyxsiq46rk32xpkuzzbbrwy7e.ipfs.nftstorage.link/'
    },
    // craftingUserReferenceId: 'fjUdNjfASihUAkwTpVsGwrNOJCF3',
    consumes: [
      { id: 'SOL', naturalAmount: '0.005', type: 'Currency' },
      { id: 'df9d328b-1e59-4fa7-8650-8afb6f11cc9b', naturalAmount: '2', type: 'StackableAsset' },
      { id: 'e40dde00-b894-4cd9-bd93-ad26fdf7425e', naturalAmount: '2', type: 'StackableAsset' },
      { id: '122bc263-6fc8-485a-a11a-8dce7931fb57', naturalAmount: '2', type: 'StackableAsset' }
    ]
  },
  quarterrevelixir: {
    metadata: {
      completionMessage: {
        primary: 'Successfully brewed Quarter Revival Elixir',
        secondary: 'You can now access it in your inventory and use it to upgrade your warrior to quarter health capacity'
      },
      attributes: [{ traitType: 'color', value: 'Green' }],
      title: 'Quarter Rev Elixir',
      description: 'Restores quarter stamina/health temporarily',
      image: 'https://bafkreidvep3viw3nqqkqb5k2o2ywzkau2boyslujr63pj5gcbap6s37jeq.ipfs.nftstorage.link/'
    },
    // craftingUserReferenceId: 'fjUdNjfASihUAkwTpVsGwrNOJCF3',
    consumes: [
      { id: 'SOL', naturalAmount: '0.00125', type: 'Currency' },
      { id: 'df9d328b-1e59-4fa7-8650-8afb6f11cc9b', naturalAmount: '1', type: 'StackableAsset' },
      { id: 'e40dde00-b894-4cd9-bd93-ad26fdf7425e', naturalAmount: '1', type: 'StackableAsset' },
      { id: '122bc263-6fc8-485a-a11a-8dce7931fb57', naturalAmount: '1', type: 'StackableAsset' }
    ]
  },
  halfrevelixir: {
    metadata: {
      completionMessage: {
        primary: 'Successfully brewed Half Revival Elixir',
        secondary: 'You can now access it in your inventory and use it to revive your warrior to half its health capacity'
      },
      attributes: [{ traitType: 'color', value: 'Red' }],
      title: 'Half Rev Elixir',
      description: 'Restores half stamina/health temporarily',
      image: 'https://bafkreideyeu5onx4oq5b2o4vzf7wuuk3ugfqynblqdyk4haf4q4uqxlw74.ipfs.nftstorage.link/'
    },
    // craftingUserReferenceId: 'fjUdNjfASihUAkwTpVsGwrNOJCF3',
    consumes: [
      { id: 'SOL', naturalAmount: '0.0025', type: 'Currency' },
      { id: 'df9d328b-1e59-4fa7-8650-8afb6f11cc9b', naturalAmount: '1', type: 'StackableAsset' },
      { id: 'e40dde00-b894-4cd9-bd93-ad26fdf7425e', naturalAmount: '2', type: 'StackableAsset' },
      { id: '122bc263-6fc8-485a-a11a-8dce7931fb57', naturalAmount: '1', type: 'StackableAsset' }
    ]
  },
  plus15powerup: {
    metadata: {
      completionMessage: {
        primary: 'Successfully brewed Plus 15 Powerup',
        secondary: 'You can now access it in your inventory, and use it to enhance player attributes by +15'
      },
      attributes: [{ traitType: 'color', value: 'Cyan' }],
      title: 'Plus 15 Powerup',
      description: 'Boost STM/HP by +15 units, permanent',
      image: 'https://bafkreicp7qmmf2c5iyftsxhzf34vz3qllbr3k3xdwgxvsbnlbgokm5i3gy.ipfs.nftstorage.link/'
    },
    // craftingUserReferenceId: 'fjUdNjfASihUAkwTpVsGwrNOJCF3',
    consumes: [
      { id: 'SOL', naturalAmount: '0.01', type: 'Currency' },
      { id: 'df9d328b-1e59-4fa7-8650-8afb6f11cc9b', naturalAmount: '3', type: 'StackableAsset' },
      { id: 'e40dde00-b894-4cd9-bd93-ad26fdf7425e', naturalAmount: '3', type: 'StackableAsset' },
      { id: '122bc263-6fc8-485a-a11a-8dce7931fb57', naturalAmount: '3', type: 'StackableAsset' }
    ]
  },
  plus20powerup: {
    metadata: {
      completionMessage: {
        primary: 'Successfully brewed Plus 20 Powerup',
        secondary: 'You can now access it in your inventory, and use it to enhance player attributes by +20'
      },
      attributes: [{ traitType: 'color', value: 'Pink' }],
      title: 'Plus 20 Powerup',
      description: 'Boost STM/HP by +20 units, permanent',
      image: 'https://bafkreihytm5tseo52ff3xzhcggbzfhzvns5wfteppubufzfltuov5pnv3q.ipfs.nftstorage.link/'
    },
    // craftingUserReferenceId: 'fjUdNjfASihUAkwTpVsGwrNOJCF3',
    consumes: [
      { id: 'SOL', naturalAmount: '0.02', type: 'Currency' },
      { id: 'df9d328b-1e59-4fa7-8650-8afb6f11cc9b', naturalAmount: '4', type: 'StackableAsset' },
      { id: 'e40dde00-b894-4cd9-bd93-ad26fdf7425e', naturalAmount: '4', type: 'StackableAsset' },
      { id: '122bc263-6fc8-485a-a11a-8dce7931fb57', naturalAmount: '4', type: 'StackableAsset' }
    ]
  }
};

// Route to craft potions/powerups
app.post('/craftItem', async (req, res) => {
  const { itemType, craftingUserReferenceId } = req.body as {
    itemType: itemType;
    craftingUserReferenceId: string;
  };

  const craftingData = craftingRecipes[itemType];

  if (!craftingData) {
    return res.status(400).json({ message: 'Invalid potion type' });
  }

  try {
    const response = await axios.post('https://api.gameshift.dev/nx/crafting-recipes', {
      ...craftingData,
      craftingUserReferenceId,
    }, {
      headers: {
        accept: 'application/json',
        'x-api-key': process.env.GAMESHIFT_API_KEY,
        'content-type': 'application/json'
      }
    });

    // Store the craftingRecipeId and consent URL for tracking
    const { craftingRecipeId, consentUrl } = response.data;

    // Return the consent URL to the client
    res.status(200).json({
      message: 'Crafting request successful',
      data: response.data
    });

  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(error.response?.data || error.message);
      res.status(500).json({ message: 'Crafting request failed', error: error.response?.data || error.message });
    } else {
      console.error('Unexpected error:', String(error));
      res.status(500).json({ message: 'An unexpected error occurred', error: String(error) });
    }
  }
});


/* -------------- WEBHOOK : Track crafting recipe completing status and issue item to destination user --------- */
type WebhookData = {
  data: {
    status: string;
    recipe: {
      id: string;
      metadata: {
        title: string;
      };
      craftingUserReferenceId: string;
    };
  };
};

app.post('/webhooks/crafting-recipe-complete', async (req: Request, res: Response) => {
  const webhookSecret = process.env.GAMESHIFT_WEBHOOK_VALIDATION_KEY;

  if (!webhookSecret) {
    return res.status(500).json({ message: 'Webhook secret not configured' });
  }

  // Extract and validate headers
  const webhookId = Array.isArray(req.headers['webhook-id']) ? req.headers['webhook-id'][0] : req.headers['webhook-id'];
  const webhookTimestamp = Array.isArray(req.headers['webhook-timestamp']) ? req.headers['webhook-timestamp'][0] : req.headers['webhook-timestamp'];
  const webhookSignature = Array.isArray(req.headers['webhook-signature']) ? req.headers['webhook-signature'][0] : req.headers['webhook-signature'];

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    return res.status(400).json({ message: 'Missing webhook headers' });
  }

  // Extract event data from the webhook payload
  const webhookData: WebhookData = req.body;

  try {
    // Handle recipe completion event
    const recipeStatus = webhookData.data.status;
    const { id: recipeId, metadata: { title }, craftingUserReferenceId } = webhookData.data.recipe;

    // Log incoming data for debugging purposes
    console.log(`Recipe ID: ${recipeId}, Status: ${recipeStatus}, Title: ${title}`);

    switch (recipeStatus) {
      case 'completed': {
        // Map item titles to their corresponding asset IDs
        const itemId: Record<string, string> = {
          fixerelixir: '49d95b8a-85aa-4308-bbb8-1ca7a583f08f',
          quarterrevelixir: 'c02cc3f8-f834-4b00-a758-8705e9494d4f',  
          halfrevelixir: '914770c8-68a1-4d06-a970-cdeb7fd45eff',
          plus15powerup: '33872f3f-4de2-4027-af4d-4b1dd27cf158',
          plus20powerup: 'c8d7acee-caa5-4fc1-a153-50e438f8a6a5',
        };

        // Normalize the title to match the key in `itemId` (lowercase and remove spaces)
        const titleKey = title.replace(/\s+/g, '').toLowerCase();
        const assetId = itemId[titleKey];

        if (!assetId) {
          return res.status(400).json({ message: `No matching assetId found for recipe title: ${titleKey}` });
        }

        // Issue the asset to the user
        await axios.post(
          `https://api.gameshift.dev/nx/stackable-assets/${assetId}`,
          { amount: 1, destinationUserReferenceId: craftingUserReferenceId },
          {
            headers: {
              accept: 'application/json',
              'x-api-key': process.env.GAMESHIFT_API_KEY,
              'content-type': 'application/json',
            },
          }
        );

        console.log(`Asset ${assetId} issued successfully to user: ${craftingUserReferenceId}`);
        return res.status(200).json({ message: 'Asset issued successfully.' });
      }

      case 'failed':
        console.error('Crafting failed.');
        return res.status(400).json({ message: 'Crafting recipe failed.' });

      case 'initiated':
        console.log('Crafting initiated.');
        return res.status(200).json({ message: 'Crafting recipe initiated.' });

      default:
        console.error('Unknown recipe status');
        return res.status(400).json({ message: 'Unknown recipe status.' });
    }
  } catch (error) {
    console.error('Error handling webhook:', error);
    return res.status(500).json({ message: 'Failed to handle webhook', error: String(error) });
  }
});


/* -------------------------------------------------------------------------- */
/*          End of Crafting Module for Potions and Powerups                   */
/* -------------------------------------------------------------------------- */




/* -------------------------------------------------------------------------- */
/*                              Update Warrior                                */
/* -------------------------------------------------------------------------- */




// Define types for asset attributes and event payloads
type Attribute = {
  traitType: string;
  value: string;
};

type WarriorData = {
  attributes: Attribute[];
  imageUrl: string;
  name: string;
  owner: {
    referenceId: string;
  };
};

// Define the AssetEvent type with powerupId inside the details
type AssetEvent = {
  type: string;
  assetId: string;
  transactionId: string;
  details: {
    powerupId: string; // Ensure powerupId is nested inside details
  };
};

const CharacterLevelUpThreshold = [
  {
    character: "tennon", // Character name in lowercase to ensure case-insensitive matching
    hp_threshold: [200, 350, 550, 800], // Thresholds for HP at each level
    stm_threshold: [200, 350, 550, 800] // Thresholds for STM at each level
  }
  // Add other characters here with their respective level thresholds
];

const CharacterImages: { [key: string]: string[] } = {
  tennon: [
    "https://bafybeidxbix7k7qc76ufrzcoktlixahyvdbycyu2zudgz7e3faspdxqvvi.ipfs.nftstorage.link/", // lvl 1
    "https://bafkreieyuw62lfsknfnk5lvsbmikzmmobuzpy2j3i4l54637og4aej6uma.ipfs.nftstorage.link/", // lvl 2
    "https://bafkreidrxl5tcydhmwonds7gaaf5qv7p4zrjhwxzpqlqtco24l76mm5i64.ipfs.nftstorage.link/", // lvl 3
    "https://bafkreibhz56t5xmtywolroqjvhybsl5ehartjkcqz6praogsfe5wzwnbra.ipfs.nftstorage.link/", // lvl 4
    "https://bafkreicf4424ooewqt225rhqawi72ymgwafhiqe5n43xoo4oe5odpnr5la.ipfs.nftstorage.link/"  // lvl 5
  ]
  // Add other characters here with their respective images for each level
};



// route to fetch and transfer powerup
app.post('/fetch-and-transfer-powerup', async (req: { body: { assetId: string, powerupId: string } }, res: any) => {
  const { assetId, powerupId } = req.body;

  try {
    // Step 1: Fetch warrior data using itemId (assetId)
    console.log(`Fetching warrior data for assetId: ${assetId}`);
    const warriorResponse = await axios.get(`https://api.gameshift.dev/nx/items/${assetId}`, {
      headers: {
        accept: 'application/json',
        'x-api-key': process.env.GAMESHIFT_API_KEY
      }
    });
    const warriorData: WarriorData = warriorResponse.data.item;

    if (!warriorData) {
      return res.status(404).json({ message: 'Warrior not found' });
    }

    // Extract the ownerReferenceId for powerup transfer
    const ownerReferenceId = warriorData.owner.referenceId;

    // Step 2: Log the transfer request data for debugging
    const transferRequestData = { destinationUserReferenceId: 'self', quantity: '1' };
    console.log(`Transferring power-up with powerupId: ${powerupId} to developer wallet`);
    console.log(`Transfer Request Data:`, transferRequestData);

    // Step 3: Transfer the power-up
    const transferResponse = await axios.post(
      `https://api.gameshift.dev/nx/users/${ownerReferenceId}/items/${powerupId}/transfer`,
      transferRequestData,
      {
        headers: {
          accept: 'application/json',
          'x-api-key': process.env.GAMESHIFT_API_KEY,
          'content-type': 'application/json'
        }
      }
    );

    if (transferResponse.data && transferResponse.data.transactionId) {
      // Step 4: Save transactionId and warriorId to Firestore for later lookup
      const transactionId = transferResponse.data.transactionId;

      await setDoc(doc(firestore, 'transactions', transactionId), {
        warriorId: assetId,
        powerupId: powerupId,
        status: 'pending'
      });

      return res.status(200).json({
        transactionId: transferResponse.data.transactionId,
        consentUrl: transferResponse.data.consentUrl
      });
    } else {
      console.log(`Transfer response incomplete:`, transferResponse.data);
      return res.status(500).json({ message: 'Transfer initiated, but response data was incomplete.' });
    }

  } catch (error) {
    console.error('Error during fetching or transfer:', error);
    return res.status(500).json({ message: 'Failed to fetch item or transfer powerup', error: String(error) });
  }
});



app.post('/webhooks/update-warrior-hint', async (req, res) => {
  const webhookSecret = process.env.GAMESHIFT_WEBHOOK_VALIDATION_KEY;

  if (!webhookSecret) {
    console.error('Webhook secret not found');
    return res.status(500).json({ message: 'Webhook secret not configured' });
  }

  // Extract headers for webhook signature verification
  const webhookId = Array.isArray(req.headers['webhook-id']) ? req.headers['webhook-id'][0] : req.headers['webhook-id'];
  const webhookTimestamp = Array.isArray(req.headers['webhook-timestamp']) ? req.headers['webhook-timestamp'][0] : req.headers['webhook-timestamp'];
  const webhookSignature = Array.isArray(req.headers['webhook-signature']) ? req.headers['webhook-signature'][0] : req.headers['webhook-signature'];

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    console.log('Missing webhook headers');
    return res.status(400).json({ message: 'Missing webhook headers' });
  }

  const assetEventData = req.body?.data;  // Correctly access the event payload
  const isVerified = verifyWebhook(webhookId, webhookTimestamp, webhookSignature, assetEventData, webhookSecret);

  if (!isVerified) {
    console.log('Invalid webhook signature, rejecting request');
    return res.status(403).json({ message: 'Invalid webhook signature' });
  }

  try {
    const eventType = req.body?.type;

    switch (eventType) {
      case 'stackableAsset.transfer.completed': {
        const { transactionId, assetId: powerupId } = assetEventData;  // Use destructuring for assetId (powerupId)
        
        // Step 1: Fetch the warriorId from Firestore using transactionId
        const transactionDoc = await getDoc(doc(firestore, 'transactions', transactionId));

        if (transactionDoc.exists()) {
          const { warriorId } = transactionDoc.data();  // Extract warriorId from transaction data
          console.log('Found warriorId:', warriorId);

          // Step 2: Upgrade the warrior after transfer
          await upgradeWarriorAfterTransfer(warriorId, powerupId);

          // Step 3: Update the transaction status in Firestore to "completed"
          await updateDoc(doc(firestore, 'transactions', transactionId), { status: 'completed' });

          return res.status(200).json({ message: 'Asset transfer completed and warrior upgraded.' });
        } else {
          console.log('Transaction not found');
          return res.status(404).json({ message: 'Transaction not found' });
        }
      }

      case 'stackableAsset.transfer.initiated': {
        const { transactionId, assetId } = assetEventData;  // Ensure correct access to assetId and transactionId
        console.log(`Asset transfer initiated for assetId: ${assetId}, transactionId: ${transactionId}`);
        res.status(200).json({ message: 'Asset transfer initiated.' });
        break;
      }
          
      case 'stackableAsset.transfer.failed': {
        const { transactionId, assetId } = assetEventData;  // Ensure correct access to assetId and transactionId
        console.error(`Asset transfer failed for assetId: ${assetId}, transactionId: ${transactionId}`);
        res.status(500).json({ message: 'Asset transfer failed.' });
        break;
      }

      default:
        return res.status(400).json({ message: 'Unknown event type.' });
    }
  } catch (error) {
    console.error('Error handling asset transfer event:', error);
    return res.status(500).json({ message: 'Failed to handle asset transfer event', error: String(error) });
  }
});




// Helper function to upgrade the warrior after power-up transfer
async function upgradeWarriorAfterTransfer(assetId: string, powerupId: string) {
  try {
    // Fetch warrior data using warriorId
    const warriorResponse = await axios.get(`https://api.gameshift.dev/nx/items/${assetId}`, {
      headers: {
        accept: 'application/json',
        'x-api-key': process.env.GAMESHIFT_API_KEY
      }
    });
    const warriorData = warriorResponse.data.item;

    // Extract HP, STM, LVL, and imageUrl from warrior attributes
    let OLD_HP: number | undefined, OLD_STM: number | undefined, OLD_LVL: number | undefined, OLD_IMAGEURL: string | undefined;
    warriorData.attributes.forEach((attr: any) => {
      if (attr.traitType === "HP") OLD_HP = parseInt(attr.value);
      if (attr.traitType === "STM") OLD_STM = parseInt(attr.value);
      if (attr.traitType === "LVL") OLD_LVL = parseInt(attr.value);
      OLD_IMAGEURL = warriorData.imageUrl; // Set imageUrl from warrior data
    });

    if (OLD_HP === undefined || OLD_STM === undefined || OLD_LVL === undefined || OLD_IMAGEURL === undefined) {
      throw new Error('Warrior attributes not found');
    }

    // Determine the type of powerup and set the powerUpValue based on powerupId
    let powerUpValue: number;
    if (powerupId === '33872f3f-4de2-4027-af4d-4b1dd27cf158') {
      powerUpValue = 15; // Example power-up
    } else if (powerupId === 'c8d7acee-caa5-4fc1-a153-50e438f8a6a5') {
      powerUpValue = 20; // Example power-up
    } else {
      throw new Error('Invalid powerupId');
    }

    // Calculate new HP, STM, and check for level up
    let NEW_HP = OLD_HP + powerUpValue;
    let NEW_STM = OLD_STM + powerUpValue;
    let NEW_LVL = OLD_LVL;
    let NEW_IMAGEURL = OLD_IMAGEURL;

    // Fetch level thresholds and images for this warrior character
    const characterName = warriorData.name.toLowerCase();
    const thresholds = CharacterLevelUpThreshold.find(char => char.character === characterName);

    if (thresholds) {
      const levelIndex = OLD_LVL - 1; // Since level arrays are 0-indexed
      if (NEW_HP >= thresholds.hp_threshold[levelIndex] && NEW_STM >= thresholds.stm_threshold[levelIndex]) {
        NEW_LVL = OLD_LVL + 1;
        NEW_IMAGEURL = CharacterImages[characterName][NEW_LVL - 1]; // Update image based on new level
      }
    }

    // Update warrior asset with new attributes and image
    await axios.put(
      `https://api.gameshift.dev/nx/unique-assets/${assetId}`,
      {
        attributes: [
          { traitType: 'HP', value: `${NEW_HP}` },
          { traitType: 'STM', value: `${NEW_STM}` },
          { traitType: 'LVL', value: `${NEW_LVL}` },
          { traitType: 'GLD', value: 'Strykur' }
        ],
        imageUrl: NEW_IMAGEURL
      },
      {
        headers: {
          accept: 'application/json',
          'x-api-key': process.env.GAMESHIFT_API_KEY,
          'content-type': 'application/json'
        }
      }
    );

    console.log(`Warrior updated successfully: HP=${NEW_HP}, STM=${NEW_STM}, LVL=${NEW_LVL}`);
    
  } catch (error) {
    console.error('Error upgrading warrior after transfer:', error);
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/*          End of Update Warrior Module with Powerups                   */
/* -------------------------------------------------------------------------- */


// /* -------------------------------------------------------------------------- */
// /*                                 Checkpoints                               */
// /* -------------------------------------------------------------------------- */

// const CheckpointsImages = [
//   ["https://bafkreidpquoaw7wxahs2q6dbsrjdxmmggt3pywnn57kojc7hu7xummy2my.ipfs.nftstorage.link/", "Green"],
//   ["https://bafkreibimypit2lm3ag6m2aji7jnslbwcwtkh6icotwd7ra5e26wdd2dz4.ipfs.nftstorage.link/", "Black"],
//   ["https://bafkreidy5ak5ae4b4l3lk5e53injc2idv4g24u4r47jlkrvh2jdqq7s2wq.ipfs.nftstorage.link/", "Red"],
//   ["https://bafkreibovxyvccrj3wi2x6aw7y6b5tpxef3nnbnwymf7zliwtmmkynojz4.ipfs.nftstorage.link/", "Cyan"],
//   ["https://bafkreifsquko5gi2hdmhhvh266k2cfqqfulnlco6i55i7ihi7lawzjuse4.ipfs.nftstorage.link/", "Yellow"],
//   ["https://bafkreibcaau6wtlkor3qtaj2ah2vpghhiefnbvu5p7krcbfq6s3wtlqrv4.ipfs.nftstorage.link/", "Purple"],
// ];

// /* ------------------------------ mint checkpoint ------------------------------ */
// app.post('/checkpoint', async(req, res) => {
//   const { receiver, cp_level } = req.body;

//   const options = {
//     method: 'POST',
//     url: `${underdogApiEndpoint}/v2/projects/7/nfts`,
//     headers: {
//       accept: 'application/json',
//       'content-type': 'application/json',
//       authorization: `Bearer ${underdogKey}`
//     },
//     data: {
//       name: "Checkpoint 0",
//       symbol: "CP",
//       description: "You made it to checkpoint 0",
//       image: CheckpointsImages[0][0],
//       attributes: { color: CheckpointsImages[0][1], lvl: cp_level },
//       receiver: { address: receiver },
//       delegated: true
//     }
//   };

//   axios
//   .request(options)
//   .then(async function (response) {
//     console.log(response.data);
//     let retrieveNFT;
//     do {
//         retrieveNFT = await axios.get(
//             `${underdogApiEndpoint}/v2/projects/7/nfts/${response.data.nftId}`,
//             config
//         );
//         console.log(retrieveNFT.data);
//         await new Promise( resolve => setTimeout(resolve, 500));
//     } while(retrieveNFT.data.status === 'pending');

//     let nftData = {
//       "status" : retrieveNFT.data.status,
//       "nftData" : `${(JSON.stringify(retrieveNFT.data))}`,
//       "nftId" : `${response.data.nftId}`,
//     }
//     console.log(nftData);
//     res.json(nftData);
//   })
//   .catch(function (error) {
//     console.error(error);
//   });
// })

// /* ------------------------------ For searching checkpoint NFTs use above get function to fetch checkpoint (1 checkpoint per user)  ------------------------------ */



// /* ------------------------------ update checkpoint ------------------------------ */
// app.put('/checkpointUpdate', async(req, res) => {
//   const { NFTId, cp_level, cp_number } = req.body
//   const options = {
//     method: "PUT",
//     url: `https://mainnet.underdogprotocol.com/v2/projects/7/nfts/${NFTId}`,
//     headers: {
//       accept: "application/json",
//       "content-type": "application/json",
//       authorization: `Bearer ${underdogKey}`,
//     },
//     data: {
//       attributes: { color: CheckpointsImages[cp_number][1], lvl: cp_level },
//       name: `Checkpoint ${cp_number}`,
//       description: `You made it to checkpoint ${cp_number}`,
//       image: CheckpointsImages[cp_number][0],
//     },
//   };
  
//   axios
//     .request(options)
//     .then(function (response: { data: any; }) {
//       console.log(response.data);
//       res.json(response.data);
//     })
//     .catch(function (error: any) {
//       console.error(error);
//     });
// })

// /* -------------------------------------------------------------------------- */
// /*                                End of Checkpoints Code                     */
// /* -------------------------------------------------------------------------- */



// /* -------------------------------------------------------------------------- */
// /*                                 Create Game SOAR code                      */
// /* -------------------------------------------------------------------------- */

// async function createSOARGame() {
//   const authGameCreationauthWallet = web3.Keypair.fromSecretKey(bs58.decode(`${process.env.authWalletKey}`));
//   const soarClient = SoarProgram.getFromConnection(connection, authGameCreationauthWallet.publicKey);
//   const keypair = web3.Keypair.generate();

//   let game = keypair.publicKey;
//   let title = "Intrant Inferis";
//   let description = "It is a on-chain mobile RPG";
//   let genre = Genre.RPG;
//   let gameType = GameType.Mobile; 
//   let nftMeta = new web3.PublicKey("DpFHvFR5nJX1zouUkBtfs7YLLZE59RyniUXekm8LFPA8");
//   let _auths = [authGameCreationauthWallet.publicKey];

//   let { newGame, transaction } = await soarClient.initializeNewGame(game, title, description, genre, gameType, nftMeta, _auths);
//   const tx = await web3.sendAndConfirmTransaction(connection, transaction, [authGameCreationauthWallet, keypair]);
//   console.log("SOAR Create Game : " + tx);
// };

// async function createSOARLeaderboard() { 
//   try {
//     const authGameCreationauthWallet = web3.Keypair.fromSecretKey(bs58.decode(`${process.env.authWalletKey}`));
//     const soarClient = SoarProgram.getFromConnection(connection, authGameCreationauthWallet.publicKey);

//     const transactionIx = await soarClient.addNewGameLeaderBoard(
//       new web3.PublicKey("7T4rRNuZrU5ZXyLPgMa4d7t7qvgtXMRDNpikbwdQ9ndc"),
//       authGameCreationauthWallet.publicKey,
//       "Intrant Inferis All-Time Leaderboard",
//       new web3.PublicKey("DpFHvFR5nJX1zouUkBtfs7YLLZE59RyniUXekm8LFPA8"), // nft associated with the leaderboard
//       100,
//       false
//     );

//     const tx = await web3.sendAndConfirmTransaction(connection, transactionIx.transaction, [authGameCreationauthWallet]);
//     console.log("SOAR Leaderboard Create Game : " + tx);
//   }
//   catch (e) { 
//     console.log(e);
//   }
// }

// // createSOARLeaderboard();
// //createSOARGame();

// /* -------------------------------------------------------------------------- */
// /*                                 End of Game SOAR code                      */
// /* -------------------------------------------------------------------------- */


// /* -------------------------------------------------------------------------- */
// /*                                 Update score using SOAR code               */
// /* -------------------------------------------------------------------------- */

// app.post('/addSOARScore', async (req, res) => {
//   try {
//     const { scoreAllTime, scoreWeekly, playerPublicKey } = req.body;

//     const authWallet = web3.Keypair.fromSecretKey(bs58.decode(`${authWalletKey}`));
//     const soarClient = SoarProgram.getFromConnection(connection, authWallet.publicKey);
    
//     const transactionIxAlTime = await soarClient
//       .submitScoreToLeaderBoard(
//         playerPublicKey,        // player's address
//         authWallet.publicKey,   // address that deployed the contract that has the authority to put the score in the leaderboard
//         leaderboardKeyAllTime,         // leaderboard associated with soar [PublicKey]
//         new BN(parseInt(scoreAllTime)) // score to be updated inside the leaderboard
//     );

//     const transactionIxWeekly = await soarClient
//       .submitScoreToLeaderBoard(
//         playerPublicKey,        // player's address
//         authWallet.publicKey,   // address that deployed the contract that has the authority to put the score in the leaderboard
//         leaderboardKeyWeekly,         // weekly leaderboard associated with soar [PublicKey]
//         new BN(parseInt(scoreWeekly)) // score to be updated inside the leaderboard
//     );

//     transactionIxAlTime.transaction.add(transactionIxWeekly.transaction);

//     const sig = await web3.sendAndConfirmTransaction(connection, transactionIxAlTime.transaction, [authWallet]);
//     console.log(sig);
//     res.send(sig);
//   }
//   catch (err)
//   {
//     console.log(err);
//     res.status(500).send({ message: err });
//   }
// });

// app.post('/claimWeeklyReward', async (req, res) => {
//   try {
//     const { playerPublicKey, index } = req.body;

//     var weeklyLeaderboard = await createCollectionIfEmpty("Weekly Leaderboard", "Bonk");
//     let user = null;
//     for (let i = 0; i < weeklyLeaderboard.data.length; i++) {
//       if (weeklyLeaderboard.data[i].userAddress == playerPublicKey) {
//         user = weeklyLeaderboard.data[i];
//       }
//     }

//     console.log("Getting " + user.userRewards[index] + weeklyLeaderboard.tokenName);
//     //Distribute Reward
//     // const sig = await web3.sendAndConfirmTransaction(connection, transactionIxAlTime.transaction, [authWallet]);
//     // console.log(sig);
//     // res.send(sig);
  
//     user.userRewards.splice(index, 1);
//     const updateResults = await leaderboard.updateOne(
//       { _id: weeklyLeaderboard._id },
//       { $set: { "data.$[i].userRewards": user.userRewards } },
//       {
//         arrayFilters: [{
//           "i._id": user._id
//         }]
//       }
//     );
//     console.log(updateResults);
//     res.json(updateResults);
//   }
//   catch (err)
//   {
//     console.log(err);
//     res.status(500).send({ message: err });
//   }
// });

// async function SOARCron() { 
//   cron.schedule("0 0 * * 1", async function () {
//     const authWallet = web3.Keypair.fromSecretKey(bs58.decode(`${authWalletKey}`));
//     const soarClient = SoarProgram.getFromConnection(connection, authWallet.publicKey);

//     const allWeeklyLeaderboardAccount = await soarClient.fetchLeaderBoardAccount(leaderboardKeyWeekly);
//     const allWeeklyToEntriesAccounts = await soarClient.fetchLeaderBoardTopEntriesAccount(allWeeklyLeaderboardAccount.topEntries as web3.PublicKey);
    
//     for (let index = 0; index < allWeeklyToEntriesAccounts.topScores.length; index++) {
//       const player = allWeeklyToEntriesAccounts.topScores[index];
//       if (player.player.toString() != web3.PublicKey.default.toString()) { 
//         const playerAddress = (await soarClient.fetchPlayerAccount(player.player)).user;
//         const [playerScoresListAddress] = soarClient.utils.derivePlayerScoresListAddress(playerAddress, leaderboardKeyWeekly);
//         const playerScoresList = await soarClient.fetchPlayerScoresListAccount(playerScoresListAddress);
        
//         var latestScore = 0;
//         var latestTimestamp = 0;
//         for (let index = 0; index < playerScoresList.scores.length; index++) {
//           const element = playerScoresList.scores[index];
//           if (latestTimestamp < element.timestamp) { 
//             latestTimestamp = element.timestamp;
//             latestScore = element.score;
//           }
//         }
            
//         if (latestScore > 0) { 
//           const transactionIxWeekly = await soarClient
//           .submitScoreToLeaderBoard(
//             playerAddress,        // player's address
//             authWallet.publicKey,   // address that deployed the contract that has the authority to put the score in the leaderboard
//             leaderboardKeyWeekly,         // weekly leaderboard associated with soar [PublicKey]
//             new BN(0) // score to be updated inside the leaderboard
//           );
            
//           const sig = await web3.sendAndConfirmTransaction(connection, transactionIxWeekly.transaction, [authWallet], {commitment: 'finalized'});
//           console.log(sig);

//           var weeklyLeaderboard = await createCollectionIfEmpty("Weekly Leaderboard", "Bonk");

//           let user = null;
//           for (let i = 0; i < weeklyLeaderboard.data.length; i++) {
//             if (weeklyLeaderboard.data[i].userAddress == playerAddress) {
//               user = weeklyLeaderboard.data[i];
//             }
//           }

//           if (user != null) {
//             if (user.userAddress == playerAddress) { 
//               user.userRewards.push(allRewardsLevels[index]);
//             }
//           }
//           else { 
//             weeklyLeaderboard.data.push({
//               userAddress: playerAddress,
//               userRewards: [allRewardsLevels[index]],
//             });
//           }

//           await weeklyLeaderboard.save().catch(console.error);
//         }
//       }
//     }
//   });
// }

// async function ConnectMongoDB() {
//   await mongoose.connect(process.env.databaseToken as string).catch(console.error);
// }; 

// ConnectMongoDB();
// SOARCron();

app.listen(port, () => {
    console.log(`API server is listening on port ${port}`)
})

/* -------------------------------------------------------------------------- */
/*                                End of SOAR code                            */
/* -------------------------------------------------------------------------- */