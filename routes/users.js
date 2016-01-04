var express = require('express');
var router = express.Router();
var _ = require('underscore');
var jwt = require("jsonwebtoken");
var mongoose = require('mongoose');
var auth = require('../config/auth.js');


var User = mongoose.model('User');


/* GET users listing. */
router.get('/list', function(req, res, next) {
    res.json({
        message: 'respond with a resource'
    });
});

router.post('/register', action_add_user);
router.post('/login', action_login_user);
router.post('/register', action_register_user);
router.get('/me', auth.ensureAuthorized, action_register_user);


function action_add_user(req, res) {
    var reqBody = req.body;
    console.log(reqBody);
    if (!reqBody) {
        return res.status(400).send({
            error: "Body should not be empty"
        });
    }
    if (!reqBody.password) {
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

function action_login_user(req, res) {
    User.findOne({
        username: req.body.username,
        password: req.body.password
    }, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            if (user) {
                res.json({
                    "message": "success"
                });
            } else {
                res.json({
                    type: false,
                    data: "Incorrect email/password"
                });
            }
        }
    });
}

function action_register_user(req, res) {
    User.findOne({
        email: req.body.email
    }, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            if (user) {
                res.json({
                    type: false,
                    data: "User already exists!"
                });
            } else {
                var userModel = new User();
                userModel.email = req.body.email;
                userModel.password = req.body.password;
                userModel.save(function(err, user) {
                    user.token = jwt.sign(user, process.env.JWT_SECRET);
                    user.save(function(err, user1) {
                        res.json({
                            type: true,
                            data: user1,
                            token: user1.token
                        });
                    });
                })
            }
        }
    });

}

function me(req, res) {
    console.log("me");
}

module.exports = router;
