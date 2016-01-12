
module.exports = function (mongoose) {
    "use strict";
    var Schema = mongoose.Schema;

    var socketsinkSchema = new Schema({
        random_key:{
           type: String,
           unique: true
        } ,
        sockey_key:{
           type: String,
           unique: true
        } ,
        created_on: {type: Date, "default": Date.now},
        updated_on: {type: Date, "default": Date.now}
    },{ strict: false });

    var Socketsink = mongoose.model('Socketsink', socketsinkSchema);

    return Socketsink;
};