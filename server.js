var express = require('express');
var app = express();
var url = require('url');
var mongo = require('mongodb').MongoClient;

function generateAleatoryNumber(){
    var nr = Math.floor((Math.random() * 9999) + 1);
    var lng = nr.toString().length;
    var ret = nr.toString();
    if(lng < 4){
        for(var i = lng; i < 4; i++){
            ret = "0" + ret;
        }
    }
    return ret;
}

app.get('/new/*', function(req,res){
    var url_parts = url.parse(req.url, true);
    var originalUrl = url_parts["path"].toString().substring(5,url_parts["path"].toString().length);
    var newUrl = generateAleatoryNumber();
    var obj1 = {};
    mongo.connect('mongodb://localhost:27017/url-shortener', 
    	function(err, db) {
    		if (err) throw err;
    		obj1 = { 'original_url': originalUrl, 'short_url': newUrl };
    		var collection = db.collection("urls");
    		collection.insert(obj1,function(err,data){
    			if(err) throw err;
    			db.close();
    			res.send(JSON.stringify({  "original_url":originalUrl, "short_url":"https://" + req.get('host') + "/" + newUrl }));
    		});
    	}
    );
});
 
app.get('/:numbr', function(req,res){
    mongo.connect('mongodb://localhost:27017/url-shortener', 
    	function(err, db) {
    		if (err) throw err
    		var collection = db.collection("urls");
    		collection.find( { 
    		    "short_url": req.params.numbr.toString() 
    		} ).toArray(function(err, documents){
    			if (err) throw err;
    			db.close();
        		res.redirect(documents[0].original_url);
    		});
    	}
    );
});

app.listen(8080, function(){
	console.log("Listening on port 8080");
});