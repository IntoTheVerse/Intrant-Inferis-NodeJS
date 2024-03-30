// express + node
const express = require('express');
const app = express();
const port = 3000;
const axios = require('axios');
app.use(express.json());

// solana
// const { struct, u32, ns64 } = require("@solana/buffer-layout");
// const { Buffer } = require("buffer");
const web3 = require("@solana/web3.js");
require('dotenv').config();
const apiKey = process.env.apikey;
const underdogKey = process.env.underdogkey
// underdog API endpoint 
const underdogApiEndpoint = "https://devnet.underdogprotocol.com";
const heliusUrl = `https://devnet.helius-rpc.com/?api-key=${apiKey}`
const connection = new web3.Connection(heliusUrl);

const config = {
    headers: {
        Authorization: `Bearer ${underdogKey}`
    }
}


// sample post request 
// create warrior nft

// const nftData = {
//     name : "Tennon",
//     symbol: "INFERIS",
//     description: 'The mighty Tennon',
//     image : "https://i.postimg.cc/hvHD4Z9c/ITVStrykur-MWarrior.png",
//     attributes: {HP: '150', STM: '150'},
//     receiver: {address: 'Ggg31TYu5hzH8x7x47W4ZXLqnEPSSqV1nF4YbJAfJyNi'},
//     delegated: true
// }

// {
//     "warrior_name" : "Tennon",
//     "warrior_symbol" : "INFERIS",
//     "warrior_description" : "The mighty Tennon",
//     "warrior_image" : "https://i.postimg.cc/hvHD4Z9c/ITVStrykur-MWarrior.png",
//     "warrior_HP": "150",
//     "warrior_STM": "150",
//     "warrior_receiver": "Ggg31TYu5hzH8x7x47W4ZXLqnEPSSqV1nF4YbJAfJyNi" 
// }

app.post('/warrior', async(req, res) => {
    try {
        const { warrior_name, warrior_symbol, warrior_description, warrior_image, warrior_HP, warrior_STM, warrior_receiver } = req.body;
        const nftData = {
            name : warrior_name,
            symbol: warrior_symbol,
            description: warrior_description,
            image : warrior_image,
            attributes: {HP: warrior_HP, STM: warrior_STM},
            receiver: {address: warrior_receiver},
            delegated: true
        }

        let projectAccountInfo = null;

        while (!projectAccountInfo) {
            projectAccountInfo = await connection.getAccountInfo(
              new web3.PublicKey("8iwfqhjhWnVE7ABb8pAKTKGvF7Q48hm5EvWCT9e1kPRj")
            );
            await new Promise( resolve => setTimeout(resolve, 100));
        }

        const createNftResponse = await axios.post(
            `${underdogApiEndpoint}/v2/projects/40/nfts`,
            nftData,
            config
        );
        
        let retrieveNFT;
        do {
            retrieveNFT = await axios.get(
                `${underdogApiEndpoint}/v2/projects/40/nfts/${createNftResponse.data.nftId}`,
                config
            );
            await new Promise( resolve => setTimeout(resolve, 100));
        } while(retrieveNFT.data.status !== 'confirmed');
        console.log(`NFT ID: ${createNftResponse.data.nftId}`);
        console.log(`Mint Address: ${retrieveNFT.data.mintAddress}`);
        console.log(`Name: ${retrieveNFT.data.name}`);
        console.log(`Symbol: ${retrieveNFT.data.symbol}`);
        console.log(`Image: ${retrieveNFT.data.image}`);
        console.log(`Description: ${retrieveNFT.data.description}`);
        console.log(`Attributes: HP -> ${retrieveNFT.data.attributes.HP} STM -> ${retrieveNFT.data.attributes.STM}`);
        console.log(`Owner: ${retrieveNFT.data.ownerAddress}`);
        console.log(`NFT Data: ${JSON.stringify(retrieveNFT.data)}`);


        // signatures
        const signatures = await connection.getSignaturesForAddress(new web3.PublicKey("8iwfqhjhWnVE7ABb8pAKTKGvF7Q48hm5EvWCT9e1kPRj"), {
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

        let warriorData = {
            "nftData" : `${(JSON.stringify(retrieveNFT.data))}`,
            "nftId" : `${createNftResponse.data.nftId}`,
        }

        res.json(warriorData);
        // res.json("mint address: " + retrieveNFT.data.mintAddress);
    } 
    
    catch {
        res.status(500).send(error.message);
    }
}
)

    
    const nftData = {
        name : "Tennon",
        symbol: "INFERIS",
        description: 'The mighty Tennon',
        image : "https://i.postimg.cc/hvHD4Z9c/ITVStrykur-MWarrior.png",
        attributes: {HP: '150', STM: '150'},
        receiver: {address: 'Ggg31TYu5hzH8x7x47W4ZXLqnEPSSqV1nF4YbJAfJyNi'},
        delegated: true
    }

    async function mintNft()
    {
        let projectAccountInfo = null;

        while (!projectAccountInfo) {
            projectAccountInfo = await connection.getAccountInfo(
              new web3.PublicKey("DB9rcNFTfysiu8xJmjZuTfMyRyDjBU2dqesSEnKvYfmp")
            );
            await new Promise( resolve => setTimeout(resolve, 100));
        }

        const createNftResponse = await axios.post(
            `${underdogApiEndpoint}/v2/projects/5/nfts`,
            nftData,
            config
        );
        
        let retrieveNFT;
        do {
            retrieveNFT = await axios.get(
                `${underdogApiEndpoint}/v2/projects/5/nfts/${createNftResponse.data.nftId}`,
                config
            );
            await new Promise( resolve => setTimeout(resolve, 100));
        } while(retrieveNFT.data.status !== 'confirmed');
        console.log(`NFT ID: ${createNftResponse.data.nftId}`);
        console.log(`Mint Address: ${retrieveNFT.data.mintAddress}`);
        console.log(`Name: ${retrieveNFT.data.name}`);
        console.log(`Symbol: ${retrieveNFT.data.symbol}`);
        console.log(`Image: ${retrieveNFT.data.image}`);
        console.log(`Description: ${retrieveNFT.data.description}`);
        console.log(`Attributes: HP -> ${retrieveNFT.data.attributes.HP} STM -> ${retrieveNFT.data.attributes.STM}`);
        console.log(`Owner: ${retrieveNFT.data.ownerAddress}`);
        console.log(`Data response: ${JSON.stringify(retrieveNFT.data)}`);


        // signatures
        const signatures = await connection.getSignaturesForAddress(new web3.PublicKey("DB9rcNFTfysiu8xJmjZuTfMyRyDjBU2dqesSEnKvYfmp"), {
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

        // console.log("Transaction details: " + JSON.stringify(transactionDetails));
    }

    // mintNft();






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


app.listen(port, () => {
    console.log("API server is listening on port 3000")
})