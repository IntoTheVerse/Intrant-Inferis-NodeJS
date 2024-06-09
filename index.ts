import * as express from 'express';
import * as dotenv from "dotenv";
const cron = require("node-cron"); 

dotenv.config();
const app: express.Application = express();
const port = process.env.PORT || 8080;
import axios from 'axios';
app.use(express.json());

//Solana
import web3 = require("@solana/web3.js");
import BN = require("bn.js");
require('dotenv').config();
const apiKey = process.env.apikey;
const underdogKey = process.env.underdogkey;
const authWalletKey = process.env.authWalletKey;

//Underdog API endpoint 
const underdogApiEndpoint = "https://mainnet.underdogprotocol.com";
const heliusUrl = `https://devnet.helius-rpc.com/?api-key=${apiKey}`;
const connection = new web3.Connection(heliusUrl);

//Soar
import bs58 = require('bs58');
import { SoarProgram, GameType, Genre } from "@magicblock-labs/soar-sdk";
const leaderboardKeyAllTime = new web3.PublicKey(process.env.leaderboardKeyAllTime as string);
const leaderboardKeyWeekly = new web3.PublicKey(process.env.leaderboardKeyWeekly as string);

//MongoDB
const mongoose = require("mongoose");
import { leaderboard } from './schemas/leaderboardDataSchema';

const config = {
    headers: {
        Authorization: `Bearer ${underdogKey}`
    }
}

const CharacterLevelUpThreshold = [
  { character: "Tennon", hp_threshold: [200], stm_threshold: [200] }
];


const AllBuyableWarriors = [
    {
      name: "Tennon",
      description: "The mighty Tennon",
      image: "https://i.postimg.cc/hvHD4Z9c/ITVStrykur-MWarrior.png",
      attributes: { HP: "190", STM: "190", LVL: "1", GLD: "Strykur" },
      inferis: 20,
      characterId : 0
    },
  ];

const AllBuyablePotions = [
  {
    name: "Fixer Elixir",
    description:
      "The Fixer Elixir gives a warrior an instant temporary return to stamina/full health",
    image: "https://i.postimg.cc/6qsC1bw4/revival.png",
    attributes: { color: "Blue" },
    potionId: 0,
    inferis: 20,
    required: [
      {
        item: 2,
        value: 2,
      },
      {
        item: 3,
        value: 2,
      },
      {
        item: 4,
        value: 2,
      },
    ],
  },
  {
    name: "Quarter Revival Elixir",
    description:
      "The Fixer Elixir gives a warrior an instant temporary return to quarter stamina/health",
    image: "https://i.postimg.cc/nrjc6N1B/green.png",
    attributes: { color: "Green" },
    potionId: 1,
    inferis: 10,
    required: [
      {
        item: 2,
        value: 1,
      },
      {
        item: 3,
        value: 1,
      },
      {
        item: 4,
        value: 1,
      },
    ],
  },
  {
    name: "Half Revival Elixir",
    description:
      "The Fixer Elixir gives a warrior an instant temporary return to half stamina/health",
    image: "https://i.postimg.cc/R0pWy1Br/red.png",
    attributes: { color: "Red" },
    potionId: 2,
    inferis: 15,
    required: [
      {
        item: 2,
        value: 1,
      },
      {
        item: 3,
        value: 2,
      },
      {
        item: 4,
        value: 1,
      },
    ],
  },
];

const AllBuyablePowerups = [
  {
    name: "Plus 15 Powerup",
    description:
      "Boost player's STM and HP by +15 units causing a permanent upgrade",
    image: "https://i.postimg.cc/Hk6D9bhf/powerup.png",
    attributes: { color: "Cyan", stm: "+15", hp: "+15"},
    powerupId: 0,
    inferis: 50,
    required: [
      {
        item: 2,
        value: 3,
      },
      {
        item: 3,
        value: 3,
      },
      {
        item: 4,
        value: 3,
      },
    ],
  },
  {
    name: "Plus 20 Powerup",
    description: "Boost player's STM and HP by +20 units causing a permanent upgrade",
    image: "https://i.postimg.cc/X7DtZnBb/20stm.png",
    attributes: { color: "Pink", stm: "+20", hp: "+20"},
    powerupId: 1,
    inferis: 60,
    required: [
      {
        item: 2,
        value: 4,
      },
      {
        item: 3,
        value: 4,
      },
      {
        item: 4,
        value: 4,
      },
    ],
  },
]

