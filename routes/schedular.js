var express = require('express');
var router = express.Router();
var _ = require('underscore');

var mongoose = require('mongoose');
var Schedular = mongoose.model('Schedular');



router.post('/save', action_save_schedular);

router.get('/list', action_list_schedular);

router.delete('/delete/:id', action_delete_schedular);

router.put('/edit/:id', action_edit_schedular);

function action_save_schedular(req, res) {
    var reqBody = req.body;
    console.log(reqBody);
    if(!reqBody){
        return res.status(400).send({error:"Body should not be empty"});
    }
    
    var schedular = new Schedular(req.body);
    schedular.save(function (err, doc) {
    	if(err) {
    		res.json(err);
    	}else {
    		res.json(doc);
    	}
    });
}

function action_list_schedular(req, res, next) {
    Schedular.find({}, {}, { limit: req.query.limit ? req.query.limit : null,
        sort: req.query.sort ? req.query.sort : "size",
        skip: req.query.skip ? req.query.skip : null }, function (err, schedular) {
        if (err) {
            res.json(err);
        } else {
            res.json(schedular);
        }
    });
}


function action_delete_schedular(req, res) {
	if (!req.params.id) {
		return res.status(400).send({error:"Something wrong"});
	}
	Schedular.findByIdAndRemove(req.params.id, function (err, doc) {
		 if (!err) {
            res.json({
                "msg": "successfully file deleted"
            });
        } else {
            res.json(err);
        }
	});
}


function action_edit_schedular(req, res) {
    Schedular.findOneAndUpdate({
        _id: req.params.id
    }, req.body, {
        upsert: true
    }, function(err, schedular) {
        if (!err) {
            return res.json(schedular);
        } else {
            res.json(err);
        }
    });
}


module.exports = router;


