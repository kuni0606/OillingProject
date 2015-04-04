var express = require('express');
var mysql = require('mysql');
var conn = require('./db.js');
var session = require('cookie-session');
var router = express.Router();
var db = conn.dbcon();

router.use(session({secret:'secret key'}));
/* GET users listing. */
router.get('/', function(req, res, next) {
    db.query('SELECT * FROM log WHERE  Room_ridx= '+mysql.escape(req.session.ridx) + ' order by lidx desc', function(error, result) {
        var n_json={};
        n_json.title = 'Log Page';
        n_json.s_ridx =  req.session.ridx;
        n_json.s_uidx=req.session.uidx;
        n_json.s_name=req.session.name;
        if(result[0]){
            n_json.check = 1;
            n_json.log = result;
        }
        else{
            n_json.check = 0;
        }
        res.render('LogPage', n_json);
    });
});

module.exports = router;