const allXpLevels = [400, 1000, 1700, 2500, 3600, 5000];
const allRewardsLevels = [10_000, 8_000, 6_500, 5_000, 3_500, 2_000, 1_000, 800, 400, 100];

/* -------------------------------------------------------------------------- */
/*                                Helper Code                                 */
/* -------------------------------------------------------------------------- */

/* ------------------------------ Burn NFT ------------------------------ */

async function burnAsset(assetcollectionId: number, assetId: any) {
  const options = {
    method: 'POST',
    url: `https://mainnet.underdogprotocol.com/v2/projects/${assetcollectionId}/nfts/${assetId}/burn`,
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${underdogKey}`
    }
  };
    
  axios
    .request(options)
    .then(function (response: { data: any; }) {
      console.log(response.data);
    })
    .catch(function (error: any) {
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

app.get<{ pId: number, NftId: number },{}>("/searchByNFTId/:pId&:NftId", async (req, res) => {
  try {
    const nftId = req.params.NftId;
    const pId = req.params.pId;
    const getNftOptions = {
      method: "GET",
      url: `https://mainnet.underdogprotocol.com/v2/projects/${pId}/nfts/${nftId}`,
      headers: {
        accept: "application/json",
        authorization: `Bearer ${underdogKey}`,
      },
    };

    axios
      .request(getNftOptions)
      .then(function (response: { data: any; }) {
        console.log(response.data);
        res.json(response.data);
      })
      .catch(function (error: any) {
        console.error(error);
      });
  } catch(err) {
    res.status(500).send({ message: err });
  }
});

/* ------------------------------ Get Collection By Owner ------------------------------ */

app.get<{ pId: number, playerAddress: string },{}>("/getCollectionByOwner/:pId&:playerAddress", async (req, res) => {
  try {
    const pid = req.params.pId;
    const pAddress = req.params.playerAddress;
    const searchWarriorNftOptions = {
      method: "GET",
      url: `https://mainnet.underdogprotocol.com/v2/projects/${pid}/nfts/search?page=1&limit=100&search=${pAddress}`,
      headers: {
        accept: "application/json",
        authorization: `Bearer ${underdogKey}`,
      },
    };

    axios
      .request(searchWarriorNftOptions)
      .then(function (response: { data: any; }) {
        console.log(response.data);
        res.json(response.data);
      })
      .catch(function (error: any) {
        console.error(error);
      });
  } catch(err) {
      res.status(500).send({ message: err });
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
    } catch(err) {
        res.status(500).send({ message: err });
    }
});

app.get("/getAllBuyablePotions", async (req, res) => {
  try {
    res.json(AllBuyablePotions);
  } catch (err) {
    res.status(500).send({ message: err });
  }
});

app.get("/getAllBuyablePowerups", async (req, res) => {
  try {
    res.json(AllBuyablePowerups);
  } catch (err) {
    res.status(500).send({ message: err });
  }
});

app.get("/getAllXpLevels", async (req, res) => {
  try {
    res.json(allXpLevels);
  } catch (err) {
    res.status(500).send({ message: err });
  }
});

app.get("/getAllUsersWithRewards", async (req, res) => {
  try {
    res.json(await createCollectionIfEmpty("Weekly Leaderboard", "Bonk"));
  } catch (err) {
    console.error(err);
  }
});

/* -------------------------------------------------------------------------- */
/*                                End of Get All Default Code                 */
/* -------------------------------------------------------------------------- */

