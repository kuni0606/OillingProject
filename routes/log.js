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
    db.query('SELECT * FROM log WHERE  Room_ridx= '+mysql.escape(req.session.ridx) + ' order by lidx desc', function(error, result) {
        var n_json={};
        n_json.title = 'Log Page';
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
