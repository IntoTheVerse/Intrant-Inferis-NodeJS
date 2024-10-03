import * as express from 'express';
import * as dotenv from "dotenv";
import axios from 'axios';
import { auth, firestore } from './config/firebaseConfig';
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail, updatePassword } from 'firebase/auth';
import { getDocs, doc, collection, setDoc, updateDoc } from 'firebase/firestore';
import { setLogLevel } from 'firebase/app';
setLogLevel('debug');




const cron = require("node-cron");


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



// Test function to create a user
// async function testFirebaseAuth() {
//   try {
//     // const userCredential = await createUserWithEmailAndPassword(auth, "testuser222@example.com", "password123");
//     console.log("User created:", userCredential.user.uid);
//   } catch (error: unknown) {
//     // Type narrowing for unknown type
//     if (error instanceof Error) {
//       // Now we know error is of type Error, we can safely access its properties
//       console.error("Error during Firebase Auth:", error.message);
//     } else {
//       // In case the error is not of type Error
//       console.error("An unknown error occurred:", error);
//     }
//   }
// }

// testFirebaseAuth();

axios.get('https://firebase.google.com')
  .then(response => console.log('Network Request Successful:', response.status))
  .catch(error => console.error('Network Request Failed:', error));



//Solana
// import web3 = require("@solana/web3.js");
// import BN = require("bn.js");
// require('dotenv').config();
// const apiKey = process.env.apikey;
// const underdogKey = process.env.underdogkey;
// const authWalletKey = process.env.authWalletKey;

//Underdog API endpoint 
// const underdogApiEndpoint = "https://mainnet.underdogprotocol.com";
// const heliusUrl = `https://solana-mainnet.api.syndica.io/api-token/${apiKey}`;
// const connection = new web3.Connection(heliusUrl);

//Soar
// import bs58 = require('bs58');
// import { SoarProgram, GameType, Genre } from "@magicblock-labs/soar-sdk";
// const leaderboardKeyAllTime = new web3.PublicKey(process.env.leaderboardKeyAllTime as string);
// const leaderboardKeyWeekly = new web3.PublicKey(process.env.leaderboardKeyWeekly as string);

//MongoDB
// const mongoose = require("mongoose");
// import { leaderboard } from './schemas/leaderboardDataSchema';

// const config = {
//     headers: {
//         Authorization: `Bearer ${underdogKey}`
//     }
// }

// const CharacterLevelUpThreshold = [
//   { character: "Tennon", hp_threshold: [200], stm_threshold: [200] }
// ];


// const AllBuyableWarriors = [
//     {
//       name: "Tennon",
//       description: "The mighty Tennon",
//       image: "https://bafybeidxbix7k7qc76ufrzcoktlixahyvdbycyu2zudgz7e3faspdxqvvi.ipfs.nftstorage.link/",
//       attributes: { HP: "190", STM: "190", LVL: "1", GLD: "Strykur" },
//       inferis: 20,
//       characterId : 0
//     },
//   ];

// const AllBuyablePotions = [
//   {
//     name: "Fixer Elixir",
//     description:
//       "The Fixer Elixir gives a warrior an instant temporary return to stamina/full health",
//     image: "https://bafkreietd6olqr2ci2dc7si4vy6hf6pv7hyxsiq46rk32xpkuzzbbrwy7e.ipfs.nftstorage.link/",
//     attributes: { color: "Purple" },
//     potionId: 0,
//     inferis: 20,
//     required: [
//       {
//         item: 2,
//         value: 2,
//       },
//       {
//         item: 3,
//         value: 2,
//       },
//       {
//         item: 4,
//         value: 2,
//       },
//     ],
//   },
//   {
//     name: "Quarter Revival Elixir",
//     description:
//       "The Fixer Elixir gives a warrior an instant temporary return to quarter stamina/health",
//     image: "https://bafkreidvep3viw3nqqkqb5k2o2ywzkau2boyslujr63pj5gcbap6s37jeq.ipfs.nftstorage.link/",
//     attributes: { color: "Green" },
//     potionId: 1,
//     inferis: 10,
//     required: [
//       {
//         item: 2,
//         value: 1,
//       },
//       {
//         item: 3,
//         value: 1,
//       },
//       {
//         item: 4,
//         value: 1,
//       },
//     ],
//   },
//   {
//     name: "Half Revival Elixir",
//     description:
//       "The Fixer Elixir gives a warrior an instant temporary return to half stamina/health",
//     image: "https://bafkreideyeu5onx4oq5b2o4vzf7wuuk3ugfqynblqdyk4haf4q4uqxlw74.ipfs.nftstorage.link/",
//     attributes: { color: "Red" },
//     potionId: 2,
//     inferis: 15,
//     required: [
//       {
//         item: 2,
//         value: 1,
//       },
//       {
//         item: 3,
//         value: 2,
//       },
//       {
//         item: 4,
//         value: 1,
//       },
//     ],
//   },
// ];

// const AllBuyablePowerups = [
//   {
//     name: "Plus 15 Powerup",
//     description:
//       "Boost player's STM and HP by +15 units causing a permanent upgrade",
//     image: "https://bafkreicp7qmmf2c5iyftsxhzf34vz3qllbr3k3xdwgxvsbnlbgokm5i3gy.ipfs.nftstorage.link/",
//     attributes: { color: "Cyan", stm: "+15", hp: "+15"},
//     powerupId: 0,
//     inferis: 50,
//     required: [
//       {
//         item: 2,
//         value: 3,
//       },
//       {
//         item: 3,
//         value: 3,
//       },
//       {
//         item: 4,
//         value: 3,
//       },
//     ],
//   },
//   {
//     name: "Plus 20 Powerup",
//     description: "Boost player's STM and HP by +20 units causing a permanent upgrade",
//     image: "https://bafkreihytm5tseo52ff3xzhcggbzfhzvns5wfteppubufzfltuov5pnv3q.ipfs.nftstorage.link/",
//     attributes: { color: "Pink", stm: "+20", hp: "+20"},
//     powerupId: 1,
//     inferis: 60,
//     required: [
//       {
//         item: 2,
//         value: 4,
//       },
//       {
//         item: 3,
//         value: 4,
//       },
//       {
//         item: 4,
//         value: 4,
//       },
//     ],
//   },
// ]

// const allXpLevels = [400, 1000, 1700, 2500, 3600, 5000];
// const allRewardsLevels = [10_000, 8_000, 6_500, 5_000, 3_500, 2_000, 1_000, 800, 400, 100];

/* -------------------------------------------------------------------------- */
/*                                Helper Code                                 */
/* -------------------------------------------------------------------------- */

/* ------------------------------ Burn NFT ------------------------------ */

// async function burnAsset(assetcollectionId: number, assetId: any) {
//   const options = {
//     method: 'POST',
//     url: `https://mainnet.underdogprotocol.com/v2/projects/${assetcollectionId}/nfts/${assetId}/burn`,
//     headers: {
//       accept: 'application/json',
//       authorization: `Bearer ${underdogKey}`
//     }
//   };
    
//   axios
//     .request(options)
//     .then(function (response: { data: any; }) {
//       console.log(response.data);
//       return(response.data);
//     })
//     .catch(function (error: any) {
//       console.error(error);
//   });
// }

/* -------------------------------------------------------------------------- */
/*                                End of Helper Code                          */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/*                                Search Code                               */
/* -------------------------------------------------------------------------- */

/* ------------------------------ Search By NFTId ------------------------------ */

// app.get<{ pId: number, NftId: number },{}>("/searchByNFTId/:pId&:NftId", async (req, res) => {
//   try {
//     const nftId = req.params.NftId;
//     const pId = req.params.pId;
//     const getNftOptions = {
//       method: "GET",
//       url: `https://mainnet.underdogprotocol.com/v2/projects/${pId}/nfts/${nftId}`,
//       headers: {
//         accept: "application/json",
//         authorization: `Bearer ${underdogKey}`,
//       },
//     };

//     axios
//       .request(getNftOptions)
//       .then(function (response: { data: any; }) {
//         console.log(response.data);
//         res.json(response.data);
//       })
//       .catch(function (error: any) {
//         console.error(error);
//       });
//   } catch(err) {
//     res.status(500).send({ message: err });
//   }
// });

/* ------------------------------ Get Collection By Owner ------------------------------ */

// app.get<{ pId: number, playerAddress: string },{}>("/getCollectionByOwner/:pId&:playerAddress", async (req, res) => {
//   try {
//     const pid = req.params.pId;
//     const pAddress = req.params.playerAddress;
//     const searchWarriorNftOptions = {
//       method: "GET",
//       url: `https://mainnet.underdogprotocol.com/v2/projects/${pid}/nfts/search?page=1&limit=100&search=${pAddress}`,
//       headers: {
//         accept: "application/json",
//         authorization: `Bearer ${underdogKey}`,
//       },
//     };

//     axios
//       .request(searchWarriorNftOptions)
//       .then(function (response: { data: any; }) {
//         console.log(response.data);
//         res.json(response.data);
//       })
//       .catch(function (error: any) {
//         console.error(error);
//       });
//   } catch(err) {
//       res.status(500).send({ message: err });
//   }
// });

/* -------------------------------------------------------------------------- */
/*                                End of Search Code                         */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/*                                Get All Default Code                        */
/* -------------------------------------------------------------------------- */

// app.get('/getAllBuyableWarriors', async (req, res) => { 
//     try {
//         res.json(AllBuyableWarriors);
//     } catch(err) {
//         res.status(500).send({ message: err });
//     }
// });

// app.get('/getAllBuyablePotions', async (req, res) => {
//   try {
//     res.json(AllBuyablePotions);
//   } catch (err) {
//     res.status(500).send({ message: err });
//   }
// });

// app.get('/getAllBuyablePowerups', async (req, res) => {
//   try {
//     res.json(AllBuyablePowerups);
//   } catch (err) {
//     res.status(500).send({ message: err });
//   }
// });

// app.get('/getAllXpLevels', async (req, res) => {
//   try {
//     res.json(allXpLevels);
//   } catch (err) {
//     res.status(500).send({ message: err });
//   }
// });

// app.get('/getAllUsersWithRewards', async (req, res) => {
//   try {
//     res.json(await createCollectionIfEmpty("Weekly Leaderboard", "Bonk"));
//   } catch (err) {
//     console.error(err);
//   }
// });

/* -------------------------------------------------------------------------- */
/*                                End of Get All Default Code                 */
/* -------------------------------------------------------------------------- */

// async function createCollectionIfEmpty(collectionName: string, tokenName: string): Promise<typeof leaderboard> { 
//   let mongoLeaderboard = await leaderboard.findOne({ eventName: collectionName });
//   if (!mongoLeaderboard || mongoLeaderboard.eventName != collectionName) { 
//     mongoLeaderboard = new leaderboard({
//       _id: new mongoose.Types.ObjectId(),
//       eventName: collectionName,
//       tokenName: tokenName,
//       totalPrizePool: 1000000,
//       leaderboardAddress: leaderboardKeyWeekly,
//       data: []
//     });

//     await mongoLeaderboard.save().catch(console.error);
//   }
//   return mongoLeaderboard;
// }

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


app.post('/changePassword', async (req, res) => {
  const { newPassword } = req.body;

  try {
    const user = auth.currentUser; // Get the currently logged-in user

    if (user) {
      await updatePassword(user, newPassword); // Update password
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

/* -------------------------------------------------------------------------- */
/*               End of Register User with Gameshift Code                     */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                             Asset Collection                               */
/* -------------------------------------------------------------------------- */

/* ---------------------------- Mint Collection------------------------------ */

// Route to create a new collection in GameShift
app.post('/createCollection', async (req, res) => {
  const { name, description, imageUrl, contains } = req.body;

  try {
    // Log incoming request
    console.log('Create Collection API hit. Request Body:', { name, description, imageUrl, contains });

    // Step 1: Create the collection with GameShift
    console.log('Creating collection with GameShift...');
    const gameShiftResponse = await axios.post(
      'https://api.gameshift.dev/nx/asset-collections',
      {
        name,
        description,
        imageUrl,
        contains,
      },
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

    // Step 2: Introduce a delay of 5 seconds before fetching the full collection details
    console.log('Waiting for 5 seconds to allow mintAddress to be confirmed...');
    await new Promise(resolve => setTimeout(resolve, 20000)); // 20-second delay

    // Step 3: Fetch the full collection details including the mintAddress
    console.log(`Fetching collection details for ID: ${collectionId} to retrieve mintAddress...`);
    const collectionDetailsResponse = await axios.get(
      `https://api.gameshift.dev/nx/asset-collections/${collectionId}?includeStats=false`,
      {
        headers: {
          accept: 'application/json',
          'x-api-key': process.env.GAMESHIFT_API_KEY,
        },
      }
    );

    const fullCollectionData = collectionDetailsResponse.data;
    console.log('Full collection details retrieved:', fullCollectionData);

    // Step 4: Store the collection details in Firestore, including the mintAddress
    console.log('Storing collection details in Firestore...');
    const collectionDoc = doc(firestore, 'ii-collections', collectionId);
    await setDoc(collectionDoc, {
      id: fullCollectionData.id,
      name: fullCollectionData.name,
      description: fullCollectionData.description,
      environment: fullCollectionData.environment,
      imageUrl: fullCollectionData.imageUrl,
      imported: fullCollectionData.imported,
      mintAddress: fullCollectionData.mintAddress,
      created: fullCollectionData.created,
      contains: fullCollectionData.contains,
    });
    console.log('Collection details stored in Firestore successfully.');

    // Respond with success
    res.status(200).json({
      message: 'Collection created and stored successfully',
      gameShiftData: fullCollectionData,
    });

  } catch (error: unknown) {
    // Check if the error is an instance of AxiosError or Error
    if (axios.isAxiosError(error)) {
      console.error('AxiosError during collection creation:', error.message);
      res.status(500).send({
        message: 'Collection creation failed',
        error: error.message,
        details: error.response?.data,  // Include additional details if available
      });
    } else if (error instanceof Error) {
      // Handle generic Error instances
      console.error('Error during collection creation:', error.message);
      res.status(500).send({
        message: 'Collection creation failed',
        error: error.message,
      });
    } else {
      // Fallback for any non-standard error types (e.g., strings, other objects)
      console.error('Unknown error during collection creation:', error);
      res.status(500).send({
        message: 'An unexpected error occurred',
        error: String(error),
      });
    }
  }
});
// Define the Collection interface
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

    // Step 4: Respond with the list of new collections added to Firestore (if any)
    res.status(200).json({
      message: `${newCollections.length} new collections added to Firestore.`,
      newCollections,
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




/* -------------------------------------------------------------------------- */
/*                                Warrior Code                                */
/* -------------------------------------------------------------------------- */

/* ------------------------------ Mint Warrior ------------------------------ */

// app.post('/warrior', async(req, res) => {

//   const { receiver, id } = req.body;
//   const character = AllBuyableWarriors[id];

//   const options = {
//     method: 'POST',
//     url: `${underdogApiEndpoint}/v2/projects/1/nfts`,
//     headers: {
//       accept: 'application/json',
//       'content-type': 'application/json',
//       authorization: `Bearer ${underdogKey}`
//     },
//     data: {
//       name: character.name,
//       symbol: "WARRIOR",
//       description: character.description,
//       image: character.image,
//       attributes: character.attributes,
//       receiver: { address: receiver },
//       delegated: true,
//     }
//   };
  
//   axios
//     .request(options)
//     .then(async function (response) {
//       console.log(response.data);
//       let retrieveNFT;
//       do {
//           retrieveNFT = await axios.get(
//               `${underdogApiEndpoint}/v2/projects/1/nfts/${response.data.nftId}`,
//               config
//           );
//           console.log(retrieveNFT.data);
//           await new Promise( resolve => setTimeout(resolve, 500));
//       } while(retrieveNFT.data.status === 'pending');

//       let nftData = {
//         "status" : retrieveNFT.data.status,
//         "nftData" : `${(JSON.stringify(retrieveNFT.data))}`,
//         "nftId" : `${response.data.nftId}`,
//       }
//       console.log(nftData);
//       res.json(nftData);
//     })
//     .catch(function (error) {
//       console.error(error);
//     });
// })

// /* ------------------------------ update warrior upon administering powerups inside the game ------------------------------ */

// const WarriorImages = [
//   "https://bafybeidxbix7k7qc76ufrzcoktlixahyvdbycyu2zudgz7e3faspdxqvvi.ipfs.nftstorage.link/",
//   "https://bafkreieyuw62lfsknfnk5lvsbmikzmmobuzpy2j3i4l54637og4aej6uma.ipfs.nftstorage.link/",
//   "https://bafkreidrxl5tcydhmwonds7gaaf5qv7p4zrjhwxzpqlqtco24l76mm5i64.ipfs.nftstorage.link/",
//   "https://bafkreibhz56t5xmtywolroqjvhybsl5ehartjkcqz6praogsfe5wzwnbra.ipfs.nftstorage.link/",
//   "https://bafkreicf4424ooewqt225rhqawi72ymgwafhiqe5n43xoo4oe5odpnr5la.ipfs.nftstorage.link/",
// ];

// app.put('/warriorUpdate', async(req, res) => {
//   const { PowerUpId, NFTId, characterName, hp, stm, lvl } = req.body;
//   let cur_lvl = parseInt(lvl);
//   for (let i = 0; i < CharacterLevelUpThreshold.length; i++) {
//     if (CharacterLevelUpThreshold[i].character === characterName) {
//       if (
//         hp >= CharacterLevelUpThreshold[i].hp_threshold[cur_lvl - 1] &&
//         stm >= CharacterLevelUpThreshold[i].stm_threshold[cur_lvl - 1]
//       ) {
//         cur_lvl++;
//       }
//     }
//   }

//   await burnAsset(6, PowerUpId)
//     .then(function (response) {
//       const options = {
//         method: "PUT",
//         url: `https://mainnet.underdogprotocol.com/v2/projects/1/nfts/${NFTId}`,
//         headers: {
//           accept: "application/json",
//           "content-type": "application/json",
//           authorization: `Bearer ${underdogKey}`,
//         },
//         data: {
//           attributes: {
//             HP: hp,
//             STM: stm,
//             LVL: cur_lvl,
//             GLD: "Strykur",
//           },
//           name: "Tennon",
//           image: WarriorImages[cur_lvl - 1],
//         },
//       };

//       axios
//         .request(options)
//         .then(function (response: { data: any; }) {
//           console.log(response.data);
//           res.json(response.data);
//         })
//         .catch(function (error: any) {
//           console.error(error);
//         });
//     })
//     .catch(function (error) {
//       console.error(error);
//   });
// })

// /* -------------------------------------------------------------------------- */
// /*                                End of Warrior Code                         */
// /* -------------------------------------------------------------------------- */






// /* -------------------------------------------------------------------------- */
// /*                                Artifacts Code                               */
// /* -------------------------------------------------------------------------- */

// /* -------------------------------------------------------------------------- */
// /*                                Theracode                               */
// /* -------------------------------------------------------------------------- */

// /* ------------------------------ mint theracode during collection from the game ------------------------------ */

// app.post('/theracode', async(req, res) => {
//   const { receiver } = req.body;

//   const options = {
//     method: 'POST',
//     url: `${underdogApiEndpoint}/v2/projects/2/nfts`,
//     headers: {
//       accept: 'application/json',
//       'content-type': 'application/json',
//       authorization: `Bearer ${underdogKey}`
//     },
//     data: {
//     name: "Theracode",
//     symbol: "THERACODE",
//     description: "Mystical book that reveals binaries",
//     image: "https://bafkreicli7hzoarg4a22ebuu2spjajx6c6f4m7wzoegzhebrn2kw2ur5oa.ipfs.nftstorage.link/",
//     attributes: { color: "blue" },
//     receiver: { address: receiver },
//     delegated: true,
//     }
//   };
        
//   axios
//   .request(options)
//   .then(async function (response) {
//     console.log(response.data);
//     let retrieveNFT;
//     do {
//         retrieveNFT = await axios.get(
//             `${underdogApiEndpoint}/v2/projects/2/nfts/${response.data.nftId}`,
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

// /* ------------------------------ burn Theracode NFT from collection upon use to make potions or powerups ------------------------------ */

// /* -------------------------------------------------------------------------- */
// /*                                End of Theracode                               */
// /* -------------------------------------------------------------------------- */


// /* -------------------------------------------------------------------------- */
// /*                                TheraBox                              */
// /* -------------------------------------------------------------------------- */

// /* ------------------------------ mint thera box during collection from the game ------------------------------ */
// app.post('/therabox', async(req, res) => {
//   const { receiver } = req.body;

//   const options = {
//     method: 'POST',
//     url: `${underdogApiEndpoint}/v2/projects/3/nfts`,
//     headers: {
//       accept: 'application/json',
//       'content-type': 'application/json',
//       authorization: `Bearer ${underdogKey}`
//     },
//     data: {
//       name: "Thera Box",
//       symbol: "THERABOX",
//       description: "Glowing mini boxes with hidden artifacts",
//       image: "https://bafkreia4z6j6ghh2q2s7bdhbkiqitrwbivqpqdqftblni2f45xu4vousxu.ipfs.nftstorage.link/",
//       attributes: { color: "yellow" },
//       receiver: { address: receiver },
//       delegated: true,
//     }
//   };
        
//   axios
//   .request(options)
//   .then(async function (response) {
//     console.log(response.data);
//     let retrieveNFT;
//     do {
//         retrieveNFT = await axios.get(
//             `${underdogApiEndpoint}/v2/projects/3/nfts/${response.data.nftId}`,
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


// /* -------------------------------------------------------------------------- */
// /*                                Magical Scroll                              */
// /* -------------------------------------------------------------------------- */

// /* ------------------------------ mint magical scroll during collection from the game ------------------------------ */

// app.post('/scroll', async(req, res) => {
//   const { receiver } = req.body;

//   const options = {
//     method: 'POST',
//     url: `${underdogApiEndpoint}/v2/projects/4/nfts`,
//     headers: {
//       accept: 'application/json',
//       'content-type': 'application/json',
//       authorization: `Bearer ${underdogKey}`
//     },
//     data: {
//       name: "Magical Scroll",
//           symbol: "SCROLL",
//           description:
//             "A partially open magical scroll that contains ancient writing and binaries",
//           image: "https://bafkreicbengkiedvzbgrtfjbxzwd4udnnbkctqfl5m3hs5a56fdzie7iiu.ipfs.nftstorage.link/",
//           attributes: { color: "white" },
//           receiver: { address: receiver },
//           delegated: true,
//     }
//   };
        
//   axios
//   .request(options)
//   .then(async function (response) {
//     console.log(response.data);
//     let retrieveNFT;
//     do {
//         retrieveNFT = await axios.get(
//             `${underdogApiEndpoint}/v2/projects/4/nfts/${response.data.nftId}`,
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

// /* -------------------------------------------------------------------------- */
// /*                                End of Artifacts Code                       */
// /* -------------------------------------------------------------------------- */



// /* -------------------------------------------------------------------------- */
// /*                                Potions' Code                               */
// /* -------------------------------------------------------------------------- */

// /* ------------------------------ mint potion after burning a artifact ------------------------------ */

// app.post('/potion', async(req, res) => {
//   const { receiver, id } = req.body;
//   const potion = AllBuyablePotions[id];

//   const options = {
//     method: 'POST',
//     url: `${underdogApiEndpoint}/v2/projects/5/nfts`,
//     headers: {
//       accept: 'application/json',
//       'content-type': 'application/json',
//       authorization: `Bearer ${underdogKey}`
//     },
//     data: {
//     name: potion.name,
//     symbol: "ELIXIR",
//     description: potion.description,
//     image: potion.image,
//     attributes: potion.attributes,
//     receiver: { address: receiver },
//     delegated: true,
//     }
//   };
        
//   axios
//   .request(options)
//   .then(async function (response) {
//     console.log(response.data);
//     let retrieveNFT;
//     do {
//         retrieveNFT = await axios.get(
//             `${underdogApiEndpoint}/v2/projects/5/nfts/${response.data.nftId}`,
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

// app.post('/burnAndMintPotion', async (req, res) => {
//   const { receiver, id, burnItems } = req.body;
//   const potion = AllBuyablePotions[id];

//   //burnItems that are being used in the gameplay
//     for (let i = 0; i < burnItems.length; i++) {
//       for (let j = 0; j < burnItems[i].nftIds.length; j++) {
//         await burnAsset(burnItems[i].projectId, burnItems[i].nftIds[j]);
//       }
//     }

//     const options = {
//       method: 'POST',
//       url: `${underdogApiEndpoint}/v2/projects/5/nfts`,
//       headers: {
//         accept: 'application/json',
//         'content-type': 'application/json',
//         authorization: `Bearer ${underdogKey}`
//       },
//       data: {
//       name: potion.name,
//       symbol: "ELIXIR",
//       description: potion.description,
//       image: potion.image,
//       attributes: potion.attributes,
//       receiver: { address: receiver },
//       delegated: true,
//       }
//     };

//     axios
//   .request(options)
//   .then(async function (response) {
//     console.log(response.data);
//     let retrieveNFT;
//     do {
//         retrieveNFT = await axios.get(
//             `${underdogApiEndpoint}/v2/projects/5/nfts/${response.data.nftId}`,
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
// });

// /* ------------------------------ burn potion NFT from collection upon use of potion inside the game ------------------------------ */

// app.post('/burnPotion', async(req, res) => {
//   const { id } = req.body;

//   const options = {
//     method: 'POST',
//     url: `https://mainnet.underdogprotocol.com/v2/projects/5/nfts/${id}/burn`,
//     headers: {
//       accept: 'application/json',
//       authorization: `Bearer ${underdogKey}`
//     }
//   };
  
//   axios
//     .request(options)
//     .then(function (response) {
//       console.log(response.data);
      
//       let nftData = {
//         "transactionId" : `${response.data.transactionId}`,
//         "mintAddress" : `${response.data.transactionId}`,
//         "projectId" : `${response.data.projectId}`,
//         "nftId" : `${response.data.nftId}`
//       }
//       res.json(nftData);
//     })
//     .catch(function (error) {
//       console.error(error);
//     });
    
// })



// /* -------------------------------------------------------------------------- */
// /*                                End of Potions Code                               */
// /* -------------------------------------------------------------------------- */



// /* -------------------------------------------------------------------------- */
// /*                                Powerups' Code                               */
// /* -------------------------------------------------------------------------- */

// /* ------------------------------ Buy Powerup ------------------------------ */
// app.post('/powerup', async (req, res) => {
//   const { receiver, id } = req.body;
//   const powerups = AllBuyablePowerups[id];

//   const options = {
//     method: 'POST',
//     url: `${underdogApiEndpoint}/v2/projects/6/nfts`,
//     headers: {
//       accept: 'application/json',
//       'content-type': 'application/json',
//       authorization: `Bearer ${underdogKey}`
//     },
//     data: {
//       name: powerups.name,
//       symbol: "POWERUP",
//       description: powerups.description,
//       image: powerups.image,
//       attributes: powerups.attributes,
//       receiver: { address: receiver },
//       delegated: true,
//     }
//   };

//   axios
//     .request(options)
//     .then(async function (response) {
//       console.log(response.data);
//       let retrieveNFT;
//       do {
//         retrieveNFT = await axios.get(
//           `${underdogApiEndpoint}/v2/projects/6/nfts/${response.data.nftId}`,
//           config
//         );
//         await new Promise((resolve) => setTimeout(resolve, 500));
//       } while(retrieveNFT.data.status === 'pending')

//       let nftData = {
//         "status" : retrieveNFT.data.status,
//         "nftData" : `${(JSON.stringify(retrieveNFT.data))}`,
//         "nftId" : `${response.data.nftId}`,
//       }
//       console.log(nftData);
//       res.json(nftData);
//     })
//     .catch(function (error) {
//       console.error(error);
//     });
// });

// app.post('/burnAndMintPowerup', async (req, res) => {
//   const { receiver, id, burnItems } = req.body;
//   const powerups = AllBuyablePowerups[id];

//   //burn powerups that are being used in the gameplay
//   for (let i = 0; i < burnItems.length; i++) {
//     for (let j = 0; j < burnItems[i].nftIds.length; j++) {
//       await burnAsset(burnItems[i].projectId, burnItems[i].nftIds[j]);
//     }
//   }

//   const options = {
//     method: 'POST',
//     url: `${underdogApiEndpoint}/v2/projects/6/nfts`,
//     headers: {
//       accept: 'application/json',
//       'content-type': 'application/json',
//       authorization: `Bearer ${underdogKey}`
//     },
//     data: {
//       name: powerups.name,
//       symbol: "POWERUP",
//       description: powerups.description,
//       image: powerups.image,
//       attributes: powerups.attributes,
//       receiver: { address: receiver },
//       delegated: true,
//     }
//   };

//   axios
//   .request(options)
//   .then(async function (response) {
//     console.log(response.data);
//     let retrieveNFT;
//     do {
//         retrieveNFT = await axios.get(
//             `${underdogApiEndpoint}/v2/projects/6/nfts/${response.data.nftId}`,
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
// });

// /* -------------------------------------------------------------------------- */
// /*                                End of Powerups Code                        */
// /* -------------------------------------------------------------------------- */



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