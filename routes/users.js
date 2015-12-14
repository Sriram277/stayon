var express = require('express');
var router = express.Router();
var _ = require('underscore');

var mongoose = require('mongoose');

var User = require('../models/user')(mongoose);
var morgan = require("morgan");

/* GET users listing. */
router.get('/list', function(req, res, next) {
  res.json({message:'respond with a resource'});
});

router.post('/add', action_add_user);

function action_add_user(req,res){
    var name = req.body.name;
    var email = req.body.email;

    var user = new User({ name: name, email: email});

    user.save(function (err, user) {
        if(err){
            res.send(500,err);
        }
        if (!err) {
            res.send(user);
        }
    });
}


module.exports = router;
