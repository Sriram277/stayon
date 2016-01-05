var express = require('express');
var router = express.Router();
var _ = require('underscore');
var randomstring = require("randomstring");

var mongoose = require('mongoose');
var Device = mongoose.model('Device');

router.post('/save', action_save_device);

router.get('/list/device', action_list_devices);


router.get('/info/:key', action_get_device);

router.get('/list/locations', action_get_locations);


router.delete('/delete/:id', action_remove_device);

router.put('/edit/:id', action_edit_device);

function action_save_device(req, res) {
    if (!req.body) {
        return res.status(400).send({
            error: "body should not be empty"
        });
    }
    var deviceInfo = req.body;
    deviceInfo.random_key = randomstring.generate(8);
    // >> "xqm5wXX"

    var device = new Device(deviceInfo);
    device.save(function(err, device) {
        if (err || !device) {
            res.status(500).send(err);
        } else {
            return res.json(device);
        }
    });
}

function action_list_devices(req, res, next) {
    Device.find({}, {}, {
        limit: req.query.limit ? req.query.limit : null,
        sort: req.query.sort ? req.query.sort : "size",
        skip: req.query.skip ? req.query.skip : null
    }, function(err, device) {
        if (err) {
            res.json(err);
        } else {
            res.json(device);
        }
    });
}


function action_get_locations(req, res, next) {
    Device.distinct('city', function(err, device) {
       // console.log(device);
        if (err) {
            res.json(err);
        } else {
            res.json(device);
        }
    });
}



function action_remove_device(req, res) {
    if (!req.params.id) {
        return res.status(400).send({
            error: "fileid required"
        });
    }
    Device.findByIdAndRemove(req.params.id, function(err, device) {
        if (!err) {
            res.send("successfully file deleted" + device);
        } else {
            res.send("error in removing user" + err);
        }

    });
}

function action_get_device(req, res) {
    if (!req.params.key) {
        return res.status(400).send({
            error: "fileid required"
        });
    }
    Device.findOne({
        'random_key': req.params.key
    }, {}, {
        limit: req.query.limit ? req.query.limit : null,
        sort: req.query.sort ? req.query.sort : "size",
        skip: req.query.skip ? req.query.skip : null
    }, function(err, device) {
        if (err) {
            res.json(err);
        } else {
            res.json(device);
        }
    });
}


function action_edit_device(req, res) {
    Device.findOneAndUpdate({
        _id: req.params.id
    }, req.body, {
        upsert: true
    }, function(err, device) {
        if (!err) {
            return res.status(200).send("Successfully Updated");
        } else {
            res.status(500).send("error in updating Request" + err);
        }
    });
}


module.exports = router;
