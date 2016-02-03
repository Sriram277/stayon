var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');


require('./models/user')(mongoose);
require('./models/media')(mongoose)
require('./models/widget')(mongoose)
require('./models/displays')(mongoose)
require('./models/device')(mongoose);
require('./models/playlist')(mongoose);
require('./models/schedular')(mongoose);
require('./models/socketsink')(mongoose);
require('./models/trackstatus')(mongoose);
require('./models/locations')(mongoose);
require('./models/categories')(mongoose);
require('./models/schedular_displays')(mongoose);


var routes = require('./routes/index');
var users = require('./routes/users');
var media = require('./routes/media');
var widget = require('./routes/widget');
var display = require('./routes/displays');
var device = require('./routes/deviceinfo');
var playlist = require('./routes/playlist');
var schedular = require('./routes/schedular');
var testupload = require('./routes/testupload');

var debug = require('debug')('stayon:server');
var http = require('http');

var app = express();

var port = normalizePort(process.env.PORT || '3000');

var server = http.createServer(app);
var global = require('./config/global.js');
var options = {
    pingTimeout: 3000,
    pingInterval: 3000,
    transports: ['polling', 'websocket'],
    allowUpgrades: false,
    cookie: false
};


var io = require('socket.io')(server);
global.io = io;
//io.set('transports', ['polling', 'websocket']);


mongoose.connect('mongodb://localhost:27017/stay-on');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    "use strict";
    console.log("mongo connected");
});
//require('./models/user.js')(mongoose);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.set('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept,Authorization');
    res.header("Content-Type", 'application/json');
    next();
});

app.use(require('skipper')());

app.use('/', routes);
app.use('/users', users);
app.use('/media', media);
app.use('/widget', widget);
app.use('/display', display);
app.use('/device', device);
app.use('/playlist', playlist);
app.use('/schedular', schedular);
app.use('/testupload', testupload);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});



/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}

/// Socket Connection:


var devices = [];
var Socketsink = mongoose.model('Socketsink');
var TrackStatus = mongoose.model('TrackStatus');
var Device = mongoose.model('Device');
var Display = mongoose.model('Display');

io.sockets.on('connection', function(socket) {

    socket.on('clientsocket', function(data) {

        //var sockets = {};
        console.log("before---" + socket.id);
        this_user_id = data.sockitpin;
        data.socketid = socket.id;
        socket.userid = this_user_id;
        socket.id = this_user_id;

        Socketsink.findOneAndUpdate({
            "sockitpin": data.sockitpin
        }, data, {
            upsert: true
        }, function(err, socketsinkdata) {
            global.clients[this_user_id] = socket;
            console.log('client connected..');
        });
        console.log("after---" + socket.id);

        Display.findOne({
            "random_key": this_user_id
        }, function(err, display) {
            console.log(display);
            if (display) {
                if (display.devicesync == "false") {
                    global.clients[this_user_id].emit('editdisplay_updated', display);
                }
            }
        });

        var trackdata = {};
        trackdata.modeltype = "device";
        trackdata.currentstatus = "started";
        trackdata.random_key = this_user_id;
        var track = new TrackStatus(trackdata);
        track.save(function(err, tracked) {
            console.log("Tracked");
        });

    });

    //New Devices
    socket.on('newdisplay', function(data) {
        console.log("1--- New Display");
        console.log(data);

        Display.find({
            "random_key": data.sockitpin
        }, function(err, displays) {
            socket.emit('newdisplayupdated', displays);
        });
    });

    socket.on('availableschedules', function(data) {
        console.log("Schedules Loading");
        console.log(data);
        var Schedular = mongoose.model('Schedular');
        console.log("Available Schedules");
        console.log(data);
        Schedular.find({
            displays: {
                "$in": [data.displayid]
            }
        }, function(err, schedular) {
            socket.emit("sendschedules", schedular);
        });
    });

    socket.on('availablecampaigns', function(data) {
        //FetchPlaylist
        console.log("Playlist Loading");
        console.log(data);
        var Playlist = mongoose.model('Playlist');
        Playlist.find({
            "_id": data.playlistid
        }, function(err, playlists) {
            console.log(playlists);
            socket.emit('sendcampaigns', playlists);
        });
    });

    socket.on('displaysync', function(data) {

        //Make displays.devicesync = "true" becoz data syncronized;
        //var Display = mongoose.model('Display');
        Display.findOneAndUpdate({
            "random_key": data.socketid
        }, {
            "devicesync": "true"
        }, {
            upsert: true
        }, function(err, statusupdated) {
            console.log(statusupdated);
        });
        console.log("displaysync acknowledged");
        console.log(data);
    });

    socket.on('schedularsync', function(data) {
        console.log('schedularsync acknowledged');
        console.log(data);
    });


    socket.on('disconnect', function(data) {

        console.log(data);
        //Device Status update
        Device.findOneAndUpdate({
            "random_key": socket.id
        }, {
            "player_onoff": "No"
        }, {
            upsert: true
        }, function(err, statusupdated) {
            console.log("Device Player Status Updated");
        });

        var trackdata = {};
        trackdata.modeltype = "device";
        trackdata.currentstatus = "stopped";
        trackdata.random_key = socket.id;
        var track = new TrackStatus(trackdata);
        track.save(function(err, tracked) {
            console.log("Disconnect Socket for " + socket.id);
        });
    });

    socket.on('devicestatus', function(data) {
        //same event for start time and end time also.
        console.log(data);
        Device.findOneAndUpdate({
            "random_key": data.sockitpin
        }, {
            "player_onoff": "Yes"
        }, {
            upsert: true
        }, function(err, statusupdated) {
            console.log("devicestatus");
        });
    });

    socket.on('playerstatus', function(data) {
        console.log("playerstatus");
        console.log(data);
        var trackdata = {};
        trackdata.modeltype = "Player";
        trackdata.currentstatus = "started";
        trackdata.random_key = this_user_id;
        var track = new TrackStatus(trackdata);
        track.save(function(err, tracked) {
            console.log("Player status");
        });
    });
});




function sendHeartbeat() {
    io.sockets.emit('ping', {
        beat: 1
    });
}

setInterval(sendHeartbeat, 80000);



module.exports = app;
