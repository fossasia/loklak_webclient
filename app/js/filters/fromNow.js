'use strict';

var filtersModule = require('./_index.js');

/**
 * @ngInject
 */

function twitterFromNowFilter() {
  
  return function(input) {
    var currentTime = new Date();
    var evalTime = new Date(input);
    var difference = (currentTime.getTime() - evalTime.getTime()) / 1000; // in seconds
    var monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    var evalMonth = (monthNames[evalTime.getMonth()]).substr(0,3);

    // Availables formats: 10s, 20m, 23h
    // 24 May 2014 [ealier years], May 24 [same year]
    if (difference < 60) 
      return parseInt(difference) + 's';
    if (difference < 60 * 60)
      return parseInt(difference/60) + 'm';
    if (difference < 24 * 60 * 60)
      return parseInt(difference/60/60) + 'h';
    if (currentTime.getFullYear() !== evalTime.getFullYear())
      return evalTime.getDate()  
             + ' ' + evalMonth
             + ' ' + evalTime.getFullYear();

    return evalMonth + ' ' + evalTime.getDate();
  }
  
}


filtersModule.filter('twitterFromNow', twitterFromNowFilter);