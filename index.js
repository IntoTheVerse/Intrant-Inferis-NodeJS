// express + node
const express = require('express');
const app = express();
const port = 3000;
const axios = require('axios');
app.use(express.json());

// solana
const web3 = require("@solana/web3.js");
const BN = require("bn.js");
require('dotenv').config();
const apiKey = process.env.apikey;
const underdogKey = process.env.underdogkey;

// underdog API endpoint 
const underdogApiEndpoint = "https://devnet.underdogprotocol.com";
const heliusUrl = `https://devnet.helius-rpc.com/?api-key=${apiKey}`;
const connection = new web3.Connection(heliusUrl);

const config = {
    headers: {
        Authorization: `Bearer ${underdogKey}`
    }
}

const AllBuyableWarriors = [
    {
      name: "Tennon",
      description: "The mighty Tennon",
      image: "https://i.postimg.cc/hvHD4Z9c/ITVStrykur-MWarrior.png",
      attributes: { HP: "150", STM: "150", LVL: "1", GLD: "Strykur" },
      inferis: 20,
      characterId : 0
    },
  ];

const AllBuyablePotions = [
  {
    name: "Fixer Elixir",
    description:
      "The Fixer Elixir gives a warrior an instant return to stamina/full health",
    image: "https://i.postimg.cc/6qsC1bw4/revival.png",
    attributes: { color: "Blue" },
    potionId: 0,
    inferis: 20,
    required: [
      {
        item: 41,
        value: 2,
      },
      {
        item: 42,
        value: 2,
      },
      {
        item: 44,
        value: 2,
      },
    ],
  },
  {
    name: "Quarter Revival Elixir",
    description:
      "The Fixer Elixir gives a warrior an instant return to quarter stamina/health",
    image: "https://i.postimg.cc/nrjc6N1B/green.png",
    attributes: { color: "Green" },
    potionId: 1,
    inferis: 10,
    required: [
      {
        item: 41,
        value: 1,
      },
      {
        item: 42,
        value: 1,
      },
      {
        item: 44,
        value: 1,
      },
    ],
  },
  {
    name: "Half Revival Elixir",
    description:
      "The Fixer Elixir gives a warrior an instant return to half stamina/health",
    image: "https://i.postimg.cc/R0pWy1Br/red.png",
    attributes: { color: "Red" },
    potionId: 2,
    inferis: 15,
    required: [
      {
        item: 41,
        value: 1,
      },
      {
        item: 42,
        value: 2,
      },
      {
        item: 44,
        value: 1,
      },
    ],
  },
];

const AllBuyablePowerups = [
  {
    name: "Plus 15 Powerup",
    description:
      "Boost player's STM and HP by +15 units causing an upgrade",
    image: "https://i.postimg.cc/Hk6D9bhf/powerup.png",
    attributes: { color: "Cyan", stm: "+15", hp: "+15"},
    powerupId: 0,
    inferis: 50,
    required: [
      {
        item: 41,
        value: 3,
      },
      {
        item: 42,
        value: 3,
      },
      {
        item: 44,
        value: 3,
      },
    ],
  },
  {
    name: "Plus 20 Powerup",
    description: "Boost player's STM and HP by +20 units causing an upgrade",
    image: "https://i.postimg.cc/X7DtZnBb/20stm.png",
    attributes: { color: "Pink", stm: "+20", hp: "+20"},
    powerupId: 1,
    inferis: 60,
    required: [
      {
        item: 41,
        value: 4,
      },
      {
        item: 42,
        value: 4,
      },
      {
        item: 44,
        value: 4,
      },
    ],
  },
]

/* -------------------------------------------------------------------------- */
/*                                Helper Code                                 */
/* -------------------------------------------------------------------------- */

/* ------------------------------ Burn NFT ------------------------------ */

async function burnAsset(assetcollectionId, assetId) {
    const options = {
        method: 'POST',
        url: `https://devnet.underdogprotocol.com/v2/projects/${assetcollectionId}/nfts/${assetId}/burn`,
        headers: {
          accept: 'application/json',
          authorization: `Bearer ${underdogKey}`
        }
    };
      
      axios
        .request(options)
        .then(function (response) {
          console.log(response.data);
        })
        .catch(function (error) {
          console.error(error);
        });
}

/* -------------------------------------------------------------------------- */
/*                                End of Helper Code                          */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/*                                Search Code                               */
/* -------------------------------------------------------------------------- */

/* ------------------------------ Search By NFTId ------------------------------ */

app.get("/searchByNFTId/:pId&:NftId", async (req, res) => {
  try {
    const nftId = req.params.NftId;
    const pId = req.params.pId;
    const getNftOptions = {
      method: "GET",
      url: `https://devnet.underdogprotocol.com/v2/projects/${pId}/nfts/${nftId}`,
      headers: {
        accept: "application/json",
        authorization: `Bearer ${underdogKey}`,
      },
    };

    axios
      .request(getNftOptions)
      .then(function (response) {
        console.log(response.data);
        res.json(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  } catch {
    res.status(500).send(error.message);
  }
});

/* ------------------------------ Get Collection By Owner ------------------------------ */

app.get("/getCollectionByOwner/:pId&:playerAddress", async (req, res) => {
  try {
    const pid = req.params.pId;
    const pAddress = req.params.playerAddress;
    const searchWarriorNftOptions = {
      method: "GET",
      url: `https://devnet.underdogprotocol.com/v2/projects/${pid}/nfts/search?page=1&limit=100&search=${pAddress}`,
      headers: {
        accept: "application/json",
        authorization: `Bearer ${underdogKey}`,
      },
    };

    axios
      .request(searchWarriorNftOptions)
      .then(function (response) {
        console.log(response.data);
        res.json(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  } catch {
    res.status(500).send(error.message);
  }
});

/* -------------------------------------------------------------------------- */
/*                                End of Search Code                         */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/*                                Get All Default Code                        */
/* -------------------------------------------------------------------------- */

app.get("/getAllBuyableWarriors", async (req, res) => { 
    try {
        res.json(AllBuyableWarriors);
    } catch {
      res.status(500).send(error.message);
    }
});

app.get("/getAllBuyablePotions", async (req, res) => {
  try {
    res.json(AllBuyablePotions);
  } catch {
    res.status(500).send(error.message);
  }
});

app.get("/getAllBuyablePowerups", async (req, res) => {
  try {
    res.json(AllBuyablePowerups);
  } catch {
    res.status(500).send(error.message);
  }
});

/* -------------------------------------------------------------------------- */
/*                                End of Get All Default Code                 */
/* -------------------------------------------------------------------------- */



/* -------------------------------------------------------------------------- */
/*                                Warrior Code                                */
/* -------------------------------------------------------------------------- */

/* ------------------------------ Mint Warrior ------------------------------ */


app.post('/warrior', async(req, res) => {
    try {
        const { receiver, id } = req.body;
        const character = AllBuyableWarriors[id];

        const nftData = {
          name: character.name,
          symbol: "INFERIS",
          description: character.description,
          image: character.image,
          attributes: character.attributes,
          receiver: { address: receiver },
          delegated: true,
        };

        let projectAccountInfo = null;

        while (!projectAccountInfo) {
            projectAccountInfo = await connection.getAccountInfo(
              new web3.PublicKey("8iwfqhjhWnVE7ABb8pAKTKGvF7Q48hm5EvWCT9e1kPRj")
            );
            await new Promise( resolve => setTimeout(resolve, 100));
        }

        const createNftResponse = await axios.post(
            `${underdogApiEndpoint}/v2/projects/46/nfts`,
            nftData,
            config
        );
        
        let retrieveNFT;
        do {
            retrieveNFT = await axios.get(
                `${underdogApiEndpoint}/v2/projects/46/nfts/${createNftResponse.data.nftId}`,
                config
            );
            await new Promise( resolve => setTimeout(resolve, 100));
        } while(retrieveNFT.data.status !== 'confirmed');

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
        console.log(warriorData);


        res.json(warriorData);
    } 
    catch (error) {
        res.status(500).send(error.message);
    }
})

/* ------------------------------ update warrior upon administering powerups inside the game ------------------------------ */



/* -------------------------------------------------------------------------- */
/*                                End of Warrior Code                         */
/* -------------------------------------------------------------------------- */






/* -------------------------------------------------------------------------- */
/*                                Artifacts Code                               */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                                Theracode                               */
/* -------------------------------------------------------------------------- */

/* ------------------------------ mint theracode during collection from the game ------------------------------ */

app.post('/theracode', async(req, res) => {
    try {
        const { receiver } = req.body;
        const theracodedata = {
          name: "Theracode",
          symbol: "THERACODE",
          description: "Floating Theracode that reveals binary numbers.",
          image: "https://i.postimg.cc/YCgY7ZB8/theracode.png",
          attributes: { color: "blue" },
          receiver: { address: receiver },
          delegated: true,
        };

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

/* ------------------------------ mint asimana box during collection from the game ------------------------------ */
app.post('/asimanabox', async(req, res) => {
    try {
        const { receiver } = req.body;
        const asimanaboxdata = {
          name: "Asimana Box",
          symbol: "ASIMANA",
          description: "Glowing mini Asimana Boxes hide the artifacts. ",
          image: "https://i.postimg.cc/pVqCrpc7/asimana.png",
          attributes: { color: "yellow" },
          receiver: { address: receiver },
          delegated: true,
        };

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
    } 
    catch {
        res.status(500).send(error.message);
    }
})


/* -------------------------------------------------------------------------- */
/*                                Magical Scroll                              */
/* -------------------------------------------------------------------------- */

/* ------------------------------ mint magical scroll during collection from the game ------------------------------ */

app.post('/scroll', async(req, res) => {
    try {
        const { receiver } = req.body;
        const scrolldata = {
          name: "Magical Scroll",
          symbol: "SCROLL",
          description:
            "A partially open magical scroll that contains ancient writing and binary circles and symbols.",
          image: "https://i.postimg.cc/tTfzGtQW/Union.png",
          attributes: { color: "white" },
          receiver: { address: receiver },
          delegated: true,
        };

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
    } 
    catch {
        res.status(500).send(error.message);
    }
})

/* -------------------------------------------------------------------------- */
/*                                End of Artifacts Code                       */
/* -------------------------------------------------------------------------- */



/* -------------------------------------------------------------------------- */
/*                                Potions' Code                               */
/* -------------------------------------------------------------------------- */

/* ------------------------------ mint potion after burning a artifact ------------------------------ */

app.post('/potion', async(req, res) => {
    try {
        const { receiver, id } = req.body;
        const potion = AllBuyablePotions[id];
        const elixirdata = {
          name: potion.name,
          symbol: "ELIXIR",
          description: potion.description,
          image: potion.image,
          attributes: potion.attributes,
          receiver: { address: receiver },
          delegated: true,
        };

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
    } 
    catch {
        res.status(500).send(error.message);
    }
})

app.post("/burnAndMintPotion", async (req, res) => {
  try {
    const { receiver, id, burnItems } = req.body;
    for (let i = 0; i < burnItems.length; i++) {
      for (let j = 0; j < burnItems[i].nftIds.length; j++) {
        await burnAsset(burnItems[i].projectId, burnItems[i].nftIds[j]);
      }
    }

    const potion = AllBuyablePotions[id];
    const elixirdata = {
      name: potion.name,
      symbol: "ELIXIR",
      description: potion.description,
      image: potion.image,
      attributes: potion.attributes,
      receiver: { address: receiver },
      delegated: true,
    };

    let elixirAccountInfo = null;

    while (!elixirAccountInfo) {
      elixirAccountInfo = await connection.getAccountInfo(
        new web3.PublicKey("EaFpGsrrA9SY9sQmaKvU2tteUbMLdrADAscXwtUh9zZs")
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
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
      await new Promise((resolve) => setTimeout(resolve, 100));
    } while (retrieveElixir.data.status !== "confirmed");

    // signatures
    const signatures = await connection.getSignaturesForAddress(
      new web3.PublicKey("EaFpGsrrA9SY9sQmaKvU2tteUbMLdrADAscXwtUh9zZs"),
      {
        commitment: "confirmed",
      }
    );

    const transactionDetails = await connection.getParsedTransaction(
      signatures[0].signature,
      {
        commitment: "confirmed",
        encoding: "jsonParsed",
        maxSupportedTransactionVersion: 0,
      }
    );

    let elixirData = {
      elixirData: `${JSON.stringify(retrieveElixir.data)}`,
      nftId: `${createElixirResponse.data.nftId}`,
    };

    res.json(elixirData);
  } catch {
    res.status(500).send(error.message);
  }
});

/* ------------------------------ burn potion NFT from collection upon use of potion inside the game ------------------------------ */

app.post('/burnPotion', async(req, res) => {
    try {
        const { id } = req.body;
        await burnAsset(43, id).then(function (response) {
            res.json(response);
          })
          .catch(function (error) {
            console.error(error);
          });

        
    } 
    catch (error) {
        res.status(500).send(error.message);
    }
})



/* -------------------------------------------------------------------------- */
/*                                End of Potions Code                               */
/* -------------------------------------------------------------------------- */



/* -------------------------------------------------------------------------- */
/*                                Powerups' Code                               */
/* -------------------------------------------------------------------------- */

/* ------------------------------ Buy Powerup ------------------------------ */
app.post("/powerup", async (req, res) => {
  try {
    const { receiver, id } = req.body;
    const powerups = AllBuyablePowerups[id];
    const powerUpData = {
      name: powerups.name,
      symbol: "POWER",
      description: powerups.description,
      image: powerups.image,
      attributes: powerups.attributes,
      receiver: { address: receiver },
      delegated: true,
    };

    let powerUpAccountInfo = null;

    while (!powerUpAccountInfo) {
      powerUpAccountInfo = await connection.getAccountInfo(
        new web3.PublicKey("9vX76TVAn9ELJCWFNckF31i5MESukJkpztoEG2AtP6Tk")
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const createPowerUpResponse = await axios.post(
      `${underdogApiEndpoint}/v2/projects/45/nfts`,
      powerUpData,
      config
    );

    let retrievePowerUp;
    do {
      retrievePowerUp = await axios.get(
        `${underdogApiEndpoint}/v2/projects/45/nfts/${createPowerUpResponse.data.nftId}`,
        config
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
    } while (retrievePowerUp.data.status !== "confirmed");

    // signatures
    const signatures = await connection.getSignaturesForAddress(
      new web3.PublicKey("9vX76TVAn9ELJCWFNckF31i5MESukJkpztoEG2AtP6Tk"),
      {
        commitment: "confirmed",
      }
    );

    const transactionDetails = await connection.getParsedTransaction(
      signatures[0].signature,
      {
        commitment: "confirmed",
        encoding: "jsonParsed",
        maxSupportedTransactionVersion: 0,
      }
    );

    let powerupdata = {
      powerupdata: `${JSON.stringify(retrievePowerUp.data)}`,
      nftId: `${createPowerUpResponse.data.nftId}`,
    };

    res.json(powerupdata);
  } catch {
    res.status(500).send(error.message);
  }
});

app.post("/burnAndMintPowerup", async (req, res) => {
  try {
    const { receiver, id, burnItems } = req.body;
    for (let i = 0; i < burnItems.length; i++) {
      for (let j = 0; j < burnItems[i].nftIds.length; j++) {
        await burnAsset(burnItems[i].projectId, burnItems[i].nftIds[j]);
      }
    }
    
    const powerups = AllBuyablePowerups[id];
    const powerUpData = {
      name: powerups.name,
      symbol: "POWER",
      description: powerups.description,
      image: powerups.image,
      attributes: powerups.attributes,
      receiver: { address: receiver },
      delegated: true,
    };

    let powerUpAccountInfo = null;

    while (!powerUpAccountInfo) {
      powerUpAccountInfo = await connection.getAccountInfo(
        new web3.PublicKey("9vX76TVAn9ELJCWFNckF31i5MESukJkpztoEG2AtP6Tk")
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const createPowerUpResponse = await axios.post(
      `${underdogApiEndpoint}/v2/projects/45/nfts`,
      powerUpData,
      config
    );

    let retrievePowerUp;
    do {
      retrievePowerUp = await axios.get(
        `${underdogApiEndpoint}/v2/projects/45/nfts/${createPowerUpResponse.data.nftId}`,
        config
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
    } while (retrievePowerUp.data.status !== "confirmed");

    // signatures
    const signatures = await connection.getSignaturesForAddress(
      new web3.PublicKey("9vX76TVAn9ELJCWFNckF31i5MESukJkpztoEG2AtP6Tk"),
      {
        commitment: "confirmed",
      }
    );

    const transactionDetails = await connection.getParsedTransaction(
      signatures[0].signature,
      {
        commitment: "confirmed",
        encoding: "jsonParsed",
        maxSupportedTransactionVersion: 0,
      }
    );

    let powerupdata = {
      powerupdata: `${JSON.stringify(retrievePowerUp.data)}`,
      nftId: `${createPowerUpResponse.data.nftId}`,
    };

    res.json(powerupdata);
  } catch {
    res.status(500).send(error.message);
  }
});

/* ------------------------------ search if potions NFTs exist using collection address ------------------------------ */

/* ------------------------------ burn powerup NFT from collection upon use of powerup inside the game ------------------------------ */
app.post('/burnPowerup', async(req, res) => {
  try {
      const { id } = req.body;
      await burnAsset(45, id).then(function (response) {
          res.json(response);
        })
        .catch(function (error) {
          console.error(error);
        });

      
  } 
  catch (error) {
      res.status(500).send(error.message);
  }
})

/* -------------------------------------------------------------------------- */
/*                                End of Powerups Code                        */
/* -------------------------------------------------------------------------- */



/* -------------------------------------------------------------------------- */
/*                                 Checkpoints                               */
/* -------------------------------------------------------------------------- */

// {
//     "name" : "Checkpoint 1",
//     "symbol" : "CP",
//     "description" : "You made it to checkpoint 1",
//     "image" : "https://i.postimg.cc/htFsr6gJ/cp1.png",
//     "attributes : { "color": "blue", "lvl": "1" },
//     "receiver": "Ggg31TYu5hzH8x7x47W4ZXLqnEPSSqV1nF4YbJAfJyNi" 
// }

// 5 instances of checkpoints
// cp1  - https://i.postimg.cc/htFsr6gJ/cp1.png 
// cp2 - https://i.postimg.cc/85CmcVdY/cp2.png
// cp3 - https://i.postimg.cc/j5kQJkZS/cp3.png
// cp4 - https://i.postimg.cc/gjXyyqTq/cp4.png
// cp5 - https://i.postimg.cc/J0fNpHww/cp5.png

/* ------------------------------ mint checkpoint ------------------------------ */
app.post('/checkpoint', async(req, res) => {
  try {
      const { receiver } = req.body;
      const checkpointdata = {
        name: "Checkpoint 1",
        symbol: "CP",
        description: "You made it to checkpoint 1",
        image: "https://i.postimg.cc/htFsr6gJ/cp1.png",
        attributes: { color: "black", lvl: "1" },
        receiver: { address: receiver },
        delegated: true,
      };

      let checkpointAccountInfo = null;

      while (!checkpointAccountInfo) {
        checkpointAccountInfo = await connection.getAccountInfo(
            new web3.PublicKey("3UaUDWGurbHPxMXixj2Gup9XjVafZ2Lf3XdnUoRmHZFc")
          );
          await new Promise( resolve => setTimeout(resolve, 100));
      }

      const createCheckpointResponse = await axios.post(
          `${underdogApiEndpoint}/v2/projects/47/nfts`,
          checkpointdata,
          config
      );
      
      let retrieveCheckpoint;
      do {
            retrieveCheckpoint = await axios.get(
            `${underdogApiEndpoint}/v2/projects/47/nfts/${createCheckpointResponse.data.nftId}`,
            config
          );
          await new Promise( resolve => setTimeout(resolve, 100));
      } while(retrieveCheckpoint.data.status !== 'confirmed');

      // signatures
      const signatures = await connection.getSignaturesForAddress(new web3.PublicKey("3UaUDWGurbHPxMXixj2Gup9XjVafZ2Lf3XdnUoRmHZFc"), {
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

      let checkpointData = {
          "checkpointData" : `${(JSON.stringify(retrieveCheckpoint.data))}`,
          "nftId" : `${createCheckpointResponse.data.nftId}`,
      }

      res.json(checkpointData);
  } 
  catch (error) {
      res.status(500).send(error.message);
  }
})

/* ------------------------------ For searching checkpoint NFTs use above get function to fetch checkpoint (1 checkpoint per user)  ------------------------------ */



/* ------------------------------ update checkpoint ------------------------------ */
app.put('/checkpointUpdate', async(req, res) => {
  try {
    const { NFTId, name, description, color, lvl, image } = req.body
    const options = {
      method: 'PUT',
      url: `https://devnet.underdogprotocol.com/v2/projects/47/nfts/${NFTId}`,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${underdogKey}`
      },
      data: {
        attributes: {color: color, lvl: lvl},
        name: name,
        description: description,
        image: image
      }
    };
    
    axios
      .request(options)
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
      
  } 
  catch {
    res.status(500).send(error.message);
  }
})

/* -------------------------------------------------------------------------- */
/*                                End of Checkpoints Code                     */
/* -------------------------------------------------------------------------- */

// app.post("/addSOARScore", async (req, res) => {
//   try {
//     const { score, playerPK } = req.body;
//     const authWallet = web3.Keypair.fromSecretKey(
//       bs58.decode(
//         "4aecpyrADpd3LNaZqmxHbaB7FEDQi89AKPqHSY6k3Kk8JSYAtZQ26rwL77c4JpMdRpESAv9KSRQrLQUG9XdCmq2i"
//       )
//     );

//     const user = new web3.PublicKey(playerPK);
//     const playerAddress = soarClient.utils.derivePlayerAddress(user)[0];
//     const leaderboard = new web3.PublicKey(
//       "2bT4iEjFMRaTiopZp4PdfwkVB31g4j5EU4G1WxYRqR5d"
//     );
//     const scoresAddress = soarClient.utils.derivePlayerScoresListAddress(
//       user,
//       leaderboard
//     );

//     //Check if player exists

//     const transactionIx = soarClient
//       .submitScoreToLeaderBoard(
//         playerAddress,
//         authWallet,
//         leaderboard,
//         new BN(score)
//     );
    
//     await client.sendAndConfirmTransaction(transactionIx, [authWallet]);

//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });




app.listen(port, () => {
    console.log("API server is listening on port 3000")
})