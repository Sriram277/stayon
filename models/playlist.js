module.exports = function(mongoose) {
    "use strict";
    var Schema = mongoose.Schema;

    var playlistSchema = new Schema({
        useridfk: String,
        widgetname: String,
        type: String,
        embbedcode: String,
        settings: {
            type: Object
        },
        thumbnailurl: String,
        play_list: Array,
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

    var Playlist = mongoose.model('Playlist', playlistSchema);

    return Playlist;
};
