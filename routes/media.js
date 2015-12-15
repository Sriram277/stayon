var express = require('express');
var router = express.Router();
var _ = require('underscore');

var mongoose = require('mongoose');
var Media = require('../models/media')(mongoose);

var d = require('domain').create()

// Intentional noop - only fired when a file upload is aborted and the actual
// error will be properly passed to the function callback below
d.on('error', function () {
})

// Multiple files upload
router.post('/uploadfiles', action_upload_files);

router.post('/add', action_add_media);

router.get('/list/files', action_list_files);

function action_upload_files(req, res) {
    var validated = true,
        settings = {
            allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
            maxBytes: 10 * 1024 * 1024
        }, uploadFile = req.file('content');

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
        uploadFile.upload({}, function (err, callback) {
            return res.status(400).send({error: 'error.file.upload.empty'});
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
            }, function (err, filesUploaded) {

                if (err) return res.status(500).send(err);

                else if (filesUploaded.length === 0) {

                    return res.status(400).send({error: 'error.file.upload.empty'});
                } else {
                    console.log("saving");
                    console.log(filesUploaded.length);
                    var resultArray = [];
                    _.each(filesUploaded, function (list, index) {
                        var data = {};
                        list.filetype = list.type;
                        list.org_filename = list.filename;
                        list.location = list.extra.Location;
                        list.filename = list.fd;
                        delete list.extra;
                        delete list.type;
                        delete list.filename;
                        delete list.fd;
                        console.log(resultArray);
                        var media = new Media(list);
                        media.save(function (err, media) {
                            console.log(media);
                            if(err || !media){
                                console.log(err);
                            }
                            else{
                                resultArray.push(media);
                            }
                        });
                        if (index === filesUploaded.length - 1) {
                            return res.json({
                                files: resultArray
                            });
                        }

                    });


                }


            });
        })

    }
}

function action_add_media(data, cb) {
    var media = new Media(data);
    media.save(function (err, media) {
        console.log(media);
        if (err || !media) {
            cb(err, null);
        }
        else {
            cb(null, media);
        }
    });
}

function action_list_files(req, res, next) {
    function get_users_service(req, res) {
        Media.find({}, function (err, user) {
            if (err) {
                res.json(err);
            } else {
                res.json(user);
            }
        });
    }
}


module.exports = router;


