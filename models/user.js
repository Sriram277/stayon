module.exports = function(mongoose) {
    "use strict";
    var Schema = mongoose.Schema;
    var usersSchema = new Schema({
        fullname: String,
        password: String,
        email: String,
        dateofbirth: Date,
        gender: {
            type: 'string',
            enum: [
                'M',
                'F',
                'O'
            ],
            defaultsTo: 'M'
        },
        timezone: String,
        country: String,
        state: String,
        city: String,
        subscription: String,
        user_role: String,
        activation_key: String,
        activation_valid_upto: Date,
        status: String,
        created_on: {
            type: Date,
            "default": Date.now
        }
    }, {
        strict: false
    });

    var User = mongoose.model('User', usersSchema);

    return User;
};
