#loklak webclient

[![Join the chat at https://gitter.im/loklak/loklak](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/loklak/loklak)
[![Build Status](https://travis-ci.org/fossasia/loklak_webclient.svg?branch=master)](https://travis-ci.org/fossasia/loklak_webclient)
[![Code Climate](https://codeclimate.com/github/loklak/loklak_webclient/badges/gpa.svg)](https://codeclimate.com/github/fossasia/loklak_webclient)
[![codecov](https://codecov.io/gh/fossasia/loklak_webclient/branch/master/graph/badge.svg)](https://codecov.io/gh/fossasia/loklak_webclient)
[![Dependency Status](https://gemnasium.com/badges/github.com/fossasia/loklak_webclient.svg)](https://gemnasium.com/github.com/fossasia/loklak_webclient)

The loklak webclient creates services using the loklak server as a data source. The goal is to develop a fully fledged alternative to closed source twitter like frontend applications. In order to run the service you can use the API of http://loklak.org or install your own loklak server data storage engine. For some parts of the service you require a twitter API currently (to be discontinued in the future). loklak.org is a server application which collects messages from various social media tweet sources, including twitter. The server contains a search index and a peer-to-peer index sharing interface. All messages are stored in an elasticsearch index.

--

## Communication

Please join our mailing list to discuss questions regarding the project: https://groups.google.com/forum/#!forum/loklak

Our chat channel is on gitter here: https://gitter.im/loklak/loklak

## Demo version

The goal is to have a demo version that is automatically deployed from our repositories to Heroku.

## Installation

### Build

1. Install `git`, `npm`, `nodejs`, `nasm`, `libpng-dev` and `dh-autoreconf`packages. 
   Run the commands as:
    * `sudo apt-get install git-core`
    * `sudo apt-get install npm`
    * `sudo apt-get install nodejs`
    * `sudo apt-get install nasm`
    * `sudo apt-get install libpng-dev`
    * `sudo apt-get install dh-autoreconf`
2. Run `sudo npm install -g gulp` to install `gulp` systemwide as a tool to run the task.
3. Clone this repo from `https://github.com/loklak/loklak_webclient.git`
4. Create your custom settings file by doing
   `cp configFile.json custom_configFile.json`.
   Edit your settings inside `custom_configFile.json`.
5. Run `npm install` from the root directory **AND** from `oauth-proxy` subdirectory, **AND** from `iframely`

## Technology Stack

### Components

* Nodejs

## Services and Dependencies

The goal is to use [Bower](http://bower.io) to manage front-end dependencies in future.
### Twitter
Create a Twitter application at [https://apps.twitter.com](https://apps.twitter.com), remember to set the correct website url & callback url (for localhost, `http://127.0.0.1/` works better), then modify `custom_configFile.json` as:
* Set the twitterConsumerKey var in `custom_configFile.json` to set the Consumer Key (API Key) from your Twitter app
* Set the twitterConsumerSecret var in `custom_configFile.json` to set the Consumer Secret from your Twitter app  

A twitter app is valid only for a domain (defined when creating the app). So the credentails above need to be changed also according to the domain (e.g. you'll need to create 2 twitter apps separately for a clone in localhost and for a clone in a remote server)

### Loklak Server
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

## Contributions, Bug Reports, Feature Requests

This is an Open Source project and we would be happy to see contributors who report bugs and file feature requests submitting pull requests as well. Please report issues in the GitHub tracker.

## Branch Policy

We have the following branches
 * **development**
	 All development goes on in this branch. If you're making a contribution,
	 you are supposed to make a pull request to _development_.
	 PRs to master must pass a build check and a unit-test check on Travis
 * **master**
   This contains shipped code. After significant features/bugfixes are accumulated on development, we make a version update, and make a release.


## License

This project is currently licensed under the The MIT License (MIT). A copy of LICENSE.md should be present along with the source code. To obtain the software under a different license, please contact FOSSASIA.

