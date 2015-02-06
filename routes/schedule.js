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

router.get('/plan', function(req, res) { // 관리자가 프로젝트 계획버튼을 눌렀을 때 이미 계획한 일정이 있나 없나 확인
    db.query('SELECT * FROM room WHERE  ridx= '+mysql.escape(req.session.ridx)+' and User_master = '+mysql.escape(req.session.uidx), function(error, result) {
        if(result[0]){ //일단 그 방의 관리자가 맞는지. 잘못된 루트가 아닌지 확인하고
            db.query('SELECT * FROM schedule_form WHERE  room_ridx= '+mysql.escape(req.session.ridx), function(error, result) {
                if(result[0]){ //이미 계획한 게 있으면 exist로 1로 구별하고
                    res.render('SchedulePlan', {title: 'Schedule Plan Page', exist:1});
                }
                else{ //계획한 일정이 없을 경우 0으로 구별
                    res.render('SchedulePlan', {title: 'Schedule Plan Page',exist:0});
                }
            });
        }
        else{ res.send("권한이 없습니다."); }
    });
});
router.post('/plan', function(req, res) { //관리자가 처음 계획 일정을 눌러서 날짜랑 job을 정했을 때 schedule_form 테이블에 정보를 넣고 reload
    var p_sdate = req.body.p_sdate;
    var p_edate = req.body.p_edate;
    var p_job = parseInt(req.body.p_job);
    var p_type = parseInt(req.body.p_type);
    var p_r = parseInt(req.body.p_r);
    db.query("INSERT INTO schedule_form VALUES (?,?,?,?,?,?)", [mysql.escape(req.session.ridx),mysql.escape(p_type),mysql.escape(p_job),mysql.escape(p_r),mysql.escape(p_sdate),mysql.escape(p_edate)], function(err) {
        if(err) { console.log("plan insert error : "+err); }
        else { res.render('SchedulePlan', {title: 'Schedule Plan Page',exist:1}); }
    });
});

/* GET users listing. */
router.get('/progress', function(req, res, next) {


});
module.exports = router;
