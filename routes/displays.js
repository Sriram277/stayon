var express = require('express');
var router = express.Router();
var _ = require('underscore');

var mongoose = require('mongoose');
var Display = mongoose.model('Display');
var Device = mongoose.model('Device');


router.post('/save', action_save_displays);

router.get('/list/displays', action_list_displays);

router.delete('/delete/:id', action_remove_display);

router.put('/edit/:id', action_edit_display);

function action_save_displays(req, res) {
    if(!req.body){
        return res.status(400).send({error:"body should not be empty"});
    }
    var displays = req.body;
    Device.findOne({random_key: displays.random_key}, function(err,deviceinfo){
       if(err || !deviceinfo){
           return res.status(500).send({error:"random_key not matched"});
       }else{
           var display = new Display(displays);
           display.save(function (err, display) {
               if (err || !display) {
                   res.status(500).send(err);
               }
               else {
                   return res.json(display);
               }
           });
       }
    })

}

function action_list_displays(req, res, next) {
    Display.find({}, {}, { limit: req.query.limit ? req.query.limit : null,
        sort: req.query.sort ? req.query.sort : "size",
        skip: req.query.skip ? req.query.skip : null }, function (err, display) {
        if (err) {
            res.json(err);
        } else {
            res.json(display);
        }
    });
}

function action_remove_display(req, res) {
    if (!req.params.id) {
        return res.status(400).send({error: "fileid required"});
    }
    Display.findByIdAndRemove(req.params.id, function (err, display) {
        if (!err) {
            res.send("successfully file deleted" + display);
        } else {
            res.send("error in removing user" + err);
        }

    });
}

function action_edit_display(req, res){
    Display.findOneAndUpdate({_id: req.params.id}, req.body, {upsert: true}, function (err, display) {
        if (!err) {
            return res.status(200).send("Successfully Updated");
        } else {
            res.status(500).send("error in updating Request" + err);
        }
    });
}


module.exports = router;


