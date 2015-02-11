/**
 * Created by Taekyun on 2015-02-08.
 */
var express = require('express');
var session = require('cookie-session');
var router = express.Router();
var fs = require('fs');
var ejs = require('ejs');

router.use(session({secret:'secret key'}));

router.get('/', function(req, res, next) {
    ///////////test/////////////////
    res.render('canvas', { room: req.session.ridx,s_name:req.session.name } );
});

router.get('/room', function(req, res){
    res.send(io.sockets.manager.rooms);
});

module.exports = router;