async function createCollectionIfEmpty(collectionName: string, tokenName: string): Promise<typeof leaderboard> { 
  let mongoLeaderboard = await leaderboard.findOne({ eventName: collectionName });
  if (!mongoLeaderboard || mongoLeaderboard.eventName != collectionName) { 
    mongoLeaderboard = new leaderboard({
      _id: new mongoose.Types.ObjectId(),
      eventName: collectionName,
      tokenName: tokenName,
      leaderboardAddress: leaderboardKeyWeekly,
      data: []
    });

    await mongoLeaderboard.save().catch(console.error);
  }
  return mongoLeaderboard;
}

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
        new web3.PublicKey(process.env.warriorCollection as string)
      );
      await new Promise( resolve => setTimeout(resolve, 100));
    }

    const createNftResponse = await axios.post(
        `${underdogApiEndpoint}/v2/projects/1/nfts`,
        nftData,
        config
    );
    
    let retrieveNFT;
    do {
        retrieveNFT = await axios.get(
            `${underdogApiEndpoint}/v2/projects/1/nfts/${createNftResponse.data.nftId}`,
            config
        );
        await new Promise( resolve => setTimeout(resolve, 100));
    } while(retrieveNFT.data.status !== 'confirmed');

    let warriorData = {
        "nftData" : `${(JSON.stringify(retrieveNFT.data))}`,
        "nftId" : `${createNftResponse.data.nftId}`,
    }
    console.log(warriorData);


    res.json(warriorData);
  } 
  catch (err) {
    res.status(500).send({ message: err });
  }
})

/* ------------------------------ update warrior upon administering powerups inside the game ------------------------------ */

const WarriorImages = [
  "https://i.postimg.cc/hvHD4Z9c/ITVStrykur-MWarrior.png",
  "https://i.postimg.cc/0QVS25CM/level2.png",
  "https://i.postimg.cc/v817H9pG/lvl3.png",
  "https://i.postimg.cc/d0trMT2P/lvl4.png",
  "https://i.postimg.cc/L8vgV6ry/lvl5.png",
];

app.put('/warriorUpdate', async(req, res) => {
  try {
    const { PowerUpId, NFTId, characterName, hp, stm, lvl } = req.body;
    let cur_lvl = parseInt(lvl);
    for (let i = 0; i < CharacterLevelUpThreshold.length; i++) {
      if (CharacterLevelUpThreshold[i].character === characterName) {
        if (
          hp >= CharacterLevelUpThreshold[i].hp_threshold[cur_lvl - 1] &&
          stm >= CharacterLevelUpThreshold[i].stm_threshold[cur_lvl - 1]
        ) {
          cur_lvl++;
        }
      }
    }

    await burnAsset(6, PowerUpId)
      .then(function (response) {
        const options = {
          method: "PUT",
          url: `https://mainnet.underdogprotocol.com/v2/projects/1/nfts/${NFTId}`,
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            authorization: `Bearer ${underdogKey}`,
          },
          data: {
            attributes: {
              HP: hp,
              STM: stm,
              LVL: cur_lvl,
              GLD: "Strykur",
            },
            name: "Tennon",
            image: WarriorImages[cur_lvl - 1],
          },
        };

        axios
          .request(options)
          .then(function (response: { data: any; }) {
            console.log(response.data);
            res.json(response.data);
          })
          .catch(function (error: any) {
            console.error(error);
          });
      })
      .catch(function (error) {
        console.error(error);
      });
  } 
  catch(err) {
    res.status(500).send({ message: err });

  }
})

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
          image: "https://i.postimg.cc/XqYF9nY7/theracode01.png",
          attributes: { color: "blue" },
          receiver: { address: receiver },
          delegated: true,
        };

        let theracodeAccountInfo = null;

        while (!theracodeAccountInfo) {
            theracodeAccountInfo = await connection.getAccountInfo(
              new web3.PublicKey(process.env.theracodeCollection as string)
            );
            await new Promise( resolve => setTimeout(resolve, 100));
        }

        const createTheracodeResponse = await axios.post(
            `${underdogApiEndpoint}/v2/projects/2/nfts`,
            theracodedata,
            config
        );
        
        let retrieveTheracode;
        do {
            retrieveTheracode = await axios.get(
                `${underdogApiEndpoint}/v2/projects/2/nfts/${createTheracodeResponse.data.nftId}`,
                config
            );
            await new Promise( resolve => setTimeout(resolve, 100));
        } while(retrieveTheracode.data.status !== 'confirmed');

        let theracodeData = {
            "theracodeData" : `${(JSON.stringify(retrieveTheracode.data))}`,
            "nftId" : `${createTheracodeResponse.data.nftId}`,
        }

        res.json(theracodeData);
    } 
    catch (err) {
      res.status(500).send({ message: err });

    }
})

/* ------------------------------ burn Theracode NFT from collection upon use to make potions or powerups ------------------------------ */

/* -------------------------------------------------------------------------- */
/*                                End of Theracode                               */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/*                                TheraBox                              */
/* -------------------------------------------------------------------------- */

/* ------------------------------ mint thera box during collection from the game ------------------------------ */
app.post('/therabox', async(req, res) => {
    try {
        const { receiver } = req.body;
        const theraboxdata = {
          name: "Thera Box",
          symbol: "THERABOX",
          description: "Glowing mini Thera Boxes hide the artifacts. ",
          image: "https://i.postimg.cc/Vv0PN1fT/therabox.png",
          attributes: { color: "yellow" },
          receiver: { address: receiver },
          delegated: true,
        };

        let theraboxAccountInfo = null;

        while (!theraboxAccountInfo) {
            theraboxAccountInfo = await connection.getAccountInfo(
              new web3.PublicKey(process.env.theraboxCollection as string)
            );
            await new Promise( resolve => setTimeout(resolve, 100));
        }

        const createTheraBoxResponse = await axios.post(
            `${underdogApiEndpoint}/v2/projects/3/nfts`,
            theraboxdata,
            config
        );
        
        let retrieveTheraBox;
        do {
            retrieveTheraBox = await axios.get(
                `${underdogApiEndpoint}/v2/projects/3/nfts/${createTheraBoxResponse.data.nftId}`,
                config
            );
            await new Promise( resolve => setTimeout(resolve, 100));
        } while(retrieveTheraBox.data.status !== 'confirmed');

        let theraboxData = {
            "theraboxData" : `${(JSON.stringify(retrieveTheraBox.data))}`,
            "nftId" : `${createTheraBoxResponse.data.nftId}`,
        }

        res.json(theraboxData);
    } 
    catch(err) {
      res.status(500).send({ message: err });

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
              new web3.PublicKey(process.env.scrollColletion as string)
            );
            await new Promise( resolve => setTimeout(resolve, 100));
        }

        const createScrollResponse = await axios.post(
            `${underdogApiEndpoint}/v2/projects/4/nfts`,
            scrolldata,
            config
        );
        
        let retrieveScroll;
        do {
            retrieveScroll = await axios.get(
                `${underdogApiEndpoint}/v2/projects/4/nfts/${createScrollResponse.data.nftId}`,
                config
            );
            await new Promise( resolve => setTimeout(resolve, 100));
        } while(retrieveScroll.data.status !== 'confirmed');

        let scrollData = {
            "scrollData" : `${(JSON.stringify(retrieveScroll.data))}`,
            "nftId" : `${createScrollResponse.data.nftId}`,
        }

        res.json(scrollData);
    } 
    catch(err) {
      res.status(500).send({ message: err });

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
              new web3.PublicKey(process.env.potionCollection as string)
            );
            await new Promise( resolve => setTimeout(resolve, 100));
        }

        const createElixirResponse = await axios.post(
            `${underdogApiEndpoint}/v2/projects/5/nfts`,
            elixirdata,
            config
        );
        
        let retrieveElixir;
        do {
            retrieveElixir = await axios.get(
                `${underdogApiEndpoint}/v2/projects/5/nfts/${createElixirResponse.data.nftId}`,
                config
            );
            await new Promise( resolve => setTimeout(resolve, 100));
        } while(retrieveElixir.data.status !== 'confirmed');

        let elixirData = {
            "elixirData" : `${(JSON.stringify(retrieveElixir.data))}`,
            "nftId" : `${createElixirResponse.data.nftId}`,
        }

        res.json(elixirData);
    } 
    catch(err) {
      res.status(500).send({ message: err });

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
        new web3.PublicKey(process.env.potionCollection as string)
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const createElixirResponse = await axios.post(
      `${underdogApiEndpoint}/v2/projects/5/nfts`,
      elixirdata,
      config
    );

    let retrieveElixir;
    do {
      retrieveElixir = await axios.get(
        `${underdogApiEndpoint}/v2/projects/5/nfts/${createElixirResponse.data.nftId}`,
        config
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
    } while (retrieveElixir.data.status !== "confirmed");

    let elixirData = {
      elixirData: `${JSON.stringify(retrieveElixir.data)}`,
      nftId: `${createElixirResponse.data.nftId}`,
    };

    res.json(elixirData);
  } catch (err) {
      res.status(500).send({ message: err });

  }
});

/* ------------------------------ burn potion NFT from collection upon use of potion inside the game ------------------------------ */

app.post('/burnPotion', async(req, res) => {
    try {
        const { id } = req.body;
      await burnAsset(5, id).then(function (response) {
        res.json(response);
      })
        .catch(function (error) {
          console.error(error);
        });
    } 
    catch (err) {
      res.status(500).send({ message: err });
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
      symbol: "POWERUP",
      description: powerups.description,
      image: powerups.image,
      attributes: powerups.attributes,
      receiver: { address: receiver },
      delegated: true,
    };

    let powerUpAccountInfo = null;

    while (!powerUpAccountInfo) {
      powerUpAccountInfo = await connection.getAccountInfo(
        new web3.PublicKey(process.env.powerupColletion as string)
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const createPowerUpResponse = await axios.post(
      `${underdogApiEndpoint}/v2/projects/6/nfts`,
      powerUpData,
      config
    );

    let retrievePowerUp;
    do {
      retrievePowerUp = await axios.get(
        `${underdogApiEndpoint}/v2/projects/6/nfts/${createPowerUpResponse.data.nftId}`,
        config
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
    } while (retrievePowerUp.data.status !== "confirmed");

    let powerupdata = {
      powerupdata: `${JSON.stringify(retrievePowerUp.data)}`,
      nftId: `${createPowerUpResponse.data.nftId}`,
    };

    res.json(powerupdata);
  } catch (err) {
    res.status(500).send({ message: err });

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
      symbol: "POWERUP",
      description: powerups.description,
      image: powerups.image,
      attributes: powerups.attributes,
      receiver: { address: receiver },
      delegated: true,
    };

    let powerUpAccountInfo = null;

    while (!powerUpAccountInfo) {
      powerUpAccountInfo = await connection.getAccountInfo(
        new web3.PublicKey(process.env.powerupColletion as string)
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const createPowerUpResponse = await axios.post(
      `${underdogApiEndpoint}/v2/projects/6/nfts`,
      powerUpData,
      config
    );

    let retrievePowerUp;
    do {
      retrievePowerUp = await axios.get(
        `${underdogApiEndpoint}/v2/projects/6/nfts/${createPowerUpResponse.data.nftId}`,
        config
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
    } while (retrievePowerUp.data.status !== "confirmed");

    let powerupdata = {
      powerupdata: `${JSON.stringify(retrievePowerUp.data)}`,
      nftId: `${createPowerUpResponse.data.nftId}`,
    };

    res.json(powerupdata);
  } catch (err) {
    res.status(500).send({ message: err });

  }
});

/* -------------------------------------------------------------------------- */
/*                                End of Powerups Code                        */
/* -------------------------------------------------------------------------- */



/* -------------------------------------------------------------------------- */
/*                                 Checkpoints                               */
/* -------------------------------------------------------------------------- */

const CheckpointsImages = [
  ["https://i.postimg.cc/t4zR3nQf/cp0.png", "Green"],
  ["https://i.postimg.cc/htFsr6gJ/cp1.png", "Black"],
  ["https://i.postimg.cc/85CmcVdY/cp2.png", "Red"],
  ["https://i.postimg.cc/j5kQJkZS/cp3.png", "Cyan"],
  ["https://i.postimg.cc/gjXyyqTq/cp4.png", "Yellow"],
  ["https://i.postimg.cc/J0fNpHww/cp5.png", "Purple"],
];

/* ------------------------------ mint checkpoint ------------------------------ */
app.post('/checkpoint', async(req, res) => {
  try {
      const { receiver, cp_level } = req.body;
      const checkpointdata = {
        name: "Checkpoint 0",
        symbol: "CP",
        description: "You made it to checkpoint 0",
        image: CheckpointsImages[0][0],
        attributes: { color: CheckpointsImages[0][1], lvl: cp_level },
        receiver: { address: receiver },
        delegated: true,
      };

      let checkpointAccountInfo = null;

      while (!checkpointAccountInfo) {
        checkpointAccountInfo = await connection.getAccountInfo(
            new web3.PublicKey(process.env.checkpointCollection as string)
          );
          await new Promise( resolve => setTimeout(resolve, 100));
      }

      const createCheckpointResponse = await axios.post(
          `${underdogApiEndpoint}/v2/projects/7/nfts`,
          checkpointdata,
          config
      );
      
      let retrieveCheckpoint;
      do {
            retrieveCheckpoint = await axios.get(
            `${underdogApiEndpoint}/v2/projects/7/nfts/${createCheckpointResponse.data.nftId}`,
            config
          );
          await new Promise( resolve => setTimeout(resolve, 100));
      } while(retrieveCheckpoint.data.status !== 'confirmed');

      let checkpointData = {
          "checkpointData" : `${(JSON.stringify(retrieveCheckpoint.data))}`,
          "nftId" : `${createCheckpointResponse.data.nftId}`,
      }

      res.json(checkpointData);
  } 
  catch (err) {
    res.status(500).send({ message: err });

  }
})

/* ------------------------------ For searching checkpoint NFTs use above get function to fetch checkpoint (1 checkpoint per user)  ------------------------------ */



/* ------------------------------ update checkpoint ------------------------------ */
app.put('/checkpointUpdate', async(req, res) => {
  try {
    const { NFTId, cp_level, cp_number } = req.body
    const options = {
      method: "PUT",
      url: `https://mainnet.underdogprotocol.com/v2/projects/7/nfts/${NFTId}`,
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${underdogKey}`,
      },
      data: {
        attributes: { color: CheckpointsImages[cp_number][1], lvl: cp_level },
        name: `Checkpoint ${cp_number}`,
        description: `You made it to checkpoint ${cp_number}`,
        image: CheckpointsImages[cp_number][0],
      },
    };
    
    axios
      .request(options)
      .then(function (response: { data: any; }) {
        console.log(response.data);
        res.json(response.data);
      })
      .catch(function (error: any) {
        console.error(error);
      });
      
  } 
  catch (err) {
    res.status(500).send({ message: err });

  }
})

/* -------------------------------------------------------------------------- */
/*                                End of Checkpoints Code                     */
/* -------------------------------------------------------------------------- */



/* -------------------------------------------------------------------------- */
/*                                 Create Game SOAR code                      */
/* -------------------------------------------------------------------------- */

async function createSOARGame() {
  const authGameCreationauthWallet = web3.Keypair.fromSecretKey(bs58.decode(`${process.env.authWalletKey}`));
  const soarClient = SoarProgram.getFromConnection(connection, authGameCreationauthWallet.publicKey);
  const keypair = web3.Keypair.generate();

  let game = keypair.publicKey;
  let title = "Intrant Inferis";
  let description = "It is a on-chain mobile RPG";
  let genre = Genre.RPG;
  let gameType = GameType.Mobile; 
  let nftMeta = new web3.PublicKey("DpFHvFR5nJX1zouUkBtfs7YLLZE59RyniUXekm8LFPA8");
  let _auths = [authGameCreationauthWallet.publicKey];

  let { newGame, transaction } = await soarClient.initializeNewGame(game, title, description, genre, gameType, nftMeta, _auths);
  const tx = await web3.sendAndConfirmTransaction(connection, transaction, [authGameCreationauthWallet, keypair]);
  console.log("SOAR Create Game : " + tx);
};

async function createSOARLeaderboard() { 
  try {
    const authGameCreationauthWallet = web3.Keypair.fromSecretKey(bs58.decode(`${process.env.authWalletKey}`));
    const soarClient = SoarProgram.getFromConnection(connection, authGameCreationauthWallet.publicKey);

    const transactionIx = await soarClient.addNewGameLeaderBoard(
      new web3.PublicKey("7T4rRNuZrU5ZXyLPgMa4d7t7qvgtXMRDNpikbwdQ9ndc"),
      authGameCreationauthWallet.publicKey,
      "Intrant Inferis All-Time Leaderboard",
      new web3.PublicKey("DpFHvFR5nJX1zouUkBtfs7YLLZE59RyniUXekm8LFPA8"), // nft associated with the leaderboard
      100,
      false
    );

    const tx = await web3.sendAndConfirmTransaction(connection, transactionIx.transaction, [authGameCreationauthWallet]);
    console.log("SOAR Leaderboard Create Game : " + tx);
  }
  catch (e) { 
    console.log(e);
  }
}

// createSOARLeaderboard();
//createSOARGame();

/* -------------------------------------------------------------------------- */
/*                                 End of Game SOAR code                      */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/*                                 Update score using SOAR code               */
/* -------------------------------------------------------------------------- */

app.post("/addSOARScore", async (req, res) => {
  try {
    const { scoreAllTime, scoreWeekly, playerPublicKey } = req.body;

    const authWallet = web3.Keypair.fromSecretKey(bs58.decode(`${authWalletKey}`));
    const soarClient = SoarProgram.getFromConnection(connection, authWallet.publicKey);
    
    const transactionIxAlTime = await soarClient
      .submitScoreToLeaderBoard(
        playerPublicKey,        // player's address
        authWallet.publicKey,   // address that deployed the contract that has the authority to put the score in the leaderboard
        leaderboardKeyAllTime,         // leaderboard associated with soar [PublicKey]
        new BN(parseInt(scoreAllTime)) // score to be updated inside the leaderboard
    );

    const transactionIxWeekly = await soarClient
      .submitScoreToLeaderBoard(
        playerPublicKey,        // player's address
        authWallet.publicKey,   // address that deployed the contract that has the authority to put the score in the leaderboard
        leaderboardKeyWeekly,         // weekly leaderboard associated with soar [PublicKey]
        new BN(parseInt(scoreWeekly)) // score to be updated inside the leaderboard
    );

    transactionIxAlTime.transaction.add(transactionIxWeekly.transaction);

    const sig = await web3.sendAndConfirmTransaction(connection, transactionIxAlTime.transaction, [authWallet]);
    console.log(sig);
    res.send(sig);
  }
  catch (err)
  {
    console.log(err);
    res.status(500).send({ message: err });
  }
});

app.post("/claimWeeklyReward", async (req, res) => {
  try {
    const { playerPublicKey, index } = req.body;

    var weeklyLeaderboard = await createCollectionIfEmpty("Weekly Leaderboard", "Bonk");
    let user = null;
    for (let i = 0; i < weeklyLeaderboard.data.length; i++) {
      if (weeklyLeaderboard.data[i].userAddress == playerPublicKey) {
        user = weeklyLeaderboard.data[i];
      }
    }

    console.log("Getting " + user.userRewards[index] + weeklyLeaderboard.tokenName);
    //Distribute Reward
    // const sig = await web3.sendAndConfirmTransaction(connection, transactionIxAlTime.transaction, [authWallet]);
    // console.log(sig);
    // res.send(sig);
  
    user.userRewards.splice(index, 1);
    const updateResults = await leaderboard.updateOne(
      { _id: weeklyLeaderboard._id },
      { $set: { "data.$[i].userRewards": user.userRewards } },
      {
        arrayFilters: [{
          "i._id": user._id
        }]
      }
    );
    console.log(updateResults);
    res.json(updateResults);
  }
  catch (err)
  {
    console.log(err);
    res.status(500).send({ message: err });
  }
});

async function SOARCron() { 
  cron.schedule("0 0 * * 1", async function () {
    const authWallet = web3.Keypair.fromSecretKey(bs58.decode(`${authWalletKey}`));
    const soarClient = SoarProgram.getFromConnection(connection, authWallet.publicKey);

    const allWeeklyLeaderboardAccount = await soarClient.fetchLeaderBoardAccount(leaderboardKeyWeekly);
    const allWeeklyToEntriesAccounts = await soarClient.fetchLeaderBoardTopEntriesAccount(allWeeklyLeaderboardAccount.topEntries as web3.PublicKey);
    
    for (let index = 0; index < allWeeklyToEntriesAccounts.topScores.length; index++) {
      const player = allWeeklyToEntriesAccounts.topScores[index];
      if (player.player.toString() != web3.PublicKey.default.toString()) { 
        const playerAddress = (await soarClient.fetchPlayerAccount(player.player)).user;
        const [playerScoresListAddress] = soarClient.utils.derivePlayerScoresListAddress(playerAddress, leaderboardKeyWeekly);
        const playerScoresList = await soarClient.fetchPlayerScoresListAccount(playerScoresListAddress);
        
        var latestScore = 0;
        var latestTimestamp = 0;
        for (let index = 0; index < playerScoresList.scores.length; index++) {
          const element = playerScoresList.scores[index];
          if (latestTimestamp < element.timestamp) { 
            latestTimestamp = element.timestamp;
            latestScore = element.score;
          }
        }
            
        if (latestScore > 0) { 
          const transactionIxWeekly = await soarClient
          .submitScoreToLeaderBoard(
            playerAddress,        // player's address
            authWallet.publicKey,   // address that deployed the contract that has the authority to put the score in the leaderboard
            leaderboardKeyWeekly,         // weekly leaderboard associated with soar [PublicKey]
            new BN(0) // score to be updated inside the leaderboard
          );
            
          const sig = await web3.sendAndConfirmTransaction(connection, transactionIxWeekly.transaction, [authWallet], {commitment: 'finalized'});
          console.log(sig);

          var weeklyLeaderboard = await createCollectionIfEmpty("Weekly Leaderboard", "Bonk");

          let user = null;
          for (let i = 0; i < weeklyLeaderboard.data.length; i++) {
            if (weeklyLeaderboard.data[i].userAddress == playerAddress) {
              user = weeklyLeaderboard.data[i];
            }
          }

          if (user != null) {
            if (user.userAddress == playerAddress) { 
              user.userRewards.push(allRewardsLevels[index]);
            }
          }
          else { 
            weeklyLeaderboard.data.push({
              userAddress: playerAddress,
              userRewards: [allRewardsLevels[index]],
            });
          }

          await weeklyLeaderboard.save().catch(console.error);
        }
      }
    }
  });
}

async function ConnectMongoDB() {
  await mongoose.connect(process.env.databaseToken as string).catch(console.error);
}; 

ConnectMongoDB();
SOARCron();

app.listen(port, () => {
    console.log(`API server is listening on port ${port}`)
})

/* -------------------------------------------------------------------------- */
/*                                End of SOAR code                            */
/* -------------------------------------------------------------------------- */