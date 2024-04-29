import * as express from 'express';
import * as dotenv from "dotenv";

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
const underdogApiEndpoint = "https://devnet.underdogprotocol.com";
const heliusUrl = `https://devnet.helius-rpc.com/?api-key=${apiKey}`;
const connection = new web3.Connection(heliusUrl);

//Soar
import bs58 = require('bs58');
import { SoarProgram } from "@magicblock-labs/soar-sdk";

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

const allXpLevels = [400, 1000, 1700, 2500, 3600, 5000];

/* -------------------------------------------------------------------------- */
/*                                Helper Code                                 */
/* -------------------------------------------------------------------------- */

/* ------------------------------ Burn NFT ------------------------------ */

async function burnAsset(assetcollectionId: number, assetId: any) {
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
      url: `https://devnet.underdogprotocol.com/v2/projects/${pId}/nfts/${nftId}`,
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
    // res.status(500).send(error.message);
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
      url: `https://devnet.underdogprotocol.com/v2/projects/${pid}/nfts/search?page=1&limit=100&search=${pAddress}`,
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
    // res.status(500).send(error.message);
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


/* -------------------------------------------------------------------------- */
/*                                End of Get All Default Code                 */
/* -------------------------------------------------------------------------- */



/* -------------------------------------------------------------------------- */
/*                                Warrior Code                                */
/* -------------------------------------------------------------------------- */

/* ------------------------------ Mint Warrior ------------------------------ */
// const options = {
        //   method: 'POST',
        //   url: `${underdogApiEndpoint}/v2/projects/46/nfts`,
        //   headers: {
        //     accept: 'application/json',
        //     'content-type': 'application/json',
        //     authorization: `Bearer ${underdogKey}`
        //   },
          // data: {
          //   name: 'Tennon',
          //   symbol: 'INFERIS',
          //   description: 'The might Tennon',
          //   image: 'https://i.postimg.cc/hvHD4Z9c/ITVStrykur-MWarrior.png',
          //   delegated: true
          // },
        //   data: {
        //     name: character.name,
        //     symbol: "INFERIS",
        //     description: character.description,
        //     image: character.image,
        //     attributes: character.attributes,
        //     receiver: { address: receiver },
        //     delegated: true,
        //   }
        // };
        
        // axios
        //   .request(options)
        //   .then(function (response) {
        //     console.log(response.data);
        //   })
        //   .catch(function (error) {
        //     console.error(error);
        //   });

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
              new web3.PublicKey("BUgx6ymLXi18voRodEV8AFsieVu7nXZ7iXsXiDfdkjDG")
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

        // // // signatures
        // // const signatures = await connection.getSignaturesForAddress(new web3.PublicKey("BUgx6ymLXi18voRodEV8AFsieVu7nXZ7iXsXiDfdkjDG"), {
        // //     commitment: 'confirmed'
        // // });

        // // const transactionDetails = await connection.getParsedTransaction(
        // //     signatures[0].signature,
        // //     {
        // //         commitment: "confirmed",
        // //         encoding: "jsonParsed",
        // //         maxSupportedTransactionVersion: 0,

        // //     }
        // // )

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

    await burnAsset(45, PowerUpId)
      .then(function (response) {
        const options = {
          method: "PUT",
          url: `https://devnet.underdogprotocol.com/v2/projects/46/nfts/${NFTId}`,
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


// app.post('/theracode', async(req, res) => {
//   try {
//       const { receiver } = req.body;
//       const options = {
//         method: 'POST',
//         url: `${underdogApiEndpoint}/v2/projects/41/nfts`,
//         headers: {
//           accept: 'application/json',
//           'content-type': 'application/json',
//           authorization: `Bearer ${underdogKey}`
//         },
        
//         data: {
//           name: 'Theracode',
//           symbol: 'THERACODE',
//           description: 'Floating Theracode that reveals binary numbers.',
//           image: 'https://i.postimg.cc/YCgY7ZB8/theracode.png',
//           attributes: { color: 'blue' },
//           receiver: { address: receiver },
//           delegated: true,
//         }
//       };
      
//       axios
//         .request(options)
//         .then(function (response) {
//           console.log(response.data);
//         })
//         .catch(function (error) {
//           console.error(error);
//         });
//   } 
//   catch (err) {
//     res.status(500).send({ message: err });

//   }
// })

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

        // // signatures
        // const signatures = await connection.getSignaturesForAddress(new web3.PublicKey("2zxjm5qZHx9RyubAqSyfoidLW1sReyEktbnRWd9YtGwu"), {
        //     commitment: 'confirmed'
        // });

        // const transactionDetails = await connection.getParsedTransaction(
        //     signatures[0].signature,
        //     {
        //         commitment: "confirmed",
        //         encoding: "jsonParsed",
        //         maxSupportedTransactionVersion: 0,

        //     }
        // )

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
/*                                AsimanaBox                              */
/* -------------------------------------------------------------------------- */

/* ------------------------------ mint asimana box during collection from the game ------------------------------ */
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
              new web3.PublicKey("3kBNqm4TTgpxJmGhhBQzgMDWVtEkDo4hKQHEzB5cZgk3")
            );
            await new Promise( resolve => setTimeout(resolve, 100));
        }

        const createTheraBoxResponse = await axios.post(
            `${underdogApiEndpoint}/v2/projects/42/nfts`,
            theraboxdata,
            config
        );
        
        let retrieveTheraBox;
        do {
            retrieveTheraBox = await axios.get(
                `${underdogApiEndpoint}/v2/projects/42/nfts/${createTheraBoxResponse.data.nftId}`,
                config
            );
            await new Promise( resolve => setTimeout(resolve, 100));
        } while(retrieveTheraBox.data.status !== 'confirmed');

        // // signatures
        // const signatures = await connection.getSignaturesForAddress(new web3.PublicKey("3kBNqm4TTgpxJmGhhBQzgMDWVtEkDo4hKQHEzB5cZgk3"), {
        //     commitment: 'confirmed'
        // });

        // const transactionDetails = await connection.getParsedTransaction(
        //     signatures[0].signature,
        //     {
        //         commitment: "confirmed",
        //         encoding: "jsonParsed",
        //         maxSupportedTransactionVersion: 0,

        //     }
        // )

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

        // // signatures
        // const signatures = await connection.getSignaturesForAddress(new web3.PublicKey("87JYTfmZS5FYwLZ8q7mdSd5TCUmZMuNZDvqSvrjcadob"), {
        //     commitment: 'confirmed'
        // });

        // const transactionDetails = await connection.getParsedTransaction(
        //     signatures[0].signature,
        //     {
        //         commitment: "confirmed",
        //         encoding: "jsonParsed",
        //         maxSupportedTransactionVersion: 0,

        //     }
        // )

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

        // // signatures
        // const signatures = await connection.getSignaturesForAddress(new web3.PublicKey("EaFpGsrrA9SY9sQmaKvU2tteUbMLdrADAscXwtUh9zZs"), {
        //     commitment: 'confirmed'
        // });

        // const transactionDetails = await connection.getParsedTransaction(
        //     signatures[0].signature,
        //     {
        //         commitment: "confirmed",
        //         encoding: "jsonParsed",
        //         maxSupportedTransactionVersion: 0,

        //     }
        // )

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

    // // signatures
    // const signatures = await connection.getSignaturesForAddress(
    //   new web3.PublicKey("EaFpGsrrA9SY9sQmaKvU2tteUbMLdrADAscXwtUh9zZs"),
    //   {
    //     commitment: "confirmed",
    //   }
    // );

    // const transactionDetails = await connection.getParsedTransaction(
    //   signatures[0].signature,
    //   {
    //     commitment: "confirmed",
    //     encoding: "jsonParsed",
    //     maxSupportedTransactionVersion: 0,
    //   }
    // );

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
      await burnAsset(43, id).then(function (response) {
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

    // // signatures
    // const signatures = await connection.getSignaturesForAddress(
    //   new web3.PublicKey("9vX76TVAn9ELJCWFNckF31i5MESukJkpztoEG2AtP6Tk"),
    //   {
    //     commitment: "confirmed",
    //   }
    // );

    // const transactionDetails = await connection.getParsedTransaction(
    //   signatures[0].signature,
    //   {
    //     commitment: "confirmed",
    //     encoding: "jsonParsed",
    //     maxSupportedTransactionVersion: 0,
    //   }
    // );

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

    // // signatures
    // const signatures = await connection.getSignaturesForAddress(
    //   new web3.PublicKey("9vX76TVAn9ELJCWFNckF31i5MESukJkpztoEG2AtP6Tk"),
    //   {
    //     commitment: "confirmed",
    //   }
    // );

    // const transactionDetails = await connection.getParsedTransaction(
    //   signatures[0].signature,
    //   {
    //     commitment: "confirmed",
    //     encoding: "jsonParsed",
    //     maxSupportedTransactionVersion: 0,
    //   }
    // );

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

      // // signatures
      // const signatures = await connection.getSignaturesForAddress(new web3.PublicKey("3UaUDWGurbHPxMXixj2Gup9XjVafZ2Lf3XdnUoRmHZFc"), {
      //     commitment: 'confirmed'
      // });

      // const transactionDetails = await connection.getParsedTransaction(
      //     signatures[0].signature,
      //     {
      //         commitment: "confirmed",
      //         encoding: "jsonParsed",
      //         maxSupportedTransactionVersion: 0,

      //     }
      // )

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
      url: `https://devnet.underdogprotocol.com/v2/projects/47/nfts/${NFTId}`,
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
/*                                 Update score using SOAR code               */
/* -------------------------------------------------------------------------- */

app.post("/addSOARScore", async (req, res) => {
  try {
    const { score, playerPublicKey } = req.body;

    const authWallet = web3.Keypair.fromSecretKey(bs58.decode(`${authWalletKey}`));
    const soarClient = SoarProgram.getFromConnection(connection, authWallet.publicKey);
    const leaderboardKey = new web3.PublicKey("9emNU9UQ7ro82vrnB2Dj7kun7wZ7a22cNyVLbszHaZsj");

    if (leaderboardKey) { console.log("Success 2"); }
    
    const transactionIx = await soarClient
      .submitScoreToLeaderBoard(
        playerPublicKey,        // player's PDA associated with soar address
        authWallet.publicKey,   // address that deployed the contract that has the authority to put the score in the leaderboard
        leaderboardKey,         // leaderboard associated with soar [PublicKey]
        new BN(parseInt(score)) // score to be updated inside the leaderboard
    );

    const sig = await web3.sendAndConfirmTransaction(connection, transactionIx.transaction, [authWallet], {skipPreflight: true});
    console.log(sig);
    res.send(sig);
  }
  catch (err)
  {
    console.log(err);
    res.status(500).send({ message: err });
  }
});


app.listen(port, () => {
    console.log(`API server is listening on port ${port}`)
})

/* -------------------------------------------------------------------------- */
/*                                End of SOAR code                            */
/* -------------------------------------------------------------------------- */