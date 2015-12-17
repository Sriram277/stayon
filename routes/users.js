var express = require('express');
var router = express.Router();
var _ = require('underscore');

var mongoose = require('mongoose');

var User = mongoose.model('User');
var morgan = require("morgan");

/* GET users listing. */
router.get('/list', function(req, res, next) {
    res.json({
        message: 'respond with a resource'
    });
});

router.post('/register', action_add_user);
router.post('/login', loginuser);

function action_add_user(req, res) {
    var reqBody = req.body;
    console.log(reqBody);
    if (!reqBody) {
        return res.status(400).send({
            error: "Body should not be empty"
        });
    }
    if (reqBody.password) {
        return res.status(400).send({
            error: "Password is required"
        });
    }

    var user = new User(reqBody);

    user.save(function(err, user) {
        if (err) {
            res.send(500, err);
        }
        if (!err) {
            res.send(user);
        }
    });
}

function loginuser(req, res) {
    var reqBody = req.body;
    console.log(reqBody);
    if (!reqBody) {
        return res.status(400).send({
            error: "Body should not be empty"
        });
    }
    if (reqBody.password) {
        return res.status(400).send({
            error: "Password is required"
        });
    }
    user.find({
        email: reqBody.email
    }, function(err, doc) {
        console.log(doc);
    });


}

module.exports = router;
