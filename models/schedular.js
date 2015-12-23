module.exports = function(mongoose) {
    "use strict";
    var Schema = mongoose.Schema;

    var schedularSchema = new Schema({
        userid: String,
        playlist_id: String,
        assets_count: String,
        video_duration: String,
        start_time: String,
        end_time: String,
        week_days: Array,
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
