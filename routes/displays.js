var express = require('express');
var global = require('../config/global.js');

var router = express.Router();
var _ = require('underscore');

var mongoose = require('mongoose');
var Display = mongoose.model('Display');
var Device = mongoose.model('Device');

var d = require('domain').create()

router.post('/save', action_save_displays);

router.get('/list/displays', action_list_displays);

router.delete('/delete/:id', action_remove_display);

router.put('/edit/:id', action_edit_display);

router.post('/upload/file', action_upload_file);

router.get('/list/locations', action_get_locations);


router.get('/categories/:locations', action_get_categories);

router.get('/category/:location', action_get_categories1);

router.get('/displays/:cat_id', action_get_displays);

router.get('/displays/:city/:cat_id', action_get_displays1);

function action_save_displays(req, res) {
    if (!req.body) {
        return res.status(400).send({
            error: "body should not be empty"
        });
    }
    var displays = req.body;
    Device.findOne({
        random_key: displays.random_key
    }, function(err, deviceinfo) {
        if (err || !deviceinfo) {
            return res.status(500).send({
                error: "random_key not matched"
            });
        } else {
            displays.device_info = deviceinfo.id;
            displays.devicesync = "false";
            var display = new Display(displays);
            display.save(function(err, display) {
                console.log(err)
                console.log(display);
                if (err || !display) {
                    res.status(500).send(err);
                } else {
                    res.json(display);
                    if (global.clients[display.random_key]) {
                        global.clients[display.random_key].emit('displaycreated', display);
                    }
                }
            });
        }
    })
}

function action_list_displays(req, res, next) {
    Display.find({}, {}, {
            limit: req.query.limit ? req.query.limit : null,
            sort: req.query.sort ? req.query.sort : "size",
            skip: req.query.skip ? req.query.skip : null
        }).populate('device_info')
        .exec(function(err, display) {
            if (err) {
                res.json(err);
            } else {
                res.json(display);
            }
        });
}


function action_get_locations(req, res, next) {
    Display.distinct('city', function(err, locations) {
        // console.log(device);
        if (err) {
            res.json(err);
        } else {
            res.json(locations);
        }
    });
}





function action_remove_display(req, res) {
    if (!req.params.id) {
        return res.status(400).send({
            error: "fileid required"
        });
    }

    Display.findOne({
        "_id": req.params.id
    }, function(err, display) {
        if (!err) {
            Device.findOne({
                "random_key": display.random_key
            }, function(err, device) {
                if (!err) {
                    Device.findByIdAndRemove(device._id, function(err) {
                        if (!err) {
                            Display.findByIdAndRemove(req.params.id, function(err, display) {
                                if (!err) {
                                    res.json({
                                        "message": "Successfully deleted"
                                    });
                                } else {
                                    res.json(err);
                                }
                            });
                        } else {
                            console.log(err);
                        }
                    });
                } else {
                    console.log("blocked 2");
                }
            });
        } else {
            console.log("blocked 1");
        }
    });
}

function action_edit_display(req, res) {
    Display.findOneAndUpdate({
        _id: req.params.id
    }, req.body, {
        upsert: true
    }, function(err, display) {
        console.log(err);
        console.log(display);
        if (!err) {
            if (display) {
                if (global.clients[display.random_key]) {
                    global.clients[display.random_key].emit('editdisplay_updated', display);
                }
            }
            res.json(display);
        } else {
            res.json(err);
        }
    });
}

function action_upload_file(req, res) {
    var validated = true,
        settings = {
            allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
            maxBytes: 10 * 1024 * 1024
        },
        uploadFile = req.file('file');

    if (uploadFile && uploadFile._files.length !== 0) {

        var upload = uploadFile._files[0].stream,
            headers = upload.headers,
            byteCount = upload.byteCount
    } else {
        console.log("empty");
        validated = false;
        uploadFile.upload({}, function(err, callback) {
            return res.status(400).send({
                error: 'error.file.upload.empty'
            });
        });

    }
    if (validated) {
        console.log("Started uploading...");
        d.run(function safelyUpload() {
            uploadFile.upload({
                adapter: require('skipper-s3'),
                key: 'AKIAJ57OGHEUSFKPWXMA',
                secret: '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',
                bucket: 'stay-on'
            }, function(err, filesUploaded) {
                var resultArray = [];
                if (err) return res.status(500).send(err);

                else if (filesUploaded.length === 0) {

                    return res.status(400).send({
                        error: 'error.file.upload.empty'
                    });
                } else {
                    _.each(filesUploaded, function(list, index) {

                        list.url = list.extra.Location;
                        delete list.extra;

                    });

                    return res.json({
                        files: filesUploaded
                    });


                }


            });
        })

    }
}

function action_get_categories(req, res, next) {
    console.log("this is test");

    var cat_array = [];
    var keys = [];
    Device.find({
        "city": req.params.locations
    }, {
        "random_key": 1,
        "_id": 0
    }, function(err, randomkeys) {
        if (err) {
            res.json(err);
        } else {
            _.each(randomkeys, function(list, index) {
                keys.push(list.random_key);
            });
            if (keys.length != null)
                console.log(keys);
            Display.find({
                "random_key": {
                    $in: keys
                }
            }, {
                "group": 1,
                "_id": 0
            }, function(err, categories) {
                res.json(categories);
            });

        }
    });
}

function action_get_categories1(req, res, next) {
    Display.find({
        "city": req.params.location
    }, {
        "group": 1,
        "_id": 0
    }, function(err, categories) {
        if (categories) {
            res.json(unique(categories));
        }
        /*   _.uniq(categories, function(item, key, group) {
                console.log(item.group);
            })
            res.json(categories);
        }*/
    });

}

function action_get_displays(req, res, next) {

    Display.find({
        "group": req.params.cat_id
    }, {
        "display_name": 1,
        "_id": 0
    }, function(err, displays) {
        res.json(displays);
    });
}

function action_get_displays1(req, res, next) {

    console.log(req.params)
    Display.find({
        "city": req.params.city,
        "group": req.params.cat_id
    }, {
        "display_name": 1,
        "random_key": 1,
        "_id": 0
    }, function(err, displays) {
        res.json(displays);
    });
}



function unique(obj) {
    var uniques = [];
    var stringify = {};
    for (var i = 0; i < obj.length; i++) {
        var keys = Object.keys(obj[i]);
        keys.sort(function(a, b) {
            return a - b
        });
        var str = '';
        for (var j = 0; j < keys.length; j++) {
            str += JSON.stringify(keys[j]);
            str += JSON.stringify(obj[i][keys[j]]);
        }
        if (!stringify.hasOwnProperty(str)) {
            uniques.push(obj[i]);
            stringify[str] = true;
        }
    }
    return uniques;
}


module.exports = router;
