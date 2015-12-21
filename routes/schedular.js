var express = require('express');
var router = express.Router();
var _ = require('underscore');

var mongoose = require('mongoose');
var Schedular = mongoose.model('Schedular');



router.post('/save', action_save_schedular);
router.delete('/delete/:id', action_delete_schedular);

function action_save_schedular(req, res) {
    var reqBody = req.body;
    console.log(reqBody);
    if(!reqBody){
        return res.status(400).send({error:"Body should not be empty"});
    }
    
    var schedular = new Schedular(reqBody);
    schedular.save(function (err, doc) {
    	if(err) {
    		res.json(err);
    	}else {
    		res.json(doc);
    	}
    });
}

function action_delete_schedular(req, res) {
	if (!req.params.id) {
		return res.status(400).send({error:"Something wrong"});
	}
	Schedular.findByIdAndRemove(req.params.id, function (err, doc) {
		if(!err) {
			res.send("successfully file deleted");
		}else {
			res.send("Error in removing user" + err);
		}
	});

}


module.exports = router;


