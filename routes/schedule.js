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
        //if(result[0]){
        if(1){
            db.query('SELECT * FROM schedule_form WHERE  room_ridx= '+mysql.escape(req.session.ridx), function(error, result) {
                if(result[0]){
                    res.render('SchedulePlan', {title: 'Schedule Plan Page', exist:1});
                }
                else{
                    res.render('SchedulePlan', {title: 'Schedule Plan Page',exist:0});
                }
            });
        }
        else{
            res.send("권한이 없습니다.");
        }
    });
});
router.post('/plan', function(req, res) {
    var s_date = req.body.s_date;
    var e_date = req.body.e_date;
    var job = req.body.job;
    db.query("INSERT INTO confirm VALUES (?,?)", [idx.uidx,email_key], function() {

    });

});
/* GET users listing. */
router.get('/progress', function(req, res, next) {


});
module.exports = router;
