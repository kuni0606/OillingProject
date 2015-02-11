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
    if (req.session.uidx==null) res.redirect('/login');

    var totalroom= 0;

    db.query('SELECT i.User_my,u.name,i.User_you,r.ridx,r.title FROM invite i, user u, room r WHERE i.User_you='+mysql.escape(req.session.uidx)+' and i.User_my = u.uidx and i.Room_idx = r.ridx',function(err,tresult) {
        db.query('SELECT * FROM room_join WHERE User_uidx= ' + mysql.escape(req.session.uidx), function (error, result) {
            var names = [],
                inviteroom = [],
                roomtitle = [],
                invitedate = [],
                tresultlength= 0;
            if (!err){
                for (var i = 0;i<tresult.length;i++){
                    names.push(tresult[i].name);
                    inviteroom.push(tresult[i].ridx);
                    roomtitle.push(tresult[i].title);
                }
                tresultlength=tresult.length;
            }
            if (error) {
                res.render('Mainpage', {
                    title: 'Main Page',
                    s_uidx: req.session.uidx,
                    s_email: req.session.email,
                    s_name: req.session.name,
                    v_totalroom: totalroom,
                    v_alarmn: tresultlength,
                    v_names: names,
                    v_iroom: inviteroom,
                    v_rtitle: roomtitle
                });
            } else {
                totalroom = result.length;
                var rooms = [];
                var roomsi = [];

                for (var i = 0; i < totalroom; i++) {
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
                    v_roomsi: roomsi,
                    v_alarmn: tresultlength,
                    v_names: names,
                    v_iroom: inviteroom,
                    v_rtitle: roomtitle
                });
            }
        });
    });
});
router.post('/api/accept/',function(req,res){
    var roomindex = parseInt(req.body.ri);
    var roomtitle = req.body.rt;
    db.query('SELECT * FROM room WHERE ridx= ' + mysql.escape(roomindex), function (error, resultk) {
        if (error) {
            console.log(error);
        } else {
            db.query('DELETE FROM invite WHERE User_you= ' + mysql.escape(req.session.uidx) + ' and Room_idx= ' + mysql.escape(roomindex), function (error, result) {
                if (error) {
                    console.log("drop error : " + error);
                } else if (resultk[0].total>=resultk[0].max_num) {
                    console.log('full!!');
                    res.sendStatus(400);
                } else {
                    db.query("INSERT INTO room_join(Room_ridx,User_uidx,title) VALUES (?,?,?)", [mysql.escape(roomindex),mysql.escape(req.session.uidx),roomtitle], function(err) {
                        if(err) { console.log("plan select_cell error : "+err); }
                        else {
                            var temp = parseInt(resultk[0].total);
                            db.query('UPDATE room SET total=' + mysql.escape(temp+1) + ' WHERE ridx = ' + mysql.escape(roomindex), function (err) {
                                if (err) {
                                    console.log("plan ch_color error : " + err);
                                }
                                else {
                                    console.log('good');
                                    res.sendStatus(200);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});
router.post('/api/cancel/',function(req,res){
    var roomindex = parseInt(req.body.ri);

    console.log(roomindex);

    db.query('DELETE FROM invite WHERE User_you= ' + mysql.escape(req.session.uidx) + ' and Room_idx= ' + mysql.escape(roomindex), function (error, result) {
        if(error) { console.log("drop error : "+error); }
        else{
            res.sendStatus(200);
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
                        res.redirect('/main');
                    }
                });
            });
        }
    });
});

module.exports = router;
