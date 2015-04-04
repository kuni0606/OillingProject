var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('cookie-session');
var contentDisposition = require('content-disposition');
var bodyParser = require('body-parser');
var toobusy = require('toobusy');

var routes = require('./routes/index');
var users = require('./routes/users');
var login = require('./routes/login');
var main = require('./routes/main');
var room = require('./routes/room');
var schedule = require('./routes/schedule');
var file = require('./routes/file');
global.rootPath = __dirname;
var video = require('./routes/video');
var log = require('./routes/log');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/easyrtc',express.static(path.join(__dirname, 'node_modules/easyrtc/api')));

app.use('/', routes);
app.use('/users', users);
app.use('/login', login);
app.use('/main', main);
app.use('/room', room);
app.use('/schedule', schedule);
app.use('/file', file);
app.use('/video',video);
app.use('/log',log);

app.use(session({secret:'secret key'}));
app.use('/logout', function(req, res) {
    req.session=null;
    res.redirect('/');
});
app.use('/file/home', express.static(process.cwd(), {
    index: false,
    setHeaders: function(res, path){
        // Set header to force files to download
        res.setHeader('Content-Disposition', contentDisposition(path));
    }
}));
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    if (toobusy()) res.send(503,'서버가 혼잡합니다.');
    else {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    }
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
module.exports = app;