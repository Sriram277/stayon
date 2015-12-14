var bcrypt = require("bcrypt-nodejs"),
    SALT_WORK_FACTOR = 10,
    MAX_LOGIN_ATTEMPTS = 5,
    LOCK_TIME = 2 * 60 * 60 * 1000;


module.exports = function (mongoose) {
    "use strict";
    var Schema = mongoose.Schema;
//    var TicketSchema = new Schema({
//        ticket_id: String
//    },{ strict: false });

    var usersSchema = new Schema({
        name: String,
        picture: String,
        password : {type:String, select:false, "default":'creatives@1'},
        email: String,
        token: {type:String},
        roles:[String],
//        tickets:[TicketSchema],
//        leaves : [{ type: Schema.ObjectId, ref: 'Leave' }],
        totalLeaves: {type:Number , default: 16},
        leavesRemaining:{type:Number, default: 16},
        leavesTaken:{type:Number, default: 0},
        created_at: {type: Date, "default": Date.now}
    },{ strict: false });


    usersSchema.virtual('isLocked').get(function () {
        return !!(this.lockUntil && this.lockUntil > Date.now());
    });
    usersSchema.pre('save', function (next) {
        var user = this;
        user.updated_at = new Date();
        if (!user.isModified('password')) {
            return next();
        }
        bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, null, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    });

    usersSchema.methods.comparePassword = function (candidatePassword, cb) {
        bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
            if (err) {
                return cb(err);
            }
            cb(null, isMatch);
        });
    };

    usersSchema.methods.incLoginAttempts = function (cb) {
        if (this.lockUntil && this.lockUntil < Date.now()) {
            return this.update({
                $set: { loginAttempts: 1 },
                $unset: { lockUntil: 1 }
            }, cb);
        }
        var updates = { $inc: { loginAttempts: 1 } };
        if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
            updates.$set = { lockUntil: Date.now() + LOCK_TIME };
        }
        return this.update(updates, cb);
    };

    var reasons = usersSchema.statics.failedLogin = {
        NOT_FOUND: 0,
        PASSWORD_INCORRECT: 1,
        MAX_ATTEMPTS: 2
    };


    usersSchema.statics.getAuthenticated = function (username, password, cb) {
        this.findOne({ username: username }, function (err, user) {
            if (err) {
                return cb(err);
            }

            if (!user) {
                return cb(null, null, reasons.NOT_FOUND);
            }
            if (user.isLocked) {
                return user.incLoginAttempts(function (err) {
                    if (err) {
                        return cb(err);
                    }
                    return cb(null, null, reasons.MAX_ATTEMPTS);
                });
            }

            user.comparePassword(password, function (err, isMatch) {
                if (err) {
                    return cb(err);
                }
                if (isMatch) {
                    if (!user.loginAttempts && !user.lockUntil) {
                        return cb(null, user);
                    }
                    var updates = {
                        $set: { loginAttempts: 0 },
                        $unset: { lockUntil: 1 }
                    };
                    return user.update(updates, function (err) {
                        if (err) {
                            return cb(err);
                        }
                        return cb(null, user);
                    });
                }

                user.incLoginAttempts(function (err) {
                    if (err) {
                        return cb(err);
                    }
                    return cb(null, null, reasons.PASSWORD_INCORRECT);
                });
            });
        });
    };

    usersSchema.statics.authorize = function (req, res, next) {
        return next();
    };
    var User = mongoose.model('User', usersSchema);

    return User;
};