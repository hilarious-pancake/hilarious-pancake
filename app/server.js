var express = require('express');
var bodyParser = require('body-parser');
var Promise = require('bluebird').Promise;
var httpR = Promise.promisifyAll(require('http-request'));
var natural = require('natural');

var io = require('socket.io');

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

var blackBox = function(string){
  //do nlp processing

  //the response data will come in a string

  //should add to the classifier training document
    //insert into the schema table

  //should return the trash, compost, or recycle and then sent back to the client
  return classifier.classify(string);
}

app.post('/api/imgurl', function(req, res){
  //should get locale and image url
    //which will be passed into the post request
    return httpR.postAsync({
      headers: header,
      url: 'https://camfind.p.mashape.com/image_requests',
      'image_request[locale]': req.body.locale,
      'image_request[remote_image_url]': req.body.imgurl
    })
  .then(function(err, data){
    //send the location and url to the server and set the data
    // data = response-data
    return httpR.getAsync({
      url: 'https://camfind.p.mashape.com/image_responses/' + data
    })
  })
  .then(function(err, data){
    if(data.status === 'skipped'){
      throw error;
    }
  })
  // .catch(function(e){ //if(data.status === 'skipped') execute error path
  //   if(e.status === 'skipped'){
  //     console.error('Your image is too blurry');
  //   }
  // })
  .then(function(err, data){
    //pass the definition to the blackbox
    return blackBox(data.name);
  })

})

///////////////
// SOCKET IO //
///////////////

// Set up socket connection

io.sockets.on('connection', function(socket){
  console.log('Connected!');

  socket.emit('emitFromServer', blackBox(data))
})

// On the client side
//  - socket IO will need to catch the emitted data
// ex:
// socket.on('emitFromServer', function(serverData){
//   console.log(serverData)
// })



app.listen(8080);