
module.exports = function (mongoose) {
    "use strict";
    var Schema = mongoose.Schema;

    var trackstatusSchema = new Schema({
        random_key:{
            type: String
        },
        devicestatus:String,
        playerstatus:String,
        devicekey:String,
        created_on: {type: Date, "default": Date.now},
        updated_on: {type: Date, "default": Date.now}
    },{ strict: false });

    var TrackStatus = mongoose.model('TrackStatus', trackstatusSchema);

    return TrackStatus;
};