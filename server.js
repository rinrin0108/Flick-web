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

/* ����������� */
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

/* �ե�å����������� */
app.post('/flick', function(req, res, next) {
  console.log("Flick request:" + req.body.jsondata);
  var card = req.body.jsondata;
  card.time = (new Date()).getTime();

  Card.create(card, function (err, data) {
    if (err) throw new Error(err);
    res.send('{ result: "ok" }');
  });
});

/* �ե�å���������� */
app.get('/pull', function(req, res, next){
  // ���������ϰϤε�Υ��᡼�ȥ�ñ�̤ǻ���
  var maxDistance = 100;
  // ���������ϰϤλ��֤���ñ�̤ǻ���
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

/* �ǥХå��ѡ����ƤΥե�å���������� */
app.get('/getAllFlick', function(req, res, next){
  Card.find({}, function(err, doc){
    res.send(doc);
  });
});

/* �ǥХå��ѡ����ƤΥե�å��������� */
app.get('/removeAllFlick', function(req, res, next){
  Card.remove({}, function(err, doc){
    res.send("{'result':'ok'}");
  });
});

app.listen(3000);

