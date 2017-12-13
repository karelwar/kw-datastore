/*jshint esversion: 6*/
var express = require('express');
var moment = require('moment');
var ds = require('./datastore');

process.title = "kw-datastore";

var app = express();

var root = __dirname + '/public/css';

var path = require('path');
var mime = require('mime-types');
var fs = require('fs');   // set the view engine to ejs

var bodyParser = require('body-parser');
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// set host to 127.0.0.1 or the value set by environment var HOST
app.set('host', (process.env.HOST || '127.0.0.1'));

// set port to 8000 or the value set by environment var PORT
app.set('port', (process.env.PORT || 8000));

// Datastore routes
app.get(ds.routes.new_db, function(req, res){
  ds.new_db(req.params.name,state => {
      res.end(JSON.stringify(state));
  });
});

app.get(ds.routes.delete_db, function(req, res){
  ds.delete_db(req.params.name,state => {
    res.end(JSON.stringify(state));
  });
});

app.get(ds.routes.list_kvs, function(req, res) {
  var tmp_kv = [];
  ds.list_kvs(req.params.db,state => {
    res.end(JSON.stringify(state));
  });  
});

app.get(ds.routes.add_kv, function(req,res){
  ds.add_kv(req.params.db,req.params.key,req.params.value,state => {
    res.end(JSON.stringify(state));
  });
});

app.get(ds.routes.get_kv, function(req,res){
  ds.get_kv(req.params.db,req.params.key,state => {
    res.end(JSON.stringify(state));
  });
});

app.get(ds.routes.update_kv, function(req,res){
  ds.update_kv(req.params.db,req.params.id,req.params.key,req.params.value,state => {
    res.end(JSON.stringify(state));
  });
});

app.get(ds.routes.remove_kv, function(req,res){
  ds.remove_kv(req.params.db,req.params.id,state => {
    res.end(JSON.stringify(state));
  });
});


app.listen(app.get('port'), app.get('host'), function() {
  console.log("kw-datastore is running at http://" + app.get('host') + ":" + app.get('port'));
});