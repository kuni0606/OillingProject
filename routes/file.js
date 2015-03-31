/**
 * Created by JaeHeon on 2015-02-08.
 */
"use strict";

var express = require('express');
var router = express.Router();
var path = require('path');
var multer = require('multer');
var scan = require('./scan');
var fs = require('fs');
var rimraf = require('rimraf');
var rootdir = 'file/';
var session = require('cookie-session');

router.use(session({secret:'secret key'}));

router.get('/', function(req, res, next) {
    if (req.session.uidx==null) res.redirect('/login');
    ///////////test/////////////////
    //rootdir='file/'+req.query.ri;
    try{
        fs.mkdirSync(rootPath+'/'+'file/'+req.query.ri);
    }catch(e){

    }
    res.render('File', { title: 'File System'});
});
// Serve files from the current directory under the /files route

// This endpoint is requested by our frontend JS
router.use(function(req, res, next) {
    var t = req.query.currentPath;
    if (typeof t=='undefined') t='';
    if (t=='') t=rootdir+req.session.ridx;
    if (t=='file') t=rootdir+req.session.ridx;
    console.log("FP : "+req.session.ridx);
    var handler = multer({
        dest: './' + t,
        rename: function (fieldname, filename) {
            return filename.replace(/[^\s0-9가-힣a-zA-Z\-_]/g, '');
        }

    });
    handler(req, res, next);
});
function getExtension(fn) {
    return fn.split('.').pop();
}
router.post('/api/mkdir/', function(req,res){
    var t = req.query.currentPath;
    var f = req.query.folderName;
    if (typeof t=='undefined') t='';
    if (t=='') t=rootdir+req.session.ridx;
    if ( f==null) f='';
    try{
        fs.mkdirSync(rootPath+'/'+t+'/'+f);
    }catch (e){
        console.error('이미 있는 폴더');
    }
});
router.post('/api/unlink/', function(req,res){
    var o = req.query.originalName;
    console.log('del '+rootPath+'/'+o);
    try{
        rimraf.sync(rootPath + '/' + o);
    }catch(e){

    }
});
router.post('/api/rndir/', function(req,res){
    var t = req.query.currentPath;
    var f = req.query.folderName;
    var o = req.query.originalName;
    if (typeof t=='undefined') t='';
    if (t=='') t=rootdir+req.session.ridx;
    fs.renameSync(rootPath+'/'+o,rootPath+'/'+t+'/'+f);
});

router.post('/api/upload/', function (req, res) {
    res.send({image: false, file: req.files.userFile.originalname, savedAs: req.files.userFile.name});
});
router.get('/file/api/scan', function(req,res){
    var tree = scan('./'+rootdir+req.session.ridx, 'home');
    res.send(tree);
});
module.exports = router;