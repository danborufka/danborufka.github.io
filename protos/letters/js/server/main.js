const http  		= require('http');
const url   		= require('url');
const fs    		= require('fs');
const md5 			= require('md5');
const debug 		= require('cli-color');

const baseDirectory = '../../games/';

let statusCode 		= 404;
let status 			= debug.red('No payload received.');

function _success(msg) {
	statusCode = 200;
	status = msg;
	console.log(debug.green(msg));
}
function _fail(msg) {
	statusCode = 404;
	status = msg;
	console.error(debug.red(msg));
}

http.createServer((req, res) => {

  const _url = url.parse(req.url);
  const path = _url.pathname;
  
  let body = [];

  if(path == "/save") {

    req.on('data', data => {
    	body.push(data);
    	console.log(debug.yellow('Receiving data …'));
    });

    req.on('end', () => {
    	body = Buffer.concat(body).toString();

    	if(body) {
    		var directive = JSON.parse(body);
    		var state = md5(body);

    		if(directive.file) {
    			fs.writeFileSync(`${baseDirectory}${directive.file}`, directive.content);
    			_success(`Saved ${directive.file} – ${state}`);
    		} else _fail('No filename supplied.');
    	} else _fail('Wrong payload!');

    	res.writeHead(statusCode, {
		  'Content-Type': 'text/plain',
		  'Access-Control-Allow-Origin' : '*',
		  'Access-Control-Allow-Methods': 'GET,POST'
		});
		res.end(status);
    });
  }

}).listen(8080);

console.log('Danimator server up and running.');