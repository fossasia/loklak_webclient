loklak webclient
=====================================
[![Build Status](https://travis-ci.org/loklak/loklak_webclient.svg?branch=master)](https://travis-ci.org/loklak/loklak_webclient)
[![Code Climate](https://codeclimate.com/github/loklak/loklak_webclient/badges/gpa.svg)](https://codeclimate.com/github/loklak/loklak_webclient)

Web client for loklak server (see: https://github.com/loklak/loklak_server ).
To use the loklak webclient, you need a running loklak server.
Install and run it first.

---

### Build

1. Install the following: `git`, `npm`, `nodejs`, `nasm`, `libpng-dev` and `dh-autoreconf`.
2. Run as root or administrator `npm install -g gulp`
3. Clone this repo from `https://github.com/loklak/loklak_webclient.git`
4. Create your custom settings file by doing
   `cp configFile.json custom_configFile.json`.
   Edit your settings inside `custom_configFile.json`.
5. Run `npm install` from the root directory **AND** from `oauth-proxy` subdirectory, **AND** from `iframely`

### Add twitter credentials
Create a Twitter application at [https://apps.twitter.com](https://apps.twitter.com), remember to set the correct website url & callback url (for localhost, `http://127.0.0.1/` works better), then modify `custom_configFile.json`:
* Set the twitterConsumerKey var in `custom_configFile.json` to set the Consumer Key (API Key) from your Twitter app
* Set the twitterConsumerSecret var in `custom_configFile.json` to set the Consumer Secret from your Twitter app  

A twitter app is valid only for a domain (defined when creating the app). So the credentails above need to be changed also according to the domain (e.g. you'll need to create 2 twitter apps separately for a clone in localhost and for a clone in a remote server)

### Loklak server
See here to run your own https://github.com/loklak/loklak_server (reccommended), and change `apiUrl` in config accordingly. Last resource, or for production is `http://loklak.org/api/`

### Iframely Link Debugging server
Link debugging server is essential to embed rich contents from tweets, e.g. videos, links, articles, photos, ..etc. This need to be ran separately, just like the loklak server. Go to `./iframely`, and run `node server`. It's a **MUST** to be in `./iframely` folder when executing the service. `pm` or *nix `screen` can help managing this service in the background.

## Development
After adding twitter credentials and `apiUrl`, you can leave the rest as is and run `gulp dev` for development. `gulp dev` includes an express server to serve the build at `gulpDevExpressPort`, a proxy server at `oauthProxyPort`, and `browser-sync` at 3000. A browser window will be opened automatically.

For a remote server, along with twitter credential for the remote server: change all `localhost` to your domain e.g. `"oauthProxyUrl": "http://mydomain.org:3002/oauthproxy"`

## Production
We recommend using `screen` of `pm2` to manage your node processes.

1. If you have your own web server engine, `gulp prod` will create static files only at directory `build`. You'll need to run `oauth` service manually by ```node oauth-proxy/index.js``` , and also the debugging service manually, see 'Iframely Link Debugging server'

2. If your server don't have a web serve, `gulp live` will serve the app `gulpDevExpressPort` along with `oauth` service at `oauthProxyPort`. You'll need to run the 'Iframely Link Debugging server' mentioned above manually. 

When there is a need to change default port `oauthProxyUrl, oauthProxyRedirectUrl, oauthProxyPort` should have the same port. The port to the application can be change at `gulpDevExpressPort`

**IMPORTANT** Since OauthProxy instance are also using fields from custom_configFile.json, **if twitter credentials are changed**, including consumerKey, consumerSecret & callbackUrl, **OauthProxy must be restarted**. This only applies for production since in development, the instance is restarted automatically with `gulp dev`

### Troubleshooting

- On *nix based systems (latest Ubuntu, Fedora version) you might get an
  `Error: watch ENOSPC` when running `gulp dev`.
   To fix, check [this post](http://stackoverflow.com/questions/16748737/grunt-watch-error-waiting-fatal-error-watch-enospc) on Stackoverflow. 
- `version 'GLIBC_2.14' not found required by imagemin-jpegtran`. To fix this, make sure you have installed nasm, libpng-dev, dh-autoreconf. Then do `rm node_modules -r` and `npm install`.
- Problem with `node-gyp`? Check if you meet the requirements here: [Link](https://github.com/TooTallNate/node-gyp)

### Chat with Development Team

[![Join the chat at https://gitter.im/loklak](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/loklak?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
