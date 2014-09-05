'use strict';

module.exports = function(config) {

  config.set({

    basePath: '../',
    frameworks: ['jasmine', 'browserify'],
    preprocessors: {
      'app/js/**/*.js': ['browserify']
    },
    browsers: ['Chrome'],
    reporters: ['progress'],

    autoWatch: true,

    plugins: [
      'karma-jasmine',
      'karma-bro',
      'karma-chrome-launcher',
      'karma-firefox-launcher'
    ],

    proxies: {
      '/': 'http://localhost:9876/'
    },

    urlRoot: '/__karma__/',

    files: [
      // 3rd-party resources
      'node_modules/angular-mocks/angular-mocks.js',

      // app-specific code
      'app/js/main.js',

      // test files
      'test/unit/**/*.js'
    ]

  });

};