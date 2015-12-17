
module.exports = function (mongoose) {
    "use strict";
    var Schema = mongoose.Schema;

    var deviceSchema = new Schema({
        useridfk: String,
        random_key:{
           type: String,
           unique: true
        } ,
        country: String,
        state:String,
        city:{type: String} ,
        created_on: {type: Date, "default": Date.now},
        updated_on: {type: Date, "default": Date.now}
    },{ strict: false });

    var Device = mongoose.model('Device', deviceSchema);

    return Device;
};