var express = require('express');
var bodyParser = require('body-parser');
// var Promise = require('bluebird').Promise;
// var httpR = Promise.promisifyAll(require('http-request'));
var natural = require('natural');
var unirest = require('unirest');
var db = require('./db/config');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


var blackBox = function(description, imgUrl, callback){
  var classification;

  natural.BayesClassifier.load('./app/classifier.json', null, function(err, classifier) {
    console.log('ABOVE: ', description);
    classification = classifier.classify(description.name);
    console.log('INSIDE BLACKBOX: ', classification);

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

/////////////
// UNIREST //
/////////////

var getReq = function(token, imgurl, callback){
  unirest.get("https://camfind.p.mashape.com/image_responses/" + token)
    .header("X-Mashape-Key", process.env.CAMFIND_KEY)
    .header("Accept", "application/json")
    .end(function (result) {
      if(result.body.status === 'completed'){
        //run blackbox function
        console.log('THE DESCRIPTION: ', result.body);
        console.log('RESULTBODYNAME: ', result.body.name, 'REQ.BODY.IMGURL: ', imgurl);
        callback(result.body, imgurl)
      } else {
        console.log('NOT COMPLETED: ', result.body)
        getReq(token, imgurl, callback);
      }
  });
};

app.get('/api/test', function(req, res){
  res.send(200, 'SUCCESS!');
});

app.post('/api/imgurl', function(req, res){
  console.log('DATA FROM CLIENT: ', req.body);

  unirest.post("https://camfind.p.mashape.com/image_requests") //POST request sends image url & location to get a token
    .header("X-Mashape-Key", process.env.CAMFIND_KEY)
    .header("Content-Type", "application/x-www-form-urlencoded")
    .header("Accept", "application/json")
    .send({
      "image_request[locale]": req.body.locale,
      "image_request[remote_image_url]": req.body.imgurl
    })
    .end(function (result) { //GET request for the token is passed and a description is returned
      console.log('THE RESULT: ', result.body)

      getReq(result.body.token, req.body.imgurl, function(resultBody, imgURL){
        blackBox(resultBody, imgURL, function(description){
          res.send(200, description);
        });
      });

      // unirest.get("https://camfind.p.mashape.com/image_responses/" + result.body.token)
      //   .header("X-Mashape-Key", process.env.CAMFIND_KEY)
      //   .header("Accept", "application/json")
      //   .end(function (result) { //BLACKBOX is called on the resulting description
      //     console.log('THE DESCRIPTION: ', result.body);
      //       if(result.body.status === 'skipped'){ //BASED ON THE API: if there is a status skipped then that means there's an error
      //         console.log('ERROR!')
      //       }
      //       // res.send(200, blackBox(result.body.name, req.body.imgurl));
      //       blackBox(result.body.name, req.body.imgurl, function(category){
      //         res.send(201, category);
      //       })
      //   });
    });
});

// TODO:
// - Send the classification to the client

app.listen(process.env.PORT || 8080);

///////////
// NOTES //
///////////

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

//////////////////////
// FOR USING HTTP-R //
//////////////////////

// app.post('/api/imgurl', function(req, res){
//   //should get locale and image url
//     //which will be passed into the post request
//     return httpR.postAsync({
//       headers: header,
//       url: 'https://camfind.p.mashape.com/image_requests',
//       'image_request[locale]': req.body.locale,
//       'image_request[remote_image_url]': req.body.imgurl
//     })
//   .then(function(err, data){
//     //send the location and url to the server and set the data
//     // data = response-data
//     return httpR.getAsync({
//       url: 'https://camfind.p.mashape.com/image_responses/' + data
//     })
//   })
//   .then(function(err, data){
//     if(data.status === 'skipped'){
//       throw error;
//     }
//   })
//   // .catch(function(e){ //if(data.status === 'skipped') execute error path
//   //   if(e.status === 'skipped'){
//   //     console.error('Your image is too blurry');
//   //   }
//   // })
//   .then(function(err, data){
//     //pass the definition to the blackbox
//     return blackBox(data.name);
//   })

// })