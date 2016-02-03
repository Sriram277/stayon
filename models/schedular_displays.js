module.exports = function(mongoose) {
    "use strict";
    var Schema = mongoose.Schema;

    var ScheduledisplaysSchema = new Schema({
        display_id: String,
        schedular_id: String,
        schedularsync: String,
        created_on: {
            type: Date,
            "default": Date.now
        }
    }, {
        strict: false
    });

    var ScheduleDisplay = mongoose.model('ScheduleDisplay', ScheduledisplaysSchema);

    return ScheduleDisplay;
};
