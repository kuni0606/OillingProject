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
router.get('/', function(req, res, next) {
    if (req.session.uidx==null) res.redirect('/login');
    ///////////test/////////////////
    var roomindex=req.query.ri;
    db.query('SELECT Room_ridx FROM room_join WHERE User_uidx= '+mysql.escape(req.session.uidx),function(error,result){
        if (error){
            res.send(404,"권한이 없습니다");
        }else{
            for (var i = 0;i<result.length;i++){
                if (result[i].Room_ridx==roomindex){
                    req.session.ridx=roomindex;
                    ///////////test/////////////////
                    res.render('Roompage', { title: 'Main Page', s_ridx: req.session.ridx, s_uidx:req.session.uidx,s_name:req.session.name});
                    return true;
                }
            }
            res.send(404,"권한이 없습니다");
            return false;
        }
    });
});
router.post('/api/invite/', function(req,res){
    var email = req.body.email;
    console.log(email);
    db.query('SELECT uidx FROM user WHERE email= '+mysql.escape(email),function(error,result) {
        if (error){
            console.log('해당하는 사람 x');
            res.sendStatus(400);
        }else{
            db.query("INSERT INTO invite(Room_idx,User_my,User_you) VALUES (?,?,?)", [req.session.ridx,mysql.escape(req.session.uidx),mysql.escape(parseInt(result[0].uidx))], function(err) {
                if(err) {
                    console.log("progress select_cell error : "+err);
                    res.sendStatus(404);
                }
                else {
                    console.log('good');
                    res.sendStatus(200);
                }
            });
        }
    });
});
module.exports = router;
