var express = require('express');
var mysql = require('mysql');
var conn = require('./db.js');
var session = require('cookie-session');
var url = require('url');
var router = express.Router();

var db = conn.dbcon();
router.use(session({secret:'secret key'}));

router.get('/plan', function(req, res) { // 관리자가 프로젝트 계획버튼을 눌렀을 때 이미 계획한 일정이 있나 없나 확인
    if (req.session.uidx==null) res.redirect('/login');
    db.query('SELECT * FROM room WHERE  ridx= '+mysql.escape(req.session.ridx)+' and User_master = '+mysql.escape(req.session.uidx), function(error, result) {
        if(result[0]){ //일단 그 방의 관리자가 맞는지. 잘못된 루트가 아닌지 확인하고
            db.query('SELECT * FROM schedule_form WHERE  room_ridx= '+mysql.escape(req.session.ridx), function(error, result) {
                if(result[0]){ //이미 계획한 게 있으면 exist로 1로 구별하고
                    res.send(true);
                }
                else{ //계획한 일정이 없을 경우 0으로 구별
                    res.send(false);
                }
            });
        }
        else{
            console.log("ridx:"+req.session.ridx+"uidx:"+req.session.uidx);
            res.send("권한이 없습니다."); }
    });
});
router.get('/planning', function(req, res) {
    if (req.session.uidx==null) res.redirect('/login');
    res.render('SchedulePlan', {title: 'Schedule Plan Page', s_ridx: req.session.ridx, s_uidx:req.session.uidx,s_name:req.session.name});
});
router.get('/back', function(req, res) {
    if (req.session.uidx==null) res.redirect('/login');
    db.query('SELECT * FROM canvas_state WHERE ridx = '+mysql.escape(req.session.ridx), function(error, result) {
        if (error){
            console.log("canvas_state select error : "+error);
        }
        else {
            if (result[0]) {//방 있음.
                var temp = parseInt(result[0].total);
                if(temp < 2) {
                    db.query('DELETE FROM canvas_state WHERE ridx = '+mysql.escape(req.session.ridx), function () {
                        res.redirect('/room/?ri='+req.session.ridx);
                    });
                }
                else {
                    db.query('UPDATE canvas_state SET total=' + mysql.escape(temp-1) + ' WHERE ridx = ' + mysql.escape(req.session.ridx), function() {
                        res.redirect('/room/?ri='+req.session.ridx);
                    });
                }
            }
            else { //방 없어
                res.redirect('/room/?ri='+req.session.ridx);
            }
        }
    });
});
router.post('/plan', function(req, res) { //관리자가 처음 계획 일정을 눌러서 날짜랑 job을 정했을 때 schedule_form 테이블에 정보를 넣고 reload
    var p_session = parseInt(req.session.ridx);
    var p_sdate = req.body.p_sdate;
    var p_edate = req.body.p_edate;
    var p_type = parseInt(req.body.p_type);
    var p_job = parseInt(req.body.p_job); //column
    var p_row = parseInt(req.body.p_r); //row
    var i = 0;
    // 일단 테이블 정보를 세팅하고
    db.query("INSERT INTO schedule_form VALUES (?,?,?,?,?,?)", [mysql.escape(p_session),mysql.escape(p_type),mysql.escape(p_job),mysql.escape(p_row),mysql.escape(p_sdate),mysql.escape(p_edate)], function(err) {
        if(err) { console.log("plan insert error : "+err); }
        else {
            for(i=0;i<p_job;++i){ //JOB 개수에 따라 미리 INSERT 해놔야되. 그래야 나중에 잡 추가될때 INSERT 만 할 수 있도록 간편. (나중에 UPDATE랑 헷갈릴 수 있어서)
                db.query("INSERT INTO schedule_job(Room_ridx,sj_idx) VALUES (?,?)", [mysql.escape(p_session),mysql.escape(i)], function() {});
            }
            res.redirect('/schedule/planning');
        }
    });
});

/* GET users listing. */
router.post('/plan/setting', function(req, res) {
    var ridx = req.body.ridx;
    var uidx = req.body.uidx;
    var sf_form = 0, sj_job = 0,sd_data= 0;
    var temp = 0;
    var n_json={};
    var i=0;
    var temp_arr;

    db.query('SELECT * FROM schedule_form WHERE Room_ridx= '+mysql.escape(ridx), function(error, result) {
        sf_form = result[0];
        if(sf_form)
        { //그 방의 계획된 일정이 있는지 확인하고 (아마도 이전에 검사했으니 이땐 99%있을거야)
            n_json.type = sf_form.type;
            n_json.col = sf_form.column;
            n_json.row = sf_form.row;
            n_json.s_date = sf_form.start_date;
            n_json.e_date = sf_form.end_date;
            db.query('SELECT sj_idx,job FROM schedule_job WHERE Room_ridx= '+mysql.escape(ridx)+' order by sj_idx', function(error, result) {
                sj_job = result; //JOB 받아오고
                temp_arr = new Array();
                for(i=0;i<sj_job.length;++i){
                    var temp_json = {};
                    temp_json.sj_idx = sj_job[i].sj_idx;
                    temp_json.job = sj_job[i].job;
                    temp_arr.push(temp_json);
                }
                n_json.sj_job = temp_arr;
                db.query('SELECT d.position, c.color FROM schedule_color c,schedule_data d WHERE d.Room_ridx = '+mysql.escape(ridx)+ ' and c.Room_ridx = d.Room_ridx and c.User_uidx = d.User_uidx order by d.position', function(error, result) {
                    sd_data = result; //DATA와 COLOR 받아오고
                    temp_arr = new Array();
                    for(i=0;i<sd_data.length;++i){
                        var temp_json2 = {};
                        temp_json2.position = sd_data[i].position;
                        temp_json2.color = sd_data[i].color;
                        temp_arr.push(temp_json2);
                    }
                    n_json.s_data = temp_arr;
                    console.log(n_json);
                    res.send(n_json);
                });
            });
        }
        else{ res.sendStatus(404); }
    });
});

router.post('/plan/init_color', function(req, res) {
    var ridx = req.body.ridx;
    var n_json={};
    db.query('SELECT u.name, c.color, c.User_uidx FROM user u,schedule_color c WHERE c.User_uidx = u.uidx and c.Room_ridx = '+mysql.escape(ridx)+';', function(error, result) {
        if(result[0])
        {
            n_json.color_info = result;
            n_json.leng = result.length;
            //console.log(n_json);
            res.send(n_json);
        }
        else{ res.sendStatus(404); }
    });
});
router.post('/plan/ch_color', function(req, res) {
    var ridx = req.body.ridx;
    var c_idx = req.body.c_idx;
    var c_color = req.body.c_color;
    db.query('UPDATE schedule_color SET color='+mysql.escape(c_color)+' WHERE Room_ridx = '+mysql.escape(ridx)+' and User_uidx = '+mysql.escape(c_idx), function(err) {
        if(err) { console.log("plan ch_color error : "+err); }
        else {
            res.send(c_idx);
        }
    });
});
router.post('/plan/drop_schedule', function(req, res) {
    var ridx = req.body.ridx;
    db.query('DELETE FROM schedule_form WHERE Room_ridx='+mysql.escape(ridx), function(err) {
        if(err) { console.log("drop error : "+err); }
        else {
            db.query('DELETE FROM schedule_job WHERE Room_ridx='+mysql.escape(ridx), function(err) {
                db.query('DELETE FROM schedule_data WHERE Room_ridx='+mysql.escape(ridx), function(err) {
                    if(err) { console.log("drop error : "+err); }
                    else { res.send(ridx); }
                    /*db.query('DELETE FROM schedule_color WHERE Room_ridx='+mysql.escape(ridx), function(err) {
                     if(err) { console.log("drop error : "+err); }
                     else { res.send(ridx); }
                     });*/
                });
            });
        }
    });
});
router.post('/plan/job_save', function(req, res) {
    var ridx = req.body.ridx;
    var j_idx = req.body.j_idx;
    var job = req.body.job;
    db.query('UPDATE schedule_job SET job='+mysql.escape(job)+' WHERE Room_ridx = '+mysql.escape(ridx)+' and sj_idx = '+mysql.escape(j_idx), function(err) {
        if(err) { console.log("plan job_save error : "+err); }
        else {
            res.send(j_idx);
        }
    });
});
router.post('/plan/select_cell', function(req, res) {
    var t = parseInt(req.body.t);
    var ridx = parseInt(req.body.ridx);
    var uidx = parseInt(req.body.uidx);
    var pos = parseInt(req.body.pos);
    if(t) {
        db.query("INSERT INTO schedule_data(Room_ridx,User_uidx,position) VALUES (?,?,?)", [mysql.escape(ridx),mysql.escape(uidx),mysql.escape(pos)], function(err) {
            if(err) { console.log("plan select_cell error : "+err); }
            else { res.send('okay'); }
        });
    }
    else{
        db.query('DELETE FROM schedule_data WHERE Room_ridx='+mysql.escape(ridx)+' and position='+mysql.escape(pos), function(err) {
            if(err) { console.log("plan select_cell error : "+err); }
            else { res.send('okay'); }
        });
    }
});

//프로젝트 진행 페이지~~~~*************************************
router.post('/progress', function(req, res) {
    db.query('SELECT * FROM schedule_form WHERE  Room_ridx= '+mysql.escape(req.session.ridx), function(error, result) {
        if(result[0]){ //이미 계획한 게 있으면 exist로 1로 구별하고
            res.send(true);
        }
        else{ //계획한 일정이 없을 경우 0으로 구별
            res.send(false);
        }
    });
});
router.get('/progress', function(req, res) {
    if (req.session.uidx==null) res.redirect('/login');
    res.render('ScheduleProgress', {title: 'Schedule Progress Page', s_ridx: req.session.ridx, s_uidx:req.session.uidx,s_name:req.session.name});
});
router.post('/progress/setting', function(req, res) {
    var ridx = req.body.ridx;
    var uidx = req.body.uidx;
    var sf_form = 0, sj_job = 0,sd_data= 0,sp_progress= 0;
    var temp = 0;
    var n_json={};
    var i=0;
    var temp_arr;

    db.query('SELECT * FROM schedule_form WHERE Room_ridx= '+mysql.escape(ridx), function(error, result) {
        sf_form = result[0];
        if(sf_form)
        { //그 방의 계획된 일정이 있는지 확인하고 (아마도 이전에 검사했으니 이땐 99%있을거야)
            n_json.type = sf_form.type;
            n_json.col = sf_form.column;
            n_json.row = sf_form.row;
            n_json.s_date = sf_form.start_date;
            n_json.e_date = sf_form.end_date;
            db.query('SELECT sj_idx,job FROM schedule_job WHERE Room_ridx= '+mysql.escape(ridx)+' order by sj_idx', function(error, result) {
                sj_job = result; //JOB 받아오고
                temp_arr = new Array();
                for(i=0;i<sj_job.length;++i){
                    var temp_json = {};
                    temp_json.sj_idx = sj_job[i].sj_idx;
                    temp_json.job = sj_job[i].job;
                    temp_arr.push(temp_json);
                }
                n_json.sj_job = temp_arr;
                db.query('SELECT d.position, c.color, c.User_uidx FROM schedule_color c,schedule_data d WHERE d.Room_ridx = '+mysql.escape(ridx)+ ' and c.Room_ridx = d.Room_ridx and c.User_uidx = d.User_uidx order by d.position', function(error, result) {
                    sd_data = result; //DATA와 COLOR 받아오고
                    temp_arr = new Array();
                    for(i=0;i<sd_data.length;++i){
                        var temp_json2 = {};
                        temp_json2.position = sd_data[i].position;
                        temp_json2.color = sd_data[i].color;
                        temp_json2.uidx = sd_data[i].User_uidx;
                        temp_arr.push(temp_json2);
                    }
                    n_json.s_data = temp_arr;
                    db.query('SELECT User_uidx, position FROM schedule_progress WHERE Room_ridx = '+mysql.escape(ridx)+ ' order by position', function(error, result) {
                        sp_progress = result; // progresss data 받아오고
                        temp_arr = new Array();
                        for (i = 0; i < sp_progress.length; ++i) {
                            var temp_json3 = {};
                            temp_json3.uidx = sp_progress[i].User_uidx;
                            temp_json3.position = sp_progress[i].position;
                            temp_arr.push(temp_json3);
                        }
                        n_json.sp_progress = temp_arr;
                        console.log(n_json);
                        res.send(n_json);
                    });

                });
            });
        }
        else{ res.render('SchedulePlan', {title: 'Schedule Plan Page',exist:0}); }
    });
});
router.post('/progress/select_cell', function(req, res) {
    var t = parseInt(req.body.t);
    var ridx = parseInt(req.body.ridx);
    var uidx = parseInt(req.body.uidx);
    var pos = parseInt(req.body.pos);
    if(t) {
        db.query("INSERT INTO schedule_progress(Room_ridx,User_uidx,position) VALUES (?,?,?)", [mysql.escape(ridx),mysql.escape(uidx),mysql.escape(pos)], function(err) {
            if(err) { console.log("progress select_cell error : "+err); }
            else { res.send('okay'); }
        });
    }
    else{
        db.query('DELETE FROM schedule_progress WHERE Room_ridx='+mysql.escape(ridx)+' and position='+mysql.escape(pos), function(err) {
            if(err) { console.log("progress select_cell error : "+err); }
            else { res.send('okay'); }
        });
    }
});
router.post('/progress/init_color', function(req, res) {
    var ridx = req.body.ridx;
    var uidx = req.body.uidx;
    db.query('SELECT u.name, c.color FROM user u,schedule_color c WHERE c.User_uidx = u.uidx and c.Room_ridx = '+mysql.escape(ridx)+' and c.User_uidx = '+mysql.escape(uidx)+';', function(error, result) {
        if(result[0])
        {
            //console.log(result[0]);
            res.send(result[0]);
        }
        else{ res.render('SchedulePlan', {title: 'Schedule Plan Page',exist:0}); }
    });
});





module.exports = router;
