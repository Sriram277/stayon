var express = require('express');
var router = express.Router();
var _ = require('underscore');
var global = require('../config/global.js');

var mongoose = require('mongoose');
var Schedular = mongoose.model('Schedular');
var Playlist = mongoose.model('Playlist');
var ScheduleDisplay = mongoose.model('ScheduleDisplay');


router.post('/save', action_save_schedular);

router.get('/list', action_list_schedular);

router.get('/list/:locations', fetch_loc_schedulars);

router.get('/list/:locations/:categories', fetch_loc_cat_schedulars);

router.get('/list/:locations/:categories/:displays', fetch_loc_cat_disp_schedulars);

router.delete('/delete/:id', action_delete_schedular);

router.put('/edit/:id', action_edit_schedular);

router.get('/get/:id', action_getone_schedular);

function action_save_schedular(req, res) {
    var reqBody = req.body;
    if (!reqBody) {
        return res.status(400).send({
            error: "Body should not be empty"
        });
    }

    var schedular = new Schedular(req.body);
    schedular.save(function(err, doc) {
        if (err) {
            res.json(err);
        } else {
            var scheduledisplay = new ScheduleDisplay();
            _.each(doc.displays, function(display, count) {
                console.log(display);
                var dataObject = {};
                dataObject.display_id = display.id;
                dataObject.schedular_id = doc.id;
                dataObject.schedularsync = "No";
                scheduledisplay.save(dataObject, function(err, docs) {
                    console.log(docs);
                    console.log(display.id);
                });

            });

            var starttime = new Date(doc.start_time);
            var endtime = new Date(doc.start_time);
            var finalObj = {};

            var playerlist = [];
            finalObj.schedular_id = doc._id;
            finalObj.start_time = doc.start_time;
            finalObj.end_time = doc.end_time;
            Playlist.findOne({
                "_id": doc.playlist_id
            }, function(err, result) {
                var play_list = result.play_list;
                _.each(play_list, function(list, count) {
                    endtime = new Date(endtime.getTime() + list.duration * 60 * 1000);
                    //console.log(endtime + "---------" + list.duration);
                    playerlist.push({
                        "start_time": doc.start_time,
                        "end_time": doc.end_time,
                        "location": list.location,
                        "filetype": list.filetype,
                        "duration": list.duration
                    });
                    starttime = new Date(starttime.getTime() + list.duration * 60 * 1000);
                    if (play_list.length === count + 1) {
                        //console.log(playerlist);
                        finalObj.medialist = playerlist;
                        console.log(finalObj);
                        var displays = reqBody.displays;
                        if (displays) {
                            _.each(displays, function(display, index) {
                                if (global.clients[display]) {
                                    console.log(display);
                                    global.clients[display].emit('scheduledlist', finalObj);
                                }
                                // if (displays.length = index + 1) {

                                //}
                            });
                        }
                    }
                });
                res.json(doc);
            });

        }
    });
}

// function action_save_schedular(req, res) {
//     var reqBody = req.body;
//     console.log(reqBody);
//     if(!reqBody){
//         return res.status(400).send({error:"Body should not be empty"});
//     }

//     var schedular = new Schedular(req.body);
//     schedular.save(function (err, doc) {
//      if(err) {
//          res.json(err);
//      }else {
//             var displays =  reqBody.displays;
//             if(displays){
//                 _.each(displays, function (display, index) {
//                     global.clients[display].emit('ping');
//                     if(displays.length = index +1){
//                         res.json(doc);
//                     }
//                 });
//             }
//      }
//     });
// }

function fetch_loc_schedulars(req, res, next) {
    console.log("i m in first");
    Schedular.find({
        "locations": req.params.locations
    }, {}, {
        limit: req.query.limit ? req.query.limit : null,
        sort: req.query.sort ? req.query.sort : "size",
        skip: req.query.skip ? req.query.skip : null
    }, function(err, schedular) {
        if (err) {
            res.json(err);
        } else {
            res.json(schedular);
        }
    });
}


function fetch_loc_cat_schedulars(req, res, next) {
    console.log("i m in second");
    Schedular.find({
        "locations": req.params.locations,
        "categories": req.params.categories
    }, {}, {
        limit: req.query.limit ? req.query.limit : null,
        sort: req.query.sort ? req.query.sort : "size",
        skip: req.query.skip ? req.query.skip : null
    }, function(err, schedular) {
        if (err) {
            res.json(err);
        } else {
            res.json(schedular);
        }
    });
}

function fetch_loc_cat_disp_schedulars(req, res, next) {
    console.log("I m  third");
    console.log(req.params);
    Schedular.find({
        "locations": req.params.locations,
        "categories": req.params.categories,
        "displays": {
            "$in": [req.params.displays]
        }
    }, {}, {
        limit: req.query.limit ? req.query.limit : null,
        sort: req.query.sort ? req.query.sort : "size",
        skip: req.query.skip ? req.query.skip : null
    }, function(err, schedular) {
        if (err) {
            res.json(err);
        } else {
            res.json(schedular);
        }
    });
}


function action_list_schedular(req, res, next) {
    Schedular.find({}, {}, {
        limit: req.query.limit ? req.query.limit : null,
        sort: req.query.sort ? req.query.sort : "size",
        skip: req.query.skip ? req.query.skip : null
    }, function(err, schedular) {
        if (err) {
            res.json(err);
        } else {
            res.json(schedular);
        }
    });
}


function action_delete_schedular(req, res) {
    if (!req.params.id) {
        return res.status(400).send({
            error: "Something wrong"
        });
    }
    Schedular.findByIdAndRemove(req.params.id, function(err, doc) {
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

function action_getone_schedular(req, res) {
    var schedular_id = req.params.id;
    Schedular.findOne({
        "_id": schedular_id
    }).populate('playlist_id').exec(function(err, schedular) {
        if (err) {
            res.json(err);
        } else {
            res.json(schedular);
        }
    });
}

module.exports = router;
