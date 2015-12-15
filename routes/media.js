var express = require('express');
var router = express.Router();
var _ = require('underscore');


// Multiple files upload
router.post('/uploadfiles', function(req, res, next) {
    var validated = true,
        settings = {
            allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
            maxBytes: 10 * 1024 * 1024
        }, uploadFile = req.file('content');

    if (uploadFile && uploadFile._files.length !== 0) {

        var upload = uploadFile._files[0].stream,
            headers = upload.headers,
            byteCount = upload.byteCount

//        // Validate file type
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
                _.each(filesUploaded, function (list, index) {

                    list.url = list.extra.Location;
                    delete list.extra;

                });

                return res.json({
                    files: filesUploaded
                });
            }


        });
    }
});


module.exports = router;


