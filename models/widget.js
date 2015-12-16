//`useridfk` int(11) NOT NULL,
//`widgetname` varchar(100) NOT NULL,
//`type` varchar(150) NOT NULL,
//`embbedcode` varchar(500) NOT NULL,
//`settings` text NOT NULL,
//`thumbnailurl` varchar(500) NOT NULL,
//`created_on` datetime NOT NULL,
//`updated_on` datetime NOT NULL,

module.exports = function (mongoose) {
    "use strict";
    var Schema = mongoose.Schema;

    var mediaSchema = new Schema({
        useridfk: String,
        widgetname: String,
        type: String,
        embbedcode:String,
        settings:{type: Object} ,
        thumbnailurl:String,
        created_on: {type: Date, "default": Date.now},
        updated_on: {type: Date, "default": Date.now}
    },{ strict: false });

    var Widget = mongoose.model('Widget', mediaSchema);

    return Widget;
};