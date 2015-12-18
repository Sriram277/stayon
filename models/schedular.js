module.exports = function (mongoose) {
    "use strict";
    var Schema = mongoose.Schema;

    var schedularSchema = new Schema({
        starttime: String,
        endtime: String,
        playlist: Array
    },{ strict: true });
    
    
    var Schedular = mongoose.model('Schedular', schedularSchema);

    return Schedular;
};