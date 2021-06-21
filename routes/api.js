const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const Post = require("../models/post");

//MongoDB Credentials//
const db =
    "mongodb+srv://ornob:BWiJ7YxlQn7THbRp@cluster0.pbofs.mongodb.net/eventsdb?retryWrites=true&w=majority";

//Connection to MongoDB
mongoose.connect(db, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Connection Successful");
    }
});

// Reviews//

// Create a review
router.post("/posts", (req, res, next) => {
    const post = new Post({
        title: req.body.title,
        rating: req.body.rating,
        content: req.body.content,
    });
    post.save().then((createdPost) => {
        res.status(201).json({
            message: "Post added successfully",
            postId: createdPost._id,
        });
    });
});
//

router.get("/posts/:id", (req, res, next) => {
    Post.findById(req.params.id).then((post) => {
        if (post) {
            res.status(200).json(post);
        } else {
            res.status(404).json({ message: "Post not found" });
        }
    });
});

//UPDATE a review

router.put("/posts/:id", (req, res, next) => {
    const post = new Post({
        _id: req.body.id,
        title: req.body.title,
        rating: req.body.rating,
        content: req.body.content,
    });
    Post.updateOne({ _id: req.params.id }, post).then((result) => {
        console.log(result);
        res.status(200).json({ message: "Update Successful!" });
    });
});

// GET all the reviews

router.get("/posts", (req, res, next) => {
    Post.find().then((documents) => {
        res.status(200).json({
            message: "Posts fetched successfully!",
            posts: documents,
        });
    });
});

//Delete a Review

router.delete("/posts/:id", (req, res, next) => {
    Post.deleteOne({ _id: req.params.id }).then((result) => {
        console.log(result);
        res.status(200).json({ message: "Post deleted!" });
    });
});

////// Reviews ///////

// Authentication //

// Token Verification//

function verifyToken(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send("Unauthorized Request");
    }
    let token = req.headers.authorization.split(" ")[1];

    if (token === null) {
        return res.status(401).send("Unauthorized Request");
    }

    let payload = jwt.verify(token, "secretKey");

    if (!payload) {
        return res.status(401).send("Unauthorized Request");
    }

    req.userId = payload.subject;
    next();
}

//
//API Test
router.get("/", function(req, res) {
    res.send("From API Route");
});

// User Registration API//
router.post("/register", (req, res) => {
    let userData = req.body;
    let user = new User(userData);
    user.save((error, registeredUser) => {
        if (error) {
            console.log(error);
        } else {
            let payload = { subject: registeredUser._id };
            let token = jwt.sign(payload, "secretKey");
            res.status(200).send({ token });
        }
    });
});
//

// User Login API//
router.post("/login", (req, res) => {
    let userData = req.body;
    User.findOne({ email: userData.email }, (error, user) => {
        if (error) {
            console.log(error);
        } else {
            if (!user) {
                res.status(404).send("Invalid email");
            } else if (user.password !== userData.password) {
                res.status(401).send("Invalid password");
            } else {
                let payload = { subject: user._id };
                let token = jwt.sign(payload, "secretKey");
                res.status(200).send({ token });
            }
        }
    });
});

router.get("/home", verifyToken, (req, res) => {
    let events = [];
    res.json(events);
});

// Authentication //
//
module.exports = router;