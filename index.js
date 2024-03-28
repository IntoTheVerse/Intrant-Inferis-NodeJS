    //Replace "start": "nodemon server.js" with "start": "nodemon index.js"

// solana
// const { struct, u32, ns64 } = require("@solana/buffer-layout");
// const { Buffer } = require("buffer");
// const web3 = require("@solana/web3.js");

// express + node
const express = require('express');
const app = express();
app.use(express.json());

// // access to keypair 
// let keypair = web3.Keypair.generate();
// let payer = web3.Keypair.generate();

// // connection to devnet
// let connection = new web3.Connection(web3.clusterApiUrl("devnet"));

// let airdropSignature = await connection.requestAirdrop(
//   payer.publicKey,
//   web3.LAMPORTS_PER_SOL,
// );

// await connection.confirmTransaction({ signature: airdropSignature });

// copied from solana documentation but should go inside app.get() for the specific functions when making calls below

// let allocateTransaction = new web3.Transaction({
//   feePayer: payer.publicKey,
// });
// let keys = [{ pubkey: keypair.publicKey, isSigner: true, isWritable: true }];
// let params = { space: 100 };

// let allocateStruct = {
//   index: 8,
//   layout: struct([u32("instruction"), ns64("space")]),
// };

// let data = Buffer.alloc(allocateStruct.layout.span);
// let layoutFields = Object.assign({ instruction: allocateStruct.index }, params);
// allocateStruct.layout.encode(layoutFields, data);


// sample get request 
// /add_Score_SOAR \\

app.get('/', async(req, res) => {
    try {
        // const id = req.params.player_address;
        // call the contract
    res.send("Here is your unity WebGL application");

    } catch {
        res.status(500).send(error.message);
    }
})


// /add_Score_SOAR \\

// app.get('/add_score_soar/:player_address', async(req, res) => {
//     try {
//         // const id = req.params.player_address;
//         // call the contract
//     } catch {
//         res.status(500).send(error.message);
//     }
// })

// /mint_CNFT
// app.get('/mint_cnft:player_address', async(req, res) => {
//     try {
//         // const id = req.params.player_address;
//         // call the contract
//     } catch {
//         res.status(500).send(error.message);
//     }
// })

// /update_CNFT
// app.get('/update_cnft:player_address', async(req, res) => {
//     try {
//         // const id = req.params.player_address;
//         // call the contract
//     } catch {
//         res.status(500).send(error.message);
//     }
// })

// /mint_CNFT_Checked (to check if ingredients exist, and burn them if present)
// app.get('/check_ingredients_cnft:player_address/#/?ingredient1=value&ingredient2=value&ingredient3=value', async(req, res) => {
//     try {
//         // const id = req.params.player_address;
//         // call the contract
//     } catch {
//         res.status(500).send(error.message);
//     }
// })

// /mint_cNFT_potion
// app.get('/mint_potion_cnft:player_address', async(req, res) => {
//     try {
//         // const id = req.params.player_address;
//         // call the contract
//     } catch {
//         res.status(500).send(error.message);
//     }
// })

const port = 3000;
app.listen(port, () => {
    console.log("API server is listening on port 3000")
})