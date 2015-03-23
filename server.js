var express = require('express');
var bodyParser = require('body-parser');
var natural = require('natural');
var unirest = require('unirest');
var db = require('./db/config');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


var blackBox = function(description, imgUrl, callback){
  var classification;

  natural.BayesClassifier.load('./app/classifier.json', null, function(err, classifier) {
    classification = classifier.classify(description.name);

    db.db.sync().then(function() {
      return db.Item.create({
        category: classification,
        description: description.name,
        url: imgUrl
      })
      .then(function(newItem){
        callback(newItem.get('category'));
      });
    });
  });
}

var getReq = function(token, imgurl, callback){
  unirest.get("https://camfind.p.mashape.com/image_responses/" + token)
    .header("X-Mashape-Key", process.env.CAMFIND_KEY)
    .header("Accept", "application/json")
    .end(function (result) {
      if(result.body.status === 'completed'){
        callback(result.body, imgurl)
      } else {
        getReq(token, imgurl, callback);
      }
  });
};

app.get('/api/test', function(req, res){
  res.send(200, 'SUCCESS!');
});

app.post('/api/imgurl', function(req, res){
  unirest.post("https://camfind.p.mashape.com/image_requests")
    .header("X-Mashape-Key", process.env.CAMFIND_KEY)
    .header("Content-Type", "application/x-www-form-urlencoded")
    .header("Accept", "application/json")
    .send({
      "image_request[locale]": req.body.locale,
      "image_request[remote_image_url]": req.body.imgurl
    })
    .end(function (result) {

      getReq(result.body.token, req.body.imgurl, function(resultBody, imgURL){
        blackBox(resultBody, imgURL, function(description){
          res.send(200, description);
        });
      });
    });
});

app.listen(process.env.PORT || 8080);