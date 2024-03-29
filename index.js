// express + node
const express = require('express');
const app = express();
const port = 3000;
const axios = require('axios');
// app.use(express.json());

// solana
const { struct, u32, ns64 } = require("@solana/buffer-layout");
const { Buffer } = require("buffer");
const web3 = require("@solana/web3.js");
require('dotenv').config();
const apiKey = process.env.apikey;
const underdogKey = process.env.underdogkey
// underdog API endpoint 
const underdogApiEndpoint = "https://dev.underdogprotocol.com";
const heliusUrl = `https://devnet.helius-rpc.com/?api-key=${apiKey}`
const connection = new web3.Connection(heliusUrl);

const config = {
    headers: {
        Authorization: `Bearer ${underdogKey}`
    }
}

const projectData = {
    "name" : "Intrant Inferis Warriors",
    "symbol" : "INFERIS",
    "image" : "https://ibb.co/sVFg2JC"
}

const nftData = {
    "name" : "Tennon",
    "symbol": "INFERIS",
    "image" : "https://ibb.co/KXWGMPc"
}

// sample get request 
// /mint_nft \\

// app.post('/', async(req, res) => {
    // try {
        // const id = req.params.player_address;
        // call the contract
    async function mintNft()
    {
        let projectAccountInfo = null;

        while (!projectAccountInfo) {
            projectAccountInfo = await connection.getAccountInfo(
              new web3.PublicKey("DSwGuRGnVHjUDiTY2grMo5wyDvizrFV6rcUTCsy4KKBQ")
            );
            await new Promise( resolve => setTimeout(resolve, 100));
        }

        const createNftResponse = await axios.post(
            `${underdogApiEndpoint}/v2/projects/${1}/nfts`,
            nftData,
            config
        );
        
        let retrieveNFT;
        do {
            retrieveNFT = await axios.get(
                `${underdogApiEndpoint}/v2/projects/${1}/nfts/${createNftResponse.data.nftId}`,
                config
            );
            await new Promise( resolve => setTimeout(resolve, 100));
        } while(retrieveNFT.data.status !== 'confirmed');

        console.log(`Mint Address: ${retrieveNFT.data.mintAddress}`);
        console.log(`Name: ${retrieveNFT.data.name}`);
        console.log(`Image: ${retrieveNFT.data.image}`);

        const signatures = await connection.getSignaturesForAddress(new web3.PublicKey(createProjectResponse.data.mintAddress), {
            commitment: 'confirmed'
        });

        const transactionDetails = await connection.getParsedTransaction(
            signatures[0].signature,
            {
                commitment: "confirmed",
                encoding: "jsonParsed",
                maxSupportedTransactionVersion: 0,

            }
        )

        console.log(transactionDetails);
    }

    mintNft();



        // res.send("Here is your unity WebGL application");
    // console.log(heliusUrl);

    // } catch {
    //     res.status(500).send(error.message);
    // }
// }
// )
// access to keypair 
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


// app.listen(port, () => {
//     console.log("API server is listening on port 3000")
// })