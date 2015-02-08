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

router.get('/', function(req, res, next) {
    ///////////test/////////////////
    res.render('File', { title: 'File System'});
});
// Serve files from the current directory under the /files route

// This endpoint is requested by our frontend JS
router.use(function(req, res, next) {
    var t = req.query.currentPath;
    if (typeof t=='undefined') t='';
    console.log(t);
    var handler = multer({
        dest: './' + t,
        rename: function (fieldname, filename) {
            return filename;
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
    if ( f==null) f='';
    try{
        console.log(rootPath+'/'+t+'/'+f);
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
    console.log(rootPath+'/'+o+'-->'+rootPath+'/'+t+'/'+f);
    fs.renameSync(rootPath+'/'+o,rootPath+'/'+t+'/'+f);
});

router.post('/api/upload/', function (req, res) {
    res.send({image: false, file: req.files.userFile.originalname, savedAs: req.files.userFile.name});
});
router.get('/api/scan', function(req,res){
    var tree = scan('.', 'home');
    res.send(tree);
});
module.exports = router;