var http = require('http');
var express = require('express');

var app = express();
var server = http.createServer(app);

app.get("/", function(req, res) {
    res.send("Hello world!");
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
