const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const jwt = require("jsonwebtoken");
const salt = 10;
const SECRET_CODE = "ajshhuehAhsjdhjklda";
const {user} = require("../models/users");
///findOne userExist 
router.post("/signup", async (req, res)=> {
   //encrypt the password
    bcrypt.genSalt(salt, (saltErr, saltValue)=> {
        if(saltErr) {
            res.status(401).send("Unable to process")
        } else {
            bcrypt.hash(req.body.password, saltValue, (hashErr, hashValue)=> {
                if(hashErr) {
                    res.status(401).send("Unable to process");
                } else {
                    user.create({username: req.body.username, password: hashValue, email: req.body.email | "", mobile: req.body.mobile | ""}).then((user)=> {
                        res.status(200).send(user.username + " " + "created successfully");
                    }).catch((err)=> {
                        res.status(400).send(err.message)
                    })
                }
            })
        }
    })
});

router.post("/signin", async (req, res)=> {
    //read a user from db
    //username password
    //user exist or not 
    //verify password and generate jwt
    user.findOne({username: req.body.username}).then((user)=> {
        if(!user) {
            res.status(401).send("User not exist!")
        } else {
            if(!bcrypt.compareSync(req.body.password, user.password)) {
                res.status(401).send("Invalid Password")
            } else {
                const token = jwt.sign({id: user._id, username: user.username}, SECRET_CODE);
                res.status(200).send({message: "User loggedin successsfully", token: token});
            }
        }
    }).catch((err)=> {
        console.log(err)

    })
});
module.exports = router;