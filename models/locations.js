var findOrCreate = require('mongoose-findorcreate');
module.exports = function (mongoose) {
    "use strict";
    var Schema = mongoose.Schema;

    var locationSchema = new Schema({
        useridfk: String,
        city: String,
        latitude: String,
        longitude:String,
        state: String,
        country: String,
        created_on: {type: Date, "default": Date.now},
        updated_on: {type: Date, "default": Date.now}
    },{ strict: false });

    locationSchema.plugin(findOrCreate);
    var Locations = mongoose.model('Locations', locationSchema);

    return Locations;
};