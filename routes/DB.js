var mysql = require('mysql');
exports.dbcon = function (){
return mysql.createConnection({
    host : '210.118.74.149',
    port : 3306,
    user : 'oops',
    password : 'otyn0606',
    database : 'opdb'
});
}