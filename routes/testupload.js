var express = require('express');
var global = require('../config/global.js');


var router = express.Router();
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var fs = require('fs');
var ffmpeg = require('fluent-ffmpeg');

AWS.config.update({
    accessKeyId: "AKIAJ57OGHEUSFKPWXMA",
    secretAccessKey: "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",
    region: 'us-east-1'
});



router.get('/s3upload', action_upload_test);


function action_upload_test(req, res) {

    var input = s3.getObject(params);

    var params = {
        Bucket: 'stay-on',
        Key: 'e7794b74-717c-4981-8976-b110c75e5df4.jpg'
    };
    var file = require('fs').createWriteStream('./file.jpg');
    s3.getObject(params).createReadStream().pipe(file);


    /*var stream = fs.createWriteStream('./screenshot.png');
    return ffmpeg(input).screenshots({
        timestamps: ['0.1', '0.2'],
        size: '200x200'
    }).output('./screenshot.png').output(stream).on('error', function(err) {
        console.log(err);
        return done(err);
    }).on('end', function() {
        console.log("i asd");
        input.close();
        var _key = "files/" + "thumbnail.png";
        return s3.putObject({
            Bucket: "stay-on",
            Key: _key,
            Body: stream,
            ContentType: 'image/jpeg'
        }, function(err) {
            console.log(err);
        });
    });*/

    console.log("i dont know");


}

module.exports = router;
