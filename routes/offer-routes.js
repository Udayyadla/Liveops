const express = require("express");
const req = require("express/lib/request");
const router = express.Router();
const jwt = require("jsonwebtoken");
const SECRET_CODE = "ajshhuehAhsjdhjklda";
const { offer } = require("../models/offers");

const getUserByToken = (token) => {
  return new Promise((resolve, reject) => {
    if (token) {
      let userData;
      try {
        userData = jwt.verify(token, SECRET_CODE);
        resolve(userData);
      } catch (err) {
        reject("Invalid Token!");
      }
    } else {
      reject("Token not found");
    }
  });
};
// Get all offers
router.get("/api", async (req, res) => {
  try {
    const {
      page = 1,
      records = 100,
      attribute = "offer_title",
      query = "",
    } = req.query;

    const regexQuery = new RegExp(query, "i");

    const offers = await offer
      .find({ [attribute]: regexQuery })
      .sort({ offer_sort_order: "asc" })
      .skip((page - 1) * records)
      .limit(records);

    const hasMore =
      (await offer.countDocuments({ [attribute]: regexQuery })) >
      page * records;

    res.status(200).json({
      page: parseInt(page),
      has_more: hasMore,
      offers: offers,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// router.post("/list", async(req, res)=> {
//     const validOffers = [];
//     offer.find().then((offers)=> {
//         offers.filter((offer)=> {
//             const rules = offer.target.split("and")
//             //['age > 30', 'installed_days < 5']
//             rules.forEach((rule)=> {
//                 let ruleKey = {}
//                 if(rule.includes(">")) {
//                     ruleKey = {key: rule.trim().split(">")[0].trim(), value: parseInt(rule.trim().split(">")[1]) }
//                     if(req.body[ruleKey.key] > ruleKey.value) {
//                         validOffers.push(offer)
//                         console.log()
//                     }

//                 } else {
//                     ruleKey = {key: rule.trim().split("<")[0], value: rule.trim().split("<")[1]}
//                     if(req.body[ruleKey.key] < ruleKey.value) {
//                         validOffers.push(offer)
//                     }
//                     console.log(validOffers)
//                 }
//             })
//         })
//         res.status(200).send(validOffers);
//     }).catch(()=> {
//         res.status(500).send("Internal Server Error")
//     })
// });

router.post("/create", async (req, res) => {
  //find the user
  getUserByToken(req.headers.authorization)
    .then((user) => {
      ///create a offer based on user
      offer
        .create({ ...req.body, username: user.username })
        .then((offer) => {
          res.status(200).send(offer);
        })
        .catch((err) => {
          res.status(400).send({ message: err.message });
        });
      //res.status(200).send(user)
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});
// router.put("/update", async()=> {
//     offer.updateOne("identifier data", "newData");
// });
router.put("/api/:offerId", (req, res) => {
  const offerId = req.params.offerId;
  const updatedOffer = req.body;

  // check if offerId is valid and updatedOffer is not empty
  // if not, return 400 Bad Request status
  if (!isValidOfferId(offerId) || !isValidOffer(updatedOffer)) {
    res.status(400).json({ error: "Invalid offer data" });
    return;
  }

  // update the offer in the database using offerId
  // return 404 Not Found status if offer with offerId does not exist
  // otherwise, return 200 OK status with the updated offer as the response body
  offer
    .updateOffer(offerId, updatedOffer)
    .then((updatedOffer) => {
      if (!updatedOffer) {
        res.status(404).json({ error: `Offer with ID ${offerId} not found` });
      } else {
        res.status(200).json(updatedOffer);
      }
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

// router.delete("/delete", async()=> {
//     offer.deleteOne({_id: req.body.id})
// });
router.delete("/api/:offerId", (req, res) => {
  const {offerId} = req.params.offerId;

  // Delete the offer with the specified ID from the database
  offer
    .deleteOne(offerId)
    .then(() => {
      res.status(204).send(); // No content
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Failed to delete offer"); // Internal server error
    });
});

module.exports = router;
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0MGNiNDM2MmZhYTMzM2JhOWU0N2Y2ZCIsInVzZXJuYW1lIjoia3Jpc2hoIiwiaWF0IjoxNjc4NTk1MDEwfQ.qxdm2mOdIpoOwdi5ad8PxeCQZpH4uFl4YmIUJpz0Zro
