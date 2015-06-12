'use strict';

module.exports = {

    'serverport': 3001,

    'styles': {
        'src': 'app/styles/**/*.scss',
        'dest': 'build/css'
    },

    'cssstyles': {
        'src': 'app/styles/**/*.css',
        'dest': 'build/css'
    },

    'scripts': {
        'src': 'app/js/**/*.js',
        'dest': 'build/js'
    },

    'images': {
        'src': 'app/images/**/*',
        'dest': 'build/images'
    },

    'photoswipeicons': {
        'src': 'app/styles/default-skin/*.*',
        'dest': 'build/css/default-skin'
    },

    'fonts': {
        'src': [
            'node_modules/bootstrap-sass/assets/fonts/**/*',
            'app/fonts/**/*'
        ],
        'dest': 'build/fonts'
    },

    'views': {
        'watch': [
            'app/index.html',
            'app/views/**/*.html'
        ],
        'src': 'app/views/**/*.html',
        'dest': 'app/js'
    },

    'gzip': {
        'src': 'build/**/*.{html,xml,json,css,js,js.map}',
        'dest': 'build/',
        'options': {}
    },

    'dist': {
        'root': 'build'
    },

    'browserify': {
        'entries': ['./app/js/main.js'],
        'bundleName': 'main.js',
        'sourcemap': true
    },

    'test': {
        'karma': 'test/karma.conf.js',
        'protractor': 'test/protractor.conf.js'
    },

    'oauth_proxy': {
        'index_file': 'oauth-proxy/index.js',
        'scripts': {
            'src': ['oauth-proxy/index.js', 'oauth-proxy/**/*.js']
        }
    },

    'adminJS': {
        'src': 'app/adminjs/**/*.js',
        'dest': 'build/js'
    }

};
