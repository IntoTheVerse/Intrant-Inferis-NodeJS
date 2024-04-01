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

/* -------------------------------------------------------------------------- */
/*                                Warrior Code                               */
/* -------------------------------------------------------------------------- */

/* ------------------------------ mint warrior ------------------------------ */


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

/* ------------------------------ search warrior by NFTID ------------------------------ */

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
              authorization: `Bearer ${underdogKey}`
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


/* ------------------------------ update warrior upon administering powerups inside the game ------------------------------ */


/* ------------------------------ search if warrior NFTs exist using collection address ------------------------------ */

// pid = 40
app.get('/warriors/:pId&:playerAddress', async(req, res) => {
    try {
        const pid = req.params.pId;
        const pAddress = req.params.playerAddress
        // const pId = req.params.ProjectId;
        const searchWarriorNftOptions = {
            method: 'GET',
            // url: `https://devnet.underdogprotocol.com/v2/projects/${pId}/nfts/${nftid}`,
            url: `https://devnet.underdogprotocol.com/v2/projects/${pid}/nfts/search?page=1&limit=100&search=${pAddress}`,
            
            // url: `https://devnet.underdogprotocol.com/v2/projects/${pid}/nfts/search?page=1&limit=100`,
            headers: {
              accept: 'application/json',
              authorization: `Bearer ${underdogKey}`
            }
        };
          
        axios.request(searchWarriorNftOptions).then(function (response) {
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
/* -------------------------------------------------------------------------- */
/*                                End of Warrior Code                               */
/* -------------------------------------------------------------------------- */









/* -------------------------------------------------------------------------- */
/*                                Artifacts Code                               */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                                Theracode                               */
/* -------------------------------------------------------------------------- */

// {
//     "warrior_name" : "Theracode",
//     "warrior_symbol" : "THERACODE",
//     "warrior_description" : "Floating Theracode that reveals binary numbers.",
//     "warrior_image" : "https://i.postimg.cc/YCgY7ZB8/theracode.png",
//     "color": "blue",
//     "warrior_receiver": "Ggg31TYu5hzH8x7x47W4ZXLqnEPSSqV1nF4YbJAfJyNi" 
// }

/* ------------------------------ mint theracode during collection from the game ------------------------------ */

app.post('/theracode', async(req, res) => {
    try {
        const { theracode_receiver } = req.body;
        const theracodedata = {
            name : "Theracode",
            symbol: "THERACODE",
            description: "Floating Theracode that reveals binary numbers.",
            image : "https://i.postimg.cc/YCgY7ZB8/theracode.png",
            attributes: {color: 'blue'},
            receiver: {address: theracode_receiver},
            delegated: true
        }

        let theracodeAccountInfo = null;

        while (!theracodeAccountInfo) {
            theracodeAccountInfo = await connection.getAccountInfo(
              new web3.PublicKey("2zxjm5qZHx9RyubAqSyfoidLW1sReyEktbnRWd9YtGwu")
            );
            await new Promise( resolve => setTimeout(resolve, 100));
        }

        const createTheracodeResponse = await axios.post(
            `${underdogApiEndpoint}/v2/projects/41/nfts`,
            theracodedata,
            config
        );
        
        let retrieveTheracode;
        do {
            retrieveTheracode = await axios.get(
                `${underdogApiEndpoint}/v2/projects/41/nfts/${createTheracodeResponse.data.nftId}`,
                config
            );
            await new Promise( resolve => setTimeout(resolve, 100));
        } while(retrieveTheracode.data.status !== 'confirmed');
        console.log(`NFT ID: ${createTheracodeResponse.data.nftId}`);
        console.log(`Mint Address: ${retrieveTheracode.data.mintAddress}`);
        console.log(`Name: ${retrieveTheracode.data.name}`);
        console.log(`Symbol: ${retrieveTheracode.data.symbol}`);
        console.log(`Image: ${retrieveTheracode.data.image}`);
        console.log(`Description: ${retrieveTheracode.data.description}`);
        console.log(`Attributes: color -> ${retrieveTheracode.data.attributes.color}`);
        console.log(`Owner: ${retrieveTheracode.data.ownerAddress}`);
        console.log(`NFT Data: ${JSON.stringify(retrieveTheracode.data)}`);


        // signatures
        const signatures = await connection.getSignaturesForAddress(new web3.PublicKey("2zxjm5qZHx9RyubAqSyfoidLW1sReyEktbnRWd9YtGwu"), {
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

        let theracodeData = {
            "theracodeData" : `${(JSON.stringify(retrieveTheracode.data))}`,
            "nftId" : `${createTheracodeResponse.data.nftId}`,
        }

        res.json(theracodeData);
        // res.json("mint address: " + retrieveNFT.data.mintAddress);
    } 
    
    catch {
        res.status(500).send(error.message);
    }
})

/* ------------------------------ search if Theracode NFTs exist using collection address ------------------------------ */
// pid = 41
app.get('/theracodes/:pId&:playerAddress', async(req, res) => {
    try {
        const pid = req.params.pId;
        const pAddress = req.params.playerAddress
        // const pId = req.params.ProjectId;
        const searchTheracodeNftOptions = {
            method: 'GET',
            // url: `https://devnet.underdogprotocol.com/v2/projects/${pId}/nfts/${nftid}`,
            url: `https://devnet.underdogprotocol.com/v2/projects/${pid}/nfts/search?page=1&limit=100&search=${pAddress}`,
            
            // url: `https://devnet.underdogprotocol.com/v2/projects/${pid}/nfts/search?page=1&limit=100`,
            headers: {
              accept: 'application/json',
              authorization: `Bearer ${underdogKey}`
            }
        };
          
        axios.request(searchTheracodeNftOptions).then(function (response) {
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



/* ------------------------------ burn Theracode NFT from collection upon use to make potions or powerups ------------------------------ */

/* -------------------------------------------------------------------------- */
/*                                End of Theracode                               */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/*                                AsimanaBox                              */
/* -------------------------------------------------------------------------- */

// {
//     "warrior_name" : "Asimana Box",
//     "warrior_symbol" : "ASIMANA",
//     "warrior_description" : "Glowing mini Asimana Boxes hide the artifacts. ",
//     "warrior_image" : "https://i.postimg.cc/pVqCrpc7/asimana.png",
//     "color": "yellow",
//     "warrior_receiver": "Ggg31TYu5hzH8x7x47W4ZXLqnEPSSqV1nF4YbJAfJyNi" 
// }

/* ------------------------------ mint asimana box during collection from the game ------------------------------ */
app.post('/asimanabox', async(req, res) => {
    try {
        const { asimanabox_receiver } = req.body;
        const asimanaboxdata = {
            name : "Asimana Box",
            symbol: "ASIMANA",
            description: "Glowing mini Asimana Boxes hide the artifacts. ",
            image : "https://i.postimg.cc/pVqCrpc7/asimana.png",
            attributes: {color: 'yellow'},
            receiver: {address: asimanabox_receiver},
            delegated: true
        }

        let asimanaboxAccountInfo = null;

        while (!asimanaboxAccountInfo) {
            asimanaboxAccountInfo = await connection.getAccountInfo(
              new web3.PublicKey("3kBNqm4TTgpxJmGhhBQzgMDWVtEkDo4hKQHEzB5cZgk3")
            );
            await new Promise( resolve => setTimeout(resolve, 100));
        }

        const createAsimanaBoxResponse = await axios.post(
            `${underdogApiEndpoint}/v2/projects/42/nfts`,
            asimanaboxdata,
            config
        );
        
        let retrieveAsimanaBox;
        do {
            retrieveAsimanaBox = await axios.get(
                `${underdogApiEndpoint}/v2/projects/42/nfts/${createAsimanaBoxResponse.data.nftId}`,
                config
            );
            await new Promise( resolve => setTimeout(resolve, 100));
        } while(retrieveAsimanaBox.data.status !== 'confirmed');
        console.log(`NFT ID: ${createAsimanaBoxResponse.data.nftId}`);
        console.log(`Mint Address: ${retrieveAsimanaBox.data.mintAddress}`);
        console.log(`Name: ${retrieveAsimanaBox.data.name}`);
        console.log(`Symbol: ${retrieveAsimanaBox.data.symbol}`);
        console.log(`Image: ${retrieveAsimanaBox.data.image}`);
        console.log(`Description: ${retrieveAsimanaBox.data.description}`);
        console.log(`Attributes: color -> ${retrieveAsimanaBox.data.attributes.color}`);
        console.log(`Owner: ${retrieveAsimanaBox.data.ownerAddress}`);
        console.log(`NFT Data: ${JSON.stringify(retrieveAsimanaBox.data)}`);


        // signatures
        const signatures = await connection.getSignaturesForAddress(new web3.PublicKey("3kBNqm4TTgpxJmGhhBQzgMDWVtEkDo4hKQHEzB5cZgk3"), {
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

        let asimanaboxData = {
            "asimanaboxData" : `${(JSON.stringify(retrieveAsimanaBox.data))}`,
            "nftId" : `${createAsimanaBoxResponse.data.nftId}`,
        }

        res.json(asimanaboxData);
        // res.json("mint address: " + retrieveNFT.data.mintAddress);
    } 
    
    catch {
        res.status(500).send(error.message);
    }
})

/* ------------------------------ search if asimana box NFTs exist using collection address ------------------------------ */
// pid = 42
app.get('/asimanaboxes/:pId&:playerAddress', async(req, res) => {
    try {
        const pid = req.params.pId;
        const pAddress = req.params.playerAddress
        // const pId = req.params.ProjectId;
        const searchAsimanaBoxNftOptions = {
            method: 'GET',
            // url: `https://devnet.underdogprotocol.com/v2/projects/${pId}/nfts/${nftid}`,
            url: `https://devnet.underdogprotocol.com/v2/projects/${pid}/nfts/search?page=1&limit=100&search=${pAddress}`,
            
            // url: `https://devnet.underdogprotocol.com/v2/projects/${pid}/nfts/search?page=1&limit=100`,
            headers: {
              accept: 'application/json',
              authorization: `Bearer ${underdogKey}`
            }
        };
          
        axios.request(searchAsimanaBoxNftOptions).then(function (response) {
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








/* -------------------------------------------------------------------------- */
/*                                Magical Scroll                              */
/* -------------------------------------------------------------------------- */

// {
//     "warrior_name" : "Magical Scroll",
//     "warrior_symbol" : "SCROLL",
//     "warrior_description" : "A partially open magical scroll that contains ancient writing and binary circles and symbols.",
//     "warrior_image" : "https://i.postimg.cc/tTfzGtQW/Union.png",
//     "color": "white",
//     "warrior_receiver": "Ggg31TYu5hzH8x7x47W4ZXLqnEPSSqV1nF4YbJAfJyNi" 
// }

/* ------------------------------ mint magical scroll during collection from the game ------------------------------ */

app.post('/scroll', async(req, res) => {
    try {
        const { scroll_receiver } = req.body;
        const scrolldata = {
            name : "Magical Scroll",
            symbol: "SCROLL",
            description: "A partially open magical scroll that contains ancient writing and binary circles and symbols.",
            image : "https://i.postimg.cc/tTfzGtQW/Union.png",
            attributes: {color: 'white'},
            receiver: {address: scroll_receiver},
            delegated: true
        }

        let scrollAccountInfo = null;

        while (!scrollAccountInfo) {
            scrollAccountInfo = await connection.getAccountInfo(
              new web3.PublicKey("87JYTfmZS5FYwLZ8q7mdSd5TCUmZMuNZDvqSvrjcadob")
            );
            await new Promise( resolve => setTimeout(resolve, 100));
        }

        const createScrollResponse = await axios.post(
            `${underdogApiEndpoint}/v2/projects/44/nfts`,
            scrolldata,
            config
        );
        
        let retrieveScroll;
        do {
            retrieveScroll = await axios.get(
                `${underdogApiEndpoint}/v2/projects/44/nfts/${createScrollResponse.data.nftId}`,
                config
            );
            await new Promise( resolve => setTimeout(resolve, 100));
        } while(retrieveScroll.data.status !== 'confirmed');
        console.log(`NFT ID: ${createScrollResponse.data.nftId}`);
        console.log(`Mint Address: ${retrieveScroll.data.mintAddress}`);
        console.log(`Name: ${retrieveScroll.data.name}`);
        console.log(`Symbol: ${retrieveScroll.data.symbol}`);
        console.log(`Image: ${retrieveScroll.data.image}`);
        console.log(`Description: ${retrieveScroll.data.description}`);
        console.log(`Attributes: color -> ${retrieveScroll.data.attributes.color}`);
        console.log(`Owner: ${retrieveScroll.data.ownerAddress}`);
        console.log(`NFT Data: ${JSON.stringify(retrieveScroll.data)}`);


        // signatures
        const signatures = await connection.getSignaturesForAddress(new web3.PublicKey("87JYTfmZS5FYwLZ8q7mdSd5TCUmZMuNZDvqSvrjcadob"), {
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

        let scrollData = {
            "scrollData" : `${(JSON.stringify(retrieveScroll.data))}`,
            "nftId" : `${createScrollResponse.data.nftId}`,
        }

        res.json(scrollData);
        // res.json("mint address: " + retrieveNFT.data.mintAddress);
    } 
    
    catch {
        res.status(500).send(error.message);
    }
})

/* ------------------------------ search if Magical Scroll NFTs exist using collection address ------------------------------ */
// pid = 44
app.get('/scrolls/:pId&:playerAddress', async(req, res) => {
    try {
        const pid = req.params.pId;
        const pAddress = req.params.playerAddress
        // const pId = req.params.ProjectId;
        const searchScrollNftOptions = {
            method: 'GET',
            // url: `https://devnet.underdogprotocol.com/v2/projects/${pId}/nfts/${nftid}`,
            url: `https://devnet.underdogprotocol.com/v2/projects/${pid}/nfts/search?page=1&limit=100&search=${pAddress}`,
            
            // url: `https://devnet.underdogprotocol.com/v2/projects/${pid}/nfts/search?page=1&limit=100`,
            headers: {
              accept: 'application/json',
              authorization: `Bearer ${underdogKey}`
            }
        };
          
        axios.request(searchScrollNftOptions).then(function (response) {
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







/* -------------------------------------------------------------------------- */
/*                                End of Artifacts Code                               */
/* -------------------------------------------------------------------------- */









/* -------------------------------------------------------------------------- */
/*                                Potions' Code                               */
/* -------------------------------------------------------------------------- */
// {
//     "warrior_name" : "Fixer Elixir",
//     "warrior_symbol" : "ELIXIR",
//     "warrior_description" : "The Fixer Elixir gives a warrior an instant return to stamina/full health.",
//     "warrior_image" : "https://i.postimg.cc/6qsC1bw4/revival.png",
//     "color": "purple",
//     "warrior_receiver": "Ggg31TYu5hzH8x7x47W4ZXLqnEPSSqV1nF4YbJAfJyNi" 
// }
/* ------------------------------ mint potion after burning a artifact ------------------------------ */

app.post('/fixerelixir', async(req, res) => {
    try {
        const { elixir_receiver } = req.body;
        const elixirdata = {
            name : "Fixer Elixir",
            symbol: "ELIXIR",
            description: "The Fixer Elixir gives a warrior an instant return to stamina/full health.",
            image : "https://i.postimg.cc/6qsC1bw4/revival.png",
            attributes: {color: 'purple'},
            receiver: {address: elixir_receiver},
            delegated: true
        }

        let elixirAccountInfo = null;

        while (!elixirAccountInfo) {
            elixirAccountInfo = await connection.getAccountInfo(
              new web3.PublicKey("EaFpGsrrA9SY9sQmaKvU2tteUbMLdrADAscXwtUh9zZs")
            );
            await new Promise( resolve => setTimeout(resolve, 100));
        }

        const createElixirResponse = await axios.post(
            `${underdogApiEndpoint}/v2/projects/43/nfts`,
            elixirdata,
            config
        );
        
        let retrieveElixir;
        do {
            retrieveElixir = await axios.get(
                `${underdogApiEndpoint}/v2/projects/43/nfts/${createElixirResponse.data.nftId}`,
                config
            );
            await new Promise( resolve => setTimeout(resolve, 100));
        } while(retrieveElixir.data.status !== 'confirmed');
        console.log(`NFT ID: ${createElixirResponse.data.nftId}`);
        console.log(`Mint Address: ${retrieveElixir.data.mintAddress}`);
        console.log(`Name: ${retrieveElixir.data.name}`);
        console.log(`Symbol: ${retrieveElixir.data.symbol}`);
        console.log(`Image: ${retrieveElixir.data.image}`);
        console.log(`Description: ${retrieveElixir.data.description}`);
        console.log(`Attributes: color -> ${retrieveElixir.data.attributes.color}`);
        console.log(`Owner: ${retrieveElixir.data.ownerAddress}`);
        console.log(`NFT Data: ${JSON.stringify(retrieveElixir.data)}`);


        // signatures
        const signatures = await connection.getSignaturesForAddress(new web3.PublicKey("EaFpGsrrA9SY9sQmaKvU2tteUbMLdrADAscXwtUh9zZs"), {
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

        let elixirData = {
            "elixirData" : `${(JSON.stringify(retrieveElixir.data))}`,
            "nftId" : `${createElixirResponse.data.nftId}`,
        }

        res.json(elixirData);
        // res.json("mint address: " + retrieveNFT.data.mintAddress);
    } 
    
    catch {
        res.status(500).send(error.message);
    }
})


/* ------------------------------ search if potions NFTs exist using collection address ------------------------------ */
// pid = 43

app.get('/fixerelixirs/:pId&:playerAddress', async(req, res) => {
    try {
        const pid = req.params.pId;
        const pAddress = req.params.playerAddress
        // const pId = req.params.ProjectId;
        const searchElixirOptions = {
            method: 'GET',
            // url: `https://devnet.underdogprotocol.com/v2/projects/${pId}/nfts/${nftid}`,
            url: `https://devnet.underdogprotocol.com/v2/projects/${pid}/nfts/search?page=1&limit=100&search=${pAddress}`,
            
            // url: `https://devnet.underdogprotocol.com/v2/projects/${pid}/nfts/search?page=1&limit=100`,
            headers: {
              accept: 'application/json',
              authorization: `Bearer ${underdogKey}`
            }
        };
          
        axios.request(searchElixirOptions).then(function (response) {
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

/* ------------------------------ burn potion NFT from collection upon use of potion inside the game ------------------------------ */

/* -------------------------------------------------------------------------- */
/*                                End of Potions Code                               */
/* -------------------------------------------------------------------------- */









/* -------------------------------------------------------------------------- */
/*                                Powerups' Code                               */
/* -------------------------------------------------------------------------- */

/* ------------------------------ mint potion after burning a artifact ------------------------------ */

/* ------------------------------ search if potions NFTs exist using collection address ------------------------------ */

/* ------------------------------ burn powerup NFT from collection upon use of powerup inside the game ------------------------------ */

/* -------------------------------------------------------------------------- */
/*                                End of Powerups Code                        */
/* -------------------------------------------------------------------------- */











/* -------------------------------------------------------------------------- */
/*                                 Checkpoints                               */
/* -------------------------------------------------------------------------- */
/* ------------------------------ mint potion after burning a artifact ------------------------------ */

/* ------------------------------ search if checkpoint NFTs exist using collection addres order by latest minted ------------------------------ */

/* -------------------------------------------------------------------------- */
/*                                End of Checkpoints Code                     */
/* -------------------------------------------------------------------------- */



app.listen(port, () => {
    console.log("API server is listening on port 3000")
})