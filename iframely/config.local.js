'use strict';
(function() {

    var repoConfig = require('../custom_configFile.json');

    var getPosition = function(str, m, i) {
           return str.split(m, i).join(m).length;
    };

    var appDomain = (function() {
      var domain = repoConfig.linkDebuggingServiceHost;
      if (domain.match(/:/g).length > 1) {
         var indexOfPort = getPosition(domain, ":", 2);
         domain = domain.substr(0, indexOfPort);
      }

      return domain;
    })();

    var config = {

        DEBUG: false,
        RICH_LOG_ENABLED: false,

        // For embeds that require render, baseAppUrl will be used as the host.
        baseAppUrl: appDomain,
        relativeStaticUrl: "/r",

        SKIP_OEMBED_RE_LIST: [
            // /^https?:\/\/yourdomain\.com\//,
        ],

        port: repoConfig.linkDebuggingServicePort,

        // Optional SSL cert, if you serve under HTTPS.
        /*
        ssl: {
            key: require('fs').readFileSync(__dirname + '/key.pem'),
            cert: require('fs').readFileSync(__dirname + '/cert.pem'),
            port: 443
        },
        */

        /*
        Supported cache engines:
        - no-cache - no caching will be used.
        - node-cache - good for debug, node memory will be used (https://github.com/tcs-de/nodecache).
        - redis - https://github.com/mranney/node_redis.
        - memcached - https://github.com/3rd-Eden/node-memcached
        */
        CACHE_ENGINE: 'node-cache',
        CACHE_TTL: 0, // In milliseconds. 0 for 'never expire' to let cache engine decide itself when to evict the record

        /*
        // Redis cache options.
        REDIS_OPTIONS: {
            host: '127.0.0.1',
            port: 6379
        },
        */

        /*
        // Memcached options. See https://github.com/3rd-Eden/node-memcached#server-locations
        MEMCACHED_OPTIONS: {
            locations: "127.0.0.1:11211"
        }
        */


        // Access-Control-Allow-Origin list.
        allowedOrigins: [
            appDomain,
            appDomain + ':' + repoConfig.gulpDevExpressPort,
	        appDomain + ':3000',
            repoConfig.domain,
            repoConfig.domain + ':' + repoConfig.gulpDevExpressPort,
            repoConfig.domain + ':3000'
        ],


        /*
        // Uncomment to enable plugin testing framework.
        tests: {
            mongodb: 'mongodb://localhost:27017/iframely-tests',
            single_test_timeout: 10 * 1000,
            plugin_test_period: 2 * 60 * 60 * 1000,
            relaunch_script_period: 5 * 60 * 1000
        },
        */

        // If there's no response from remote server, the timeout will occur after
        RESPONSE_TIMEOUT: 5 * 1000, //ms


        // Customize API calls to 3rd parties. At the very least - configure required keys.
        providerOptions: {
            "twitter.status": {
                "max-width": 550,
                "min-width": 250,
                consumer_key: 'INSERT YOUR VALUE',
                consumer_secret: 'INSERT YOUR VALUE',
                access_token: 'INSERT YOUR VALUE',
                access_token_secret: 'INSERT YOUR VALUE',
                hide_media: false,
                hide_thread: false,
                omit_script: false
            },
            flickr: {
                apiKey: 'INSERT YOUR VALUE'
            },
            "google.maps": {
            //  apiKey: 'INSERT YOUR VALUE' // not required, but recommended
            },
            readability: {
                enabled: false
            },
            images: {
                loadSize: false, // if true, will try an load first bytes of all images to get/confirm the sizes
                checkFavicon: false // if true, will verify all favicons
            },
            tumblr: {
                consumer_key: "INSERT YOUR VALUE"
            },
            google: {
                // https://developers.google.com/maps/documentation/embed/guide#api_key
                // yes, there is already "apiKey" option above, but I am not sure if old keys are the same as the news ones.
                maps_key: "INSERT YOUR VALUE"
            },

            /*
            // Optional Camo Proxy to wrap all images: https://github.com/atmos/camo
            camoProxy: {
                camo_proxy_key: "INSERT YOUR VALUE",
                camo_proxy_host: "INSERT YOUR VALUE"
            },
            */

            // List of query parameters to add to YouTube and Vimeo frames
            // Start it with leading "?". Or omit alltogether for default values
            // API key is optional, youtube will work without it too.
            // It is probably the same API key you use for Google Maps.
            youtube: {
                // api_key: "INSERT YOUR VALUE",
                get_params: "?rel=0&showinfo=1"     // https://developers.google.com/youtube/player_parameters
            },
            vimeo: {
                get_params: "?byline=0&badge=0"     // http://developer.vimeo.com/player/embedding
            }
        },

        // WHITELIST_WILDCARD, if present, will be added to whitelist as record for top level domain: "*"
        // with it, you can define what parsers do when they run accross unknown publisher.
        // If absent or empty, all generic media parsers will be disabled except for known domains
        // More about format: https://iframely.com/docs/qa-format

        /*
        WHITELIST_WILDCARD: {
              "twitter": {
                "player": "allow",
                "photo": "deny"
              },
              "oembed": {
                "video": "allow",
                "photo": "allow",
                "rich": "deny",
                "link": "deny"
              },
              "og": {
                "video": ["allow", "ssl", "responsive"]
              },
              "iframely": {
                "survey": "allow",
                "reader": "allow",
                "player": "allow",
                "image": "allow"
              },
              "html-meta": {
                "video": ["allow", "responsive"]
              }
        }
        */
    };

    module.exports = config;
})();
