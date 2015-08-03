var express = require('express');
var app = express();
var mongoose = require('mongoose');
var fs = require('fs');
require('date-utils');

var SERVERPATH = '/opt/flick';
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://10.100.0.5/flick');

/* スキーマ定義 */
mongoose.model('card', new mongoose.Schema({
  userid:       String,
  time:         Number,
  location:{
    type:  [Number],
    index: '2d'
  },
  data:	        String
}));
Card = mongoose.model('card');

/* フリックを送信する */
app.post('/flick', function(req, res, next) {
  console.log("Flick request:" + req.body.jsondata);
  var card = req.body.jsondata;
  card.time = (new Date()).getTime();

  Card.create(card, function (err, data) {
    if (err) throw new Error(err);
    res.send('{ result: "ok" }');
  });
});

/* フリックを取得する */
app.get('/pull', function(req, res, next){
  // 受け取れる範囲の距離をメートル単位で指定
  var maxDistance = 100;
  // 受け取れる範囲の時間を秒単位で指定
  var time = 15;

  maxDistance /= (6371*1000);
  var time_from = (new Date()).getTime()-(1000*time);

  console.log("Pull request by:" + req.param('userid') + ", location:[" + req.param('lng') + ", " + req.param('lat') + "].");

  Card
    .find({
      location : {
        $near        : [req.param('lat'), req.param('lng')],
        $maxDistance : maxDistance
      },
      time : {
        $gte : time_from
      }
    })
    .sort( 'time' )
    .exec( function(err, doc){
      res.send(doc);
    });
});

/* デバッグ用：全てのフリックを取得する */
app.get('/getAllFlick', function(req, res, next){
  Card.find({}, function(err, doc){
    res.send(doc);
  });
});

/* デバッグ用：全てのフリックを削除する */
app.get('/removeAllFlick', function(req, res, next){
  Card.remove({}, function(err, doc){
    res.send("{'result':'ok'}");
  });
});

app.listen(3000);

