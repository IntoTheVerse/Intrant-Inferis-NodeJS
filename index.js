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
        const { warrior_receiver } = req.body;
        const nftData = {
            name : "Tennon",
            symbol: "INFERIS",
            description: "The mighty Tennon",
            image : "https://i.postimg.cc/hvHD4Z9c/ITVStrykur-MWarrior.png",
            attributes: {HP: '150', STM: '150'},
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
})

// search warrior by NFTid
// app.get('/warrior:ProjectId&:NftId', async(req, res) => {
app.get('/warrior/:NftId', async(req, res) => {
    try {
        const nftid = req.params.NftId;
        // const pId = req.params.ProjectId;
        const getNftOptions = {
            method: 'GET',
            // url: `https://devnet.underdogprotocol.com/v2/projects/${pId}/nfts/${nftid}`,
            url: `https://devnet.underdogprotocol.com/v2/projects/40/nfts/${nftid}`,
            headers: {
              accept: 'application/json',
              authorization: 'Bearer 773b678a8e8939.581e4f5f384a4316a78b99148bdab575'
            }
        };
          
        axios.request(getNftOptions).then(function (response) {
              console.log(response.data);
              res.json(response.data);
        }).catch(function (error) {
            console.error(error);
        });
        

    }
    catch {
        res.status(500).send(error.message);
    }
})




app.listen(port, () => {
    console.log("API server is listening on port 3000")
})