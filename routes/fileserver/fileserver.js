#!/usr/bin/env node

var path = require('path');
var express = require('express');
var contentDisposition = require('content-disposition');
var pkg = require( path.join(__dirname, 'package.json') );
var multer = require('multer');
var scan = require('./scan');
var fs = require('fs');
var rimraf = require('rimraf');

// Parse command line options

var program = require('commander');

program
	.version(pkg.version)
	.option('-p, --port <port>', 'Port on which to listen to (defaults to 3000)', parseInt)
	.parse(process.argv);

var port = program.port || 3000;

// Scan the directory in which the script was called. It will
// add the 'files/' prefix to all files and folders, so that
// download links point to our /files route

// Ceate a new express app

var app = express();

// Serve static files from the frontend folder

app.use('/', express.static(path.join(__dirname, 'frontend')));

// Serve files from the current directory under the /files route

app.use('/files', express.static(process.cwd(), {
	index: false,
	setHeaders: function(res, path){

		// Set header to force files to download

		res.setHeader('Content-Disposition', contentDisposition(path));

	}
}));
// This endpoint is requested by our frontend JS
app.use(function(req, res, next) {
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
app.post('/api/mkdir/', function(req,res){
    var t = req.query.currentPath;
    var f = req.query.folderName;
    if (typeof t=='undefined') t='';
    if ( f==null) f='';
    try{
        fs.mkdirSync(__dirname+'/'+t+'/'+f);
    }catch (e){
        console.error('이미 있는 폴더');
    }
});
app.post('/api/rndir/', function(req,res){
    var t = req.query.currentPath;
    var f = req.query.folderName;
    var o = req.query.originalName;
    if (typeof t=='undefined') t='';
    console.log(__dirname+'/'+o+'-->'+__dirname+'/'+t+'/'+f);
    fs.renameSync(__dirname+'/'+o,__dirname+'/'+t+'/'+f);
});
app.post('/api/unlink/', function(req,res){
    var o = req.query.originalName;
    console.log('del '+__dirname+'/'+o);
    try{
        rimraf.sync(__dirname + '/' + o);
    }catch(e){

    }
});
app.post('/api/upload/', function (req, res) {

    //req.files.userFile.name.append('/'+id);
    res.send({image: false, file: req.files.userFile.originalname, savedAs: req.files.userFile.name});
});
app.get('/scan', function(req,res){
    var tree = scan('.', 'files');
	res.send(tree);
});

// Everything is setup. Listen on the port.

app.listen(port);
module.exports = app;
console.log('FileServer is running on port ' + port);