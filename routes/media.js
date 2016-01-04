var express = require('express');
var router = express.Router();
var _ = require('underscore');

var mongoose = require('mongoose');
var Media = mongoose.model('Media');

var d = require('domain').create()

// Intentional noop - only fired when a file upload is aborted and the actual
// error will be properly passed to the function callback below
d.on('error', function() {})

// Multiple files upload
router.post('/uploadfiles', action_upload_files);

router.get('/list/files', action_list_files);

router.get('/list/:filetype', action_list_filetype);

router.delete('/file/:id', action_delete_file);

function action_upload_files(req, res) {
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

        // Validate file type
        //        if (_.indexOf(settings.allowedTypes, headers['content-type']) === -1) {
        //            validated = false;
        //            uploadFile.upload({}, function (err, result) {
        //                return res.status(400).send({error: 'error.file.type.wrong'});
        //            });
        //        }

        // Validate file size
        //        if (byteCount > settings.maxBytes) {
        //            validated = false;
        //            uploadFile.upload({}, function (err, callback) {
        //                return res.status(400).send({error: "Upload limit of 10000000 bytes exceeded"});
        //                //return res.status(400).send({error: 'error.file.size.exceeded'});
        //            });
        //
        //        }
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
                        var data = {};
                        var type = list.type;
                        var filetype = type.split("/");
                        list.filetype = filetype[0];
                        list.srctype = list.type;
                        list.org_filename = list.filename;
                        list.location = list.extra.Location;
                        list.filename = list.fd;
                        delete list.extra;
                        delete list.type;
                        delete list.filename;
                        delete list.fd;
                        var media = new Media(list);
                        media.save(function(err, media) {
                            if (err || !media) {
                                console.log(err);
                            } else {
                                resultArray.push(media);
                                if (index === filesUploaded.length - 1) {
                                    return res.json({
                                        files: resultArray
                                    });
                                }
                            }
                        });


                    });


                }


            });
        })

    }
}

function action_list_files(req, res, next) {
    console.log(req.query);
    Media.find({}, {}, {
        limit: req.query.limit ? req.query.limit : null,
        sort: req.query.sort ? req.query.sort : "size",
        skip: req.query.skip ? req.query.skip : null
    }, function(err, user) {
        if (err) {
            res.json(err);
        } else {
            res.json(user);
        }
    });
}

function action_list_filetype(req, res, next) {
    if (!req.params.filetype) {
        return res.status(400).send({
            error: "fileType required"
        });
    }

    Media.find({
            'filetype': req.params.filetype
        }, {}, {
            limit: req.query.limit ? req.query.limit : null,
            sort: req.query.sort ? req.query.sort : "size",
            skip: req.query.skip ? req.query.skip : null
        },
        function(err, user) {
            if (err) {
                res.json(err);
            } else {
                res.json(user);
            }
        });
}



function action_delete_file(req, res) {
    if (!req.params.id) {
        return res.status(400).send({
            error: "fileid required"
        });
    }
    Media.findByIdAndRemove(req.params.id, function(err, file) {
        if (!err) {
            res.json({
                "message": "successfully deleted"
            });
        } else {
            res.json(err);
            //res.send("error in removing user" + err);
        }

    });
}


module.exports = router;
