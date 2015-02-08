#!/usr/local/bin/node

var request = require('request');

var url = (process.argv[2]) ? process.argv[2] : false;
if (url) {
  request.post('http://api.imgs.io/v1/images', {form: {
    type: 'url',
    file: url
  }}, function(error, response, body) {
    console.log(body);
  });
}