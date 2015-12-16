module.exports = function(mongoose) {
    "use strict";
    var Schema = mongoose.Schema;

    var schedulerSchema = new Schema({
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
        strict: false
    });

    var Scheduler = mongoose.model('Scheduler', schedulerSchema);
    return Scheduler;
};
