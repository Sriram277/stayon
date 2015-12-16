module.exports = function (mongoose) {
    "use strict";
    var Schema = mongoose.Schema;

    var mediaSchema = new Schema({
        useridfk: String,
        org_filename: String,
        filename: {type:String},
        filetype:String,
        format: String,
        size:Number,
        width:String,
        height: String,
        duration: String,
        status: String,
        location: String,
        created_on: {type: Date, "default": Date.now}
    },{ strict: false });



/*
CREATE TABLE `dw_media` (
  `mediaidpk` int(15) NOT NULL,
  `useridfk` int(11) NOT NULL,
  `org_filename` varchar(250) NOT NULL,
  `filename` varchar(300) NOT NULL,
  `filetype` varchar(5) NOT NULL,
  `format` varchar(10) NOT NULL,
  `size` double NOT NULL,
  `width` varchar(4) NOT NULL DEFAULT '0',
  `height` varchar(4) NOT NULL DEFAULT '0',
  `duration` float NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL,
  `created_on` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
*/
    
    
    var Media = mongoose.model('Media', mediaSchema);

    return Media;
};