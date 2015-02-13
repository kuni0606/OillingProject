/**
 * Created by yong on 2015-02-01.
 */
var express = require('express');
var mysql = require('mysql');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var cookieParser = require('cookie-parser');
var session = require('cookie-session');
var router = express.Router();
var db = mysql.createConnection({
    host : '210.118.74.149',
    port : 3306,
    user : 'root',
    password : 'tony0606',
    database : 'opdb'
});
router.use(cookieParser());
router.use(session({secret:'secret key'}));
/* login */
router.get('/', function(req, res) {
    if(req.session.name) // 세션이 있으셔. 로그인 한 사람이야
    {
        res.redirect('/main');
    }
    else // 세션 x
    {
        res.render('LoginForm', { title: 'Login' });
    }
});
router.post('/', function(req, res) {
    var email = req.body.email;
    var pw = req.body.pw;
    var hash = crypto.createHash('sha1');
    var key = 'tony06';
    var cipher = crypto.createCipher('aes192',key); // 1차 암호화
    var user_info = 0;
    cipher.update(pw,'utf8','base64');
    pw = cipher.final('base64');
    hash.update(pw);//2차 해시 암호화
    pw = hash.digest('hex'); //암호화 끝
    db.query('SELECT * FROM user WHERE email = '+mysql.escape(email)+' and pw = '+mysql.escape(pw), function(error, result) {
        user_info = result[0];
        if (!user_info) {// 가입을 안하셨어~
            res.redirect('/login');
        }
        else // 가입하셨어~
        {
            if(user_info.confirm) //이메일 인증 하셨어~o
            { //세션 생성
                req.session.uidx = user_info.uidx;
                req.session.email = user_info.email;
                req.session.name = user_info.name;
                res.redirect('/main');
            }
            else // 이메일 인증 안하셨어~x
            {
                res.redirect('/login');
            }
        }
        req.session.now = (new Date()).toUTCString();
    });
});
/* join */
router.get('/join', function(req, res) {
    res.render('joinform', { title: 'Join' });
});
router.post('/join', function(req, res) {
    var idx = 0;
    var email = req.body.email;
    var name = req.body.name;
    var pw = req.body.pw;
    var phone = req.body.phone;
    // db에 회원가입 정보 insert
    var hash = crypto.createHash('sha1');
    var key = 'tony06';
    var cipher = crypto.createCipher('aes192',key); // 1차 암호화
    cipher.update(pw,'utf8','base64');
    pw = cipher.final('base64');
    hash.update(pw);//2차 해시 암호화
    pw = hash.digest('hex'); //암호화 끝
    var member = {
        "email" : email,
        "name" : name,
        "pw" : pw,
        "phone" : phone
    };
    db.query("SELECT uidx FROM user WHERE email = ?", [mysql.escape(email)], function(error, result) {
       if(result[0]) //이미 가입된 이메일
       { res.redirect('/login/join'); }
        else{
           db.query("INSERT INTO user SET ?", member, function() {
               //이메일 인증
               var email_key = parseInt(Math.random() * 9999999+1000000);
               db.query("SELECT uidx FROM user WHERE email = ?", [mysql.escape(email)], function(error, result) {
                   idx = result[0];
                   db.query("INSERT INTO confirm VALUES (?,?)", [idx.uidx,email_key], function() {});
                   var smtpTrans = nodemailer.createTransport("SMTP", {
                       service: 'Gmail',
                       auth: { user: 'clzlckzkcyzh@gmail.com', pass: 'tony0606'}
                   });
                   var mail_text = '<img src="http://210.118.74.149:3000/images/ssm_logo.gif" alt="ssm_logo"/>';
                   mail_text += '<h1>Welcome to Oilling Project!</h1><br/>';
                   mail_text += '<p>Dear, <strong>'+name +',</strong><br/><br/>';
                   mail_text += 'You have registered for a OP account with the <strong>' + email + '.</strong><br/>';
                   mail_text += 'This will be used to log into your OP account.<br/><br/>';
                   mail_text += 'Now, please <a href="http://210.118.74.149:3000/login/join/confirm/'+email_key+'" target="_blank"><span style="font-size: large; font-weight: bolder">verify your account.</span></a></br>';
                   mail_text += 'It will return you to the OP site where you can complete the process.<br/><br/>';
                   mail_text += 'If the link is not clickable, copy and paste the following URL into your web browser. </p>';
                   mail_text += '<p>http://210.118.74.149:3000/login/join/confirm/'+email_key+'</p><br/>';
                   var mailOptions = {
                       from: 'OP <clzlckzkcyzh@gmail.com>',
                       to: email,
                       subject: 'Oilling Project - Verify Your Account',
                       html: mail_text
                   }
                   smtpTrans.sendMail(mailOptions, function(error, response){
                       if (error){
                           console.log("sendMail error : "+error);
                       } else {
                           console.log("Message sent : " + response.message);
                       }
                       smtpTrans.close();
                       res.redirect('/login');
                   });
               });
           });
       }
    });
});
/* email response */
router.get('/join/confirm/:confirm_k', function(req, res) {
    db.query('SELECT * FROM confirm WHERE confirm_key = '+mysql.escape(req.params.confirm_k), function(error, result) {
        if (error){
            console.log("confirm error : "+error);
        } else {
            if (!result[0]) {// 키가 없을시 이미 인증함.
                res.redirect('/login');
            } else {
                db.query("UPDATE user SET confirm=1 WHERE uidx = ?", [result[0].User_uidx], function() {});
                db.query('DELETE FROM confirm WHERE confirm_key = '+mysql.escape(req.params.confirm_k), function () {
                    res.redirect('/login');
                });
            }
        }
    });
});
module.exports = router;
