/**
 * Created by Taekyun on 2015-02-08.
 */
var express = require('express');
var router = express.Router();
var fs = require('fs');
var ejs = require('ejs');

router.get('/', function(req, res, next) {
    ///////////test/////////////////
    res.render('teamRoom', { title: 'teamRoom'});

});

router.get('/canvas/:room', function(req, res){
    /*
    fs.readFile('canvas.ejs', 'utf8', function(err, data){
        res.send(ejs.render(data, {room: req.param('room')}));
    });
    */
    res.render('canvas', {room: req.param('room')});
});

router.get('/room', function(req, res){
    res.send(io.sockets.manager.rooms);
});

module.exports = router;
