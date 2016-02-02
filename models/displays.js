module.exports = function(mongoose) {
    "use strict";
    var Schema = mongoose.Schema;

    var displaySchema = new Schema({
        useridfk: String,
        random_key: {
            type: String,
            unique: true
        },
        devicesync: {
            type: String,
            default: "false"
        },
        device_info: {
            type: Schema.ObjectId,
            ref: 'Device'
        },
        displayname: String,
        type: String,
        embbedcode: String,
        group:String,
        locationId: String,
        settings: {
            type: Object
        },
        thumbnailurl: String,
        created_on: {
            type: Date,
            "default": Date.now
        },
        updated_on: {
            type: Date,
            "default": Date.now
        }
    }, {
        strict: false
    });

    var Display = mongoose.model('Display', displaySchema);

    return Display;
};
