var http  = require('http');
var url   = require('url');
var fs    = require('fs');

http.createServer(function (req, res) {

  var path = url.parse(req.url).pathname;
  var value;

  console.log('path', path);

  if(path == "/save") {

    req.on('data', function (data) {
      value = JSON.parse(data);
    });

    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin' : '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'
    });

    res.end('updated');
  }

}).listen(8080);