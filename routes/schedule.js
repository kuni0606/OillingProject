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
router.get('/plan', function(req, res) {
    db.query('SELECT * FROM room WHERE  ridx= '+mysql.escape(req.session.ridx)+' and User_master = '+mysql.escape(req.session.uidx), function(error, result) {
        if(result[0]){
            db.query('SELECT * FROM schedule_form WHERE  room_ridx= '+mysql.escape(req.session.ridx), function(error, result) {
                if(result[0]){
                    res.render('SchedulePlan', {title: 'Schedule Plan Page', exist:1});
                }
                else{
                    res.render('SchedulePlan', {title: 'Schedule Plan Page',exist:0});
                }
            });
        }
        else{ res.send("권한이 없습니다."); }
    });
});
router.post('/plan', function(req, res) {
    var p_sdate = req.body.p_sdate;
    var p_edate = req.body.p_edate;
    var p_job = req.body.p_job;
    var p_type = req.body.p_type;
    var p_r = req.body.p_r;
    db.query("INSERT INTO schedule_form VALUES (?,?,?,?,?,?)", [mysql.escape(req.session.ridx),mysql.escape(p_type),mysql.escape(p_job),mysql.escape(p_r),mysql.escape(p_sdate),mysql.escape(p_edate)], function(err) {
        if(err)
        {
            console.log("plan insert error : "+err);
        }
    });
    res.send("plan");

});
/* GET users listing. */
router.get('/progress', function(req, res, next) {


});
module.exports = router;
