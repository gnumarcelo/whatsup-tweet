var   express     = require('express')
    , TwitterNode = require('twitter-node').TwitterNode
    , sys         = require('sys')
    , nowjs       = require('now');

//express setup
var app = express.createServer();
app.configure(function(){
    app.use(express.logger());
    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/public'));
});
app.listen(8000);

//twitter configs to connect to the twitter stream.
var twit = new TwitterNode({
    user: 'your_user', //set your twitter user here
    password: 'your_pass' //set your twitter pass here
});

//This function will be used by the 'tweet' event Emmiter
var onTweetListener = function(tweet){
        console.log('tweet: '+ '@' + tweet.user.screen_name + ': ' + tweet.text );
        everyone.now.renderStream(tweet.user.profile_image_url , tweet.user.screen_name, tweet.text);
};

twit
    .on('error', function(error){
        console.log('error: ' + error.message);
    })
    .on('tweet', onTweetListener)
    .on('end', function(resp){
        console.log('end:' + resp.statusCode);
    });

//Now.js initialization
everyone  = nowjs.initialize(app);
everyone.now.totalConnected = 0;

everyone.connected(function(){
  console.log('user connected: ' + this.user.clientId);
  everyone.now.updateTotalConnected(++everyone.now.totalConnected);
});
everyone.disconnected(function(){
  console.log('user disconnected: ' + this.user.clientId);
  everyone.now.updateTotalConnected(--everyone.now.totalConnected);
});

//Now.js functions called by the client
everyone.now.stopStreaming = function(){
  console.log('stoping the streaming: ' + this.user.clientId);
  twit.removeListener('tweet', onTweetListener);
};
everyone.now.goStreaming = function(term){
  console.log('search for: ' + term);
  everyone.now.clearContent();
  twit.trackKeywords = [];
  twit.track(term).stream();
  twit.removeListener('tweet', onTweetListener);
  twit.on('tweet', onTweetListener);
};