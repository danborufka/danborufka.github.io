var express = require("express");
var myParser = require("body-parser");
var app = express();

app.use(myParser.urlencoded({extended : true}));
app.post("/save", function(request, response) {
  console.log(request.body);
  response.end('It worked!');
});

app.listen(8080);