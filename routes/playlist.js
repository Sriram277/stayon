var express = require('express');
var router = express.Router();
var _ = require('underscore');

var mongoose = require('mongoose');
var Playlist = mongoose.model('Playlist');


router.post('/save', action_save_playlist);
router.get('/list/playlist', action_list_playlist);
router.delete('/delete/:id', action_remove_playlist);
router.put('/edit/:id', action_edit_playlist);



function action_save_playlist(req, res) {

    var playlist = new Playlist(req.body);
    playlist.save(function(err, playlist) {
        if (err || !playlist) {
            res.status(500).send(err);
        } else {
            return res.json(playlist);
        }
    });
}

function action_list_playlist(req, res, next) {
    Playlist.find({}, {}, {
        limit: req.query.limit ? req.query.limit : null,
        sort: req.query.sort ? req.query.sort : "size",
        skip: req.query.skip ? req.query.skip : null
    }, function(err, playlist) {
        if (err) {
            res.json(err);
        } else {
            res.json(playlist);
        }
    });
}

function action_remove_playlist(req, res) {
    if (!req.params.id) {
        return res.status(400).send({
            error: "fileid required"
        });
    }
    Playlist.findByIdAndRemove(req.params.id, function(err, file) {
        if (!err) {
            res.json({
                "msg": "successfully file deleted" + file
            });
        } else {
            res.json(err);
        }

    });
}

function action_edit_playlist(req, res) {
    Playlist.findOneAndUpdate({
        _id: req.params.id
    }, req.body, {
        upsert: true
    }, function(err, playlist) {
        if (!err) {
            return res.json(playlist);
        } else {
            res.json(err);
        }
    });
}


module.exports = router;
