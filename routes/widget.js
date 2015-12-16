var express = require('express');
var router = express.Router();
var _ = require('underscore');

var mongoose = require('mongoose');
var Widget = require('../models/widget')(mongoose);


// Multiple files upload
router.post('/save', action_save_widgets);

router.get('/list/files', action_list_widgets);

router.delete('/delete/:id', action_delete_widget);

function action_save_widgets(){

}

function action_list_widgets(req, res, next) {
    console.log(req.query);
    Widget.find({},{}, { limit: req.query.limit ? req.query.limit : null,
        sort: req.query.sort ? req.query.sort : "size",
        skip: req.query.skip ? req.query.skip : null }, function (err, widget) {
        if (err) {
            res.json(err);
        } else {
            res.json(widget);
        }
    });
}

function action_delete_widget(req, res) {
    if(!req.params.id){
        return res.status(400).send({error: "fileid required"});
    }
    Widget.findByIdAndRemove(req.params.id, function (err, file) {
        if (!err) {
            res.send("successfully file deleted" + file);
        }else{
            res.send("error in removing user"+ err);
        }

    });
}


module.exports = router;


