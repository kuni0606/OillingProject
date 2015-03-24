var socketio = require('socket.io');
var express = require('express');
var http = require('http');
var ejs = require('ejs');
var fs = require('fs');
var easyrtc = require('easyrtc');

var app = express();
//app.use(app.router);
app.use(express.static('publics'));
app.use(express.static(__dirname+"/static/"));

var server = http.createServer(app);
server.listen(52274, function(){
    console.log('Server running at localhost:52274');
});

var io = socketio.listen(server);
io.set('log level', 2);

var rtc=easyrtc.listen(app, io);

app.get('/', function(req, res){
    fs.readFile('teamRoom.html', function(err,data){
        res.send(data.toString());
    });
});

app.get('/teamRoom', function(req, res){
    fs.readFile('teamRoom.html', 'utf8', function(error, data){
        res.writeHead(200, { 'Content-Type': 'text/html'});
        res.end(data);
    });
});

app.get('/canvas/:room', function(req, res){
    fs.readFile('canvas.html', 'utf8', function(err, data){
        res.send(ejs.render(data, {room: req.param('room')}));
    });
});

app.get('/room', function(req, res){
    res.send(io.sockets.manager.rooms);
});

io.sockets.on('connection', function(socket){
    socket.on('join', function(data){
        socket.join(data);
        socket.set('room', data);
    });

    socket.on('draw', function(data){
        socket.get('room', function(err, room){
            io.sockets.in(room).emit('line', data);
        });
    });

    socket.on('clear', function(data){
        socket.get('room', function(err, room){
            io.sockets.in(room).emit('board', data);
        });
    });

    socket.on('create_room', function(data){
        io.sockets.emit('create_room', data.toString());
    });

    socket.on('message', function(message){
        socket.get('room', function(error, room){
            socket.broadcast.in(room).emit('message', message);
            socket.in(room).emit('message_me', message);
        });
    });


});