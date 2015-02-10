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
    ///////////test/////////////////
    req.session.uidx = 1;
    req.session.ridx = 1;
    ///////////test/////////////////
    res.render('Mainpage', { title: 'Main Page', s_ridx: req.session.ridx, s_uidx:req.session.uidx});
});


module.exports = router;
