var express = require('express');
var mysql = require('mysql');
var session = require('cookie-session');
var router = express.Router();
var path = require('path');
var multer = require('multer');
var fs = require('fs');

var db = mysql.createConnection({
    host : '210.118.74.149',
    port : 3306,
    user : 'root',
    password : 'tony0606',
    database : 'opdb'
});

router.use(session({secret:'secret key'}));
/* GET users listing. */
router.get('/', function(req, res, next) {
    var totalroom= 0;

    db.query('SELECT * FROM room_join WHERE User_uidx= '+mysql.escape(req.session.uidx),function(error,result){
        if (result.length == 0) {
            res.render('Mainpage', { title: 'Main Page', s_uidx:req.session.uidx,s_email:req.session.email,s_name:req.session.name,v_totalroom:totalroom});
        }else {
            totalroom = result.length;
            var rooms = [];
            var roomsi = [];

            for (var i = 0;i<totalroom;i++){
                rooms.push(result[i].title);
                roomsi.push(result[i].Room_ridx);
            }

            res.render('Mainpage', {
                title: 'Main Page',
                s_uidx: req.session.uidx,
                s_email: req.session.email,
                s_name: req.session.name,
                v_totalroom: totalroom,
                v_rooms: rooms,
                v_roomsi: roomsi
            });
        }
    });
});
router.post('/api/join/',function(req,res){
    var roomindex = parseInt(req.body.ri);

    res.redirect('/room/?ri='+roomindex);
});
router.post('/api/create/', function(req,res){
    var pjtitle = req.body.pt;
    var pjnum = parseInt(req.body.pn);
    db.query("INSERT INTO room(User_master,title,max_num) VALUES (?,?,?)", [mysql.escape(req.session.uidx),pjtitle.toString(),mysql.escape(pjnum)], function(err) {
        if(err) { console.log("progress select_cell error : "+err); }
        else {
            db.query('SELECT max(ridx) ridx FROM room ',function(error,result) {
                console.log(result[0]);
                var temp = parseInt(result[0].ridx);
                db.query("INSERT INTO room_join(Room_ridx,User_uidx,title) VALUES (?,?,?)", [mysql.escape(temp), mysql.escape(req.session.uidx), pjtitle.toString()], function (err) {
                    if (err) {
                        console.log("progress select_cell error : " + err);
                    }
                    else {
                        console.log('good');
                        res.redirect('/');
                    }
                });
            });
        }
    });
});

module.exports = router;
