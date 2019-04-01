//required packages
const express = require('express');
const cors = require('cors');
const monk = require('monk');
const Filter = require('bad-words')

//Declare new express applicaation
const app = express();

//Connect to DB Projects and get collection called Twitter-Clone
const db = monk('mongodb://brandon123:brandon123@cluster0-shard-00-00-j8mex.mongodb.net:27017,cluster0-shard-00-01-j8mex.mongodb.net:27017,cluster0-shard-00-02-j8mex.mongodb.net:27017/Projects?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true');
const tweets = db.get('Twitter-Clone');

//Create new filter object to filter out bad words
const filter = new Filter();

//Use CORS package to allow cross origin access from anywhere
app.use(cors());

//Use express json method
app.use(express.json());

//Respond with all tweets from collection when get request is made
app.get('/tweets', (req, res) => {

  tweets
        .find()
        .then(tweets => {
          res.json(tweets);
        })

});

//Insert name and tweet to db when post request is made
app.post('/tweets', (req, res) => {

  //if request body is not empty then insert into db
  if(isNotEmpty(req.body)){
    console.log(req.body);

    //Set body to tweet object
    const tweet = {
      //convert name/message to string and filter out bad words
      name: filter.clean(req.body.name.toString()),
      message: filter.clean(req.body.message.toString()),
      created: new Date() //add current date
    };

    //insert tweet object to db
    tweets
        .insert(tweet)
        .then(newTweet => {
          res.json(newTweet);
        });
  }

  //if content is empty respond with 422 error
  else {
    res.status(422);
    res.json({
      message: "Need Content"
    });
  }

});


//Check to see if content is not empty
function isNotEmpty(tweet){
  if (tweet.name && tweet.message != ''){
    return true
  }
  else {
    return false;
  }
}

//Start Listening on port 5000
app.listen(process.env.PORT || 5000 , () => console.log("Connection Sucessfull"));
