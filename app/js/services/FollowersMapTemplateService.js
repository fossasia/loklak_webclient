'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function FollowersMapTemplateService($filter) {

  var service = {};

  service.genStaticTwitterFollower = function(followers , i) {
    var result = "";
    console.log("Banner photo is"+followers.profile_banner[i]);
    result = '<div class="left-result-container col-lg-12 col-md-12 col-sm-12">'
            +'<div class="home-user-info">'
            +   '<div class="blue-background-placeholder">'
            +        '<img src="'+followers.profile_banner[i]+'" >'    
            +    '</div>'
            +     '<div class="home-user-info-content">'
            +        '<div class="top-content">'
            +            '<img src="'+followers.propic[i]+'">'
            +            '<div class="name-and-screen-name">'
            +                '<span class="home-user-name">'+followers.name[i]+'</span><br>'
            +               '<span class="home-user-screen-name">@'+followers.screenname[i]+'</span>'
            +            '</div>'
            +       '</div>'
            +       '<div class="bottom-content">'
            +            '<div class="user-no-tweets">'
            +               '<a href="">Tweets<br><span>'+followers.tweetcount[i]+'</span></a>'
            +            '</div>'
            +            '<div class="user-no-followings">'
            +                '<a href="">Followings<br><span>'+followers.following[i]+'</span></a>'
            +            '</div>'
            +            '<div class="user-no-followers">'
            +                '<a href="">Followers<br><span>'+followers.followers[i]+'</span></a>'
            +            '</div>'
            +        '</div>'
            +    '</div>'
            +'</div>'

    return result;


  };
 service.genStaticTwitterFollowing = function(following , i) {
    var result = "";
    console.log("Banner photo is"+following.profile_banner[i]);
    result = '<div class="left-result-container" ng-show="root.twitterSession">'
            +'<div class="home-user-info">'
            +   '<div class="blue-background-placeholder">'
            +        '<img src="'+following.profile_banner[i]+'" >'    
            +    '</div>'
            +     '<div class="home-user-info-content">'
            +        '<div class="top-content">'
            +            '<img src="'+following.propic[i]+'">'
            +            '<div class="name-and-screen-name">'
            +                '<span class="home-user-name">'+following.name[i]+'</span><br>'
            +               '<span class="home-user-screen-name">@'+following.screenname[i]+'</span>'
            +            '</div>'
            +       '</div>'
            +       '<div class="bottom-content">'
            +            '<div class="user-no-tweets">'
            +               '<a href="">Tweets<br><span>'+following.tweetcount[i]+'</span></a>'
            +            '</div>'
            +            '<div class="user-no-followings">'
            +                '<a href="">Followings<br><span>'+following.following[i]+'</span></a>'
            +            '</div>'
            +            '<div class="user-no-followers">'
            +                '<a href="">Followers<br><span>'+following.followers[i]+'</span></a>'
            +            '</div>'
            +        '</div>'
            +    '</div>'
            +'</div>'

    return result;


  };



  return service;

}

servicesModule.service('FollowersMapTemplateService', ['$filter', FollowersMapTemplateService]);
