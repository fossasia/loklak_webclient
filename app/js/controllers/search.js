'use strict';

var controllersModule = require('./_index');
/**
 * @ngInject
 */
function SearchCtrl($http, AppSettings, SearchService) {
  var vm = this;

  vm.update = function(term) {
  	SearchService.getStatuses(term)
    	.then(function(statuses) {
        	vm.statuses = statuses;
          console.log(statuses);
          console.log(sortIntoDates(statuses));
          console.log(sortIntoUsers(statuses));
          console.log(sortIntoMentions(statuses));
          console.log(sortIntoTags(statuses));
        },
        function() {
        	console.log('statuses retrieval failed.');
        });
  };
}

controllersModule.controller('SearchCtrl', SearchCtrl);


/*
 * Take tweets array as input
 * Return an array contains date keys
 * in which values are tweet objects
 */

function sortIntoDates(tweetArray) {
  var sorted = [],
      newArray = JSON.parse(JSON.stringify(tweetArray));

  // Add date object, ascending order
  newArray.forEach(function(element) {
    element.created_at = new Date(element.created_at);
  });
  newArray.reverse();

  // Sort into days
  newArray.forEach(function(element) {
    var createdDate = element.created_at.toDateString();
    if(!sorted[createdDate]) {
      sorted[createdDate] = [];
    };
    sorted[createdDate].push(element);
  })

  return sorted;
}

/*
 * Take tweets array as input
 * Return an array contains screen_name key
 * in which value is an object
 * where property obj.ratio as string
 * and obj.tweets as array of tweets object
 */

function sortIntoUsers(tweetArray) {
  var sorted = [],
      newArray = JSON.parse(JSON.stringify(tweetArray));

  // Sort into users
  newArray.forEach(function(element) {
    var user = element.user.screen_name;
    if(!sorted[user]) {
      sorted[user] = {};
      sorted[user].tweets = [];
      sorted[user].ratio = "0";
    }
    sorted[user].tweets.push(element);
  })

  // Add percentage user no. tweets : all tweets
  for (var key in sorted) {
    sorted[key].ratio =  (sorted[key].tweets.length / newArray.length * 100).toFixed(2);
  }

  return sorted;
}

/*
 * Take tweets array as input
 * Return an array contains mention key
 * in which value is an object
 * where property obj.ratio as string
 * and obj.tweets as array of tweets object
 */

function sortIntoMentions(tweetArray) {
  var sorted = [],
      newArray = JSON.parse(JSON.stringify(tweetArray));

  newArray.forEach(function(element) {
    if(element.mentions_count != 0) {
      var userArray = element.mentions;
      userArray.forEach(function(mention) {
         if (mention != " ") { // A nention can be an empty string @
          if(!sorted[mention]) {
            sorted[mention] = {};
            sorted[mention].tweets = [];
            sorted[mention].ratio = "0";
          }  
          sorted[mention].tweets.push(element);
        }
      });  
    }   
  });

  // Add percentage user no. tweets : all tweets
  for (var key in sorted) {
    sorted[key].ratio =  (sorted[key].tweets.length / newArray.length * 100).toFixed(2);
  }

  return sorted;
}

/*
 * Take tweets array as input
 * Return an array contains tag key
 * in which value is an object
 * where property obj.ratio as string
 * and obj.tweets as array of tweets object
 */

function sortIntoTags(tweetArray) {
  var sorted = [],
      newArray = JSON.parse(JSON.stringify(tweetArray));

  newArray.forEach(function(element) {
    if(element.hashtags_count != 0) {
      var userArray = element.hashtags;
      userArray.forEach(function(tag) {
        if(!sorted[tag]) {
          sorted[tag] = {};
          sorted[tag].tweets = [];
          sorted[tag].ratio = "0";
        }  
        sorted[tag].tweets.push(element);
      });  
    }   
  });

  // Add percentage user no. tweets : all tweets
  for (var key in sorted) {
    sorted[key].ratio =  (sorted[key].tweets.length / newArray.length * 100).toFixed(2);
  }

  return sorted;
}


