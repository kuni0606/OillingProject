/**
 * Created by Taekyun on 2015-02-08.
 */
var express = require('express');
var mysql = require('mysql');
var conn = require('./db.js');
var session = require('cookie-session');
var router = express.Router();
var fs = require('fs');
var ejs = require('ejs');

var db = conn.dbcon();
router.use(session({secret:'secret key'}));

router.post('/', function(req, res, next) {
    if (req.session.uidx==null) res.redirect('/login');
    ///////////test/////////////////
    db.query('SELECT * FROM canvas_state WHERE ridx = '+mysql.escape(req.session.ridx), function(error, result) {
        if (error){
            console.log("canvas_state select error : "+error);
        } else {
            if (result[0]) {//이미 방에 누가 있어.
                var temp = parseInt(result[0].total) + 1;
                db.query('UPDATE canvas_state SET total=' + mysql.escape(temp) + ' WHERE ridx = ' + mysql.escape(req.session.ridx), function() {
                    res.render('canvas', { room: req.body.ri,s_name:req.session.name } );
                });
            }
            else { //방 없어
                db.query("INSERT INTO canvas_state(ridx,total) VALUES (?,?)", [req.session.ridx, mysql.escape(1),], function (err) {
                    if (err) { console.log("canvas_state insert error : " + err); }
                    else {
                        res.render('canvas', { room: req.body.ri,s_name:req.session.name } );
                    }
                });
            }
        }
    });
});

router.get('/room', function(req, res){
    res.send(io.sockets.manager.rooms);
});

module.exports = router;
