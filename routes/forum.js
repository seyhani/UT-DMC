'use strict';
const express = require("express");
const router  = express.Router();
const Clar = require(`../models/clarification`);
var middleware = require("../middleware");
router.all("/*",middleware.isLoggedIn);

router.get(`/getClars`, (req, res) => {
    Clar.find({author: req.user.id}, (err, docs) => {
        if(err) {
            console.error(`routes -> forum: getClars`);
            console.error(err);
            res.status(500).json({messages: []});
        }
        Clar.find({author: `Admin`}, (err, adminDocs) => {
            if(err) {
                console.error(`routes -> forum: getClars of Admin`);
                console.error(err);
                res.status(500).json({messages: []});
            }
            let retVal = adminDocs.concat(docs);
            for(let i = 0;i < retVal.length; ++i) {
                retVal[i].id = retVal[i]._id;
                delete retVal[i]._id;
                delete retVal[i].__v;
            }
            res.json({messages: retVal});
        });
    });
});

router.post(`/postClar`, (req, res) => {
    let newClar = new Clar({
        text: req.clar.message,
        author: req.user.id,
        inReplyTo: req.clar.inReplyTo
    });
    newClar.save( (err) => {
        if(err) {
            console.error(`routes -> forum: postClar`);
            console.error(err);
        }
    });
});

router.get(`/messages`, (req, res) => { //responds only to admin
    if(req.user.isAdmin) {
        Clar.find({}, (err, docs) => {
            if(err) {
                console.error(`routes -> forum:-get- messages`);
                console.error(err);
            }
            res.json({messages: docs});
        });
    }
    else
        res.json({messages: []});
});

router.post(`/messages`, (req, res) => { //responds only to admin
    if(req.user.isAdmin) {
        let newClar = new Clar({
            text: req.clar.message,
            author: `Admin`,
            inReplyTo: req.clar.inReplyTo
        });
        newClar.save( (err) => {
            if(err) {
                console.error(`routes -> forum:-post- messages`);
                console.error(err);
            }
        });
    }
    res.status(401);
});

module.exports = router;
