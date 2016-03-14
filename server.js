/*
  User Stories:   
    - I can pass a URL as a parameter and I will receive a shortened URL in the JSON response.  
    - If I pass an invalid URL that doesn't follow the valid http://www.example.com format, the JSON response will contain an error instead.
    - When I visit that shortened URL, it will redirect me to my original link.
  
  Example output:
    { "original_url": "http://freecodecamp.com/news", "short_url": "https://luuk-url-shortener-ms.herokuapp.com/4" } 
*/

var path = require("path");
var http = require('http');
var express = require('express');
var mongo = require("mongodb").MongoClient;

var app = express();
var server = http.createServer(app);

var URL = "https://luuk-url-shortener-ms.herokuapp.com/";
var mongoURL = "mongodb://client:client@ds013579.mlab.com:13579/freecodecamp-database";

app.use(express.static(path.resolve(__dirname, "client")));

app.get("/:short", function(req, res) {
    var short_url = URL + req.url;
    // Search the database for the original_url using the short_url.
    mongo.connect(mongoURL, function(err, db) {
        if (err) { throw err; }
        var original_url = "";
        
        db.collection("url-pairs").find({
            short_url: short_url
        }).toArray(function(err, documents) {
            if (err) { throw err; }
            original_url = documents[0].original_url;
            res.redirect(original_url);
            db.close();
        });
    });
});

app.get("/new/:query*", function(req, res) {
    var original_url = req.url.replace("/new/", "");
    // Make sure the URL has the right format ("http://www.example.com"), as specified in the FCC instruction video. 
    // Add missing http// or https//. 
    if (!original_url.match(/^http:\/\/.+$/) && !original_url.match(/^https:\/\/.+$/) )
    {
      original_url = "http://" + original_url;
    }
    // Handle request if the original URL has at least 1 dot. Else return error.
    if (original_url.match(/\w\.\w/g))
    { 
      // Create the new short_url and add it to the database.  
      mongo.connect(mongoURL, function(err, db) {
        if (err) { throw err; } 
        var collection = db.collection("url-pairs");
        var count = 0;
        var short_url = "";
        
        // Get the number for the new short_url by counting the previous short_url entries.
        collection.count({}, function(err, count) {
            if (err) { throw err; }
            short_url = URL + "/" + count;
            // Insert the new original/short pair.
            collection.insert({
                original_url: original_url,
                short_url: short_url
            }, function(err, result) {
                    if (err) { throw err };
                    db.close();
                    res.send({original_url: original_url, short_url: short_url});
            });
        });
      });
    }
    else
    {
      res.send({error: "URL invalid"});
    }   
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("App listening at", addr.address + ":" + addr.port);
});
