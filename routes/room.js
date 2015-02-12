var express = require('express');
var mysql = require('mysql');
var session = require('cookie-session');
var router = express.Router();

var db = mysql.createConnection({
    host : '210.118.74.149',
    port : 3306,
    user : 'root',
    password : 'tony0606',
    database : 'opdb'
});

router.use(session({secret:'secret key'}));
/* GET users listing. */
router.post('/', function(req, res, next) {
    if (req.session.uidx==null) res.redirect('/login');
    ///////////test/////////////////
    var roomindex=req.body.ri;
                    ///////////test/////////////////
    res.render('Roompage', { title: 'Project Room', s_ridx: req.body.ri, s_uidx:req.session.uidx,s_name:req.session.name});
    return true;
});
router.post('/api/invite/', function(req,res){
    var email = req.body.email;
    console.log(email);

    db.query('SELECT uidx FROM user WHERE email= ' + mysql.escape(email), function (error, resultk) {
        if (error) {
            console.log('해당하는 사람 x');
            res.sendStatus(400);
        } else {
            db.query('SELECT * FROM room_join WHERE User_uidx= ' + mysql.escape(parseInt(resultk[0].uidx)) + ' and Room_Ridx= ' + mysql.escape(req.session.ridx), function (error, result) {
                if (!result[0]) {
                    db.query('SELECT * FROM invite WHERE User_you= ' + mysql.escape(parseInt(resultk[0].uidx)) + ' and Room_idx= ' + mysql.escape(req.session.ridx), function (error, result) {
                        if (!result[0]) {
                            db.query("INSERT INTO invite(Room_idx,User_my,User_you) VALUES (?,?,?)", [req.session.ridx, mysql.escape(req.session.uidx), mysql.escape(parseInt(resultk[0].uidx))], function (err) {
                                if (err) {
                                    console.log("progress select_cell error : " + err);
                                    res.sendStatus(404);
                                }
                                else {
                                    console.log('good');
                                    res.sendStatus(200);
                                }
                            });
                        } else {
                            console.log('해당 방에 이미 초대');
                            res.sendStatus(401);
                        }
                    });
                } else {
                    console.log('해당 방에 이미 가입');
                    res.sendStatus(401);
                }
            });
        }
    });
});
module.exports = router;
