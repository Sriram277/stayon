module.exports = function(mongoose) {
    "use strict";
    var Schema = mongoose.Schema;

    var schedularSchema = new Schema({
        userid: String,
        action_performed: String,
        playeridfk: String,
        channel: String,
        mediatype: String,
        mediaid: String,
        start: String,
        end: String,
        created_on: {
            type: Date,
            "default": Date.now
        }
    }, {
        strict: true
    });


    var Schedular = mongoose.model('Schedular', schedularSchema);

    return Schedular;
};
