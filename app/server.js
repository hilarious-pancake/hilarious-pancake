var express = require('express');
var bodyParser = require('body-parser');
var Promise = require('bluebird').Promise;
var httpR = Promise.promisifyAll(require('http-request'));
var natural = require('natural');

var app = express();

classifier = new natural.BayesClassifier();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//POST request coming from conor '/api/imgurl'
  //Input: a picture
  //Output: the picture's URL and location it was taken at

//POST requests going to 'https://camfind.p.mashape.com/image_requests'
  //Input: image_request[remote_image_url], image_request[locale]
  //Output: { 'token': [the token for the image] } JSON format

//GET request going to 'https://camfind.p.mashape.com/image_responses/{token}'
  //Input: Post's output
  //Output: two responses
    //1) Success path { 'status': 'completed', 'name': [the description of the image] }
    //2) Error path { 'status': 'skipped' , 'reason': 'blurry'}

app.post('/api/imgurl', function(req, res){
  //should get locale and image url
    //which will be passed into the post request
  }).then(function(err, data){
    httpR.postAsync('https://camfind.p.mashape.com/image_requests')
  })
  .then(function(err, data){
    //send the location and url to the server and set the data
    // data = response-data
    return httpR.getAsync('https://camfind.p.mashape.com/image_responses/' + data)
  })


var blackBox = function(string){
  //do nlp processing

  //the response data will come in a string

  //should add to the classifier training document

  //should return the trash, compost, or recycle
  return classifier.classify(string);
}




res.set(header);
res.send('image_request[locale]', req.body.locale);
res.send('image_request[remote_image_url]', req.body.imgurl);
