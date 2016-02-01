
var findOrCreate = require('mongoose-findorcreate');
module.exports = function (mongoose) {
    "use strict";
    var Schema = mongoose.Schema;

    var categorySchema = new Schema({
        useridfk: String,
        category_name: String,
        created_on: {type: Date, "default": Date.now},
        updated_on: {type: Date, "default": Date.now}
    },{ strict: false });

    categorySchema.plugin(findOrCreate);
    var Categories = mongoose.model('Categories', categorySchema);
    
    return Categories;
};