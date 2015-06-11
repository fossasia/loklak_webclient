loklak webclient
=====================================

Web client for loklak server (see: https://github.com/loklak/loklak_server ).
To use the loklak webclient, you need a running loklak server.
Install and run it first.

---

### Dev
1. Install git, nodejs, nasm, libpng-dev, dh-autoreconf
2. Clone this repo from `https://github.com/loklak/loklak_webclient.git`
3. Create your custom settings file by doing
   `cp configFile.json custom_configFile.json`.
   Edit your settings inside `custom_configFile.json`.
4. Run `npm install` from the root directory and from the server subdirectory.
5. Run `gulp dev` (may require installing Gulp globally `npm install gulp -g`)
6. Your browser will automatically be opened and directed to the browser-sync
   proxy address (port 3000 by default)
7. To prepare assets for production, run the `gulp prod` task (Note: the
   production task does not fire up the express server, and won't provide you
   with browser-sync's live reloading. Simply use `gulp dev` during
   development. More information below)

Now that `gulp dev` is running, the server is up as well and serving files
from the `/build` directory. Any changes in the `/app` directory will be
automatically processed by Gulp and the changes will be injected to any open
browsers pointed at the proxy address.

### Config

- Set the apiUrl var in `custom_configFile.json`
  to set the server address
- Set the domain var in `custom_configFile.json`
  to set the domain where site is hosted

Create a Twitter app at https://apps.twitter.com
- Set the twitterConsumerKey var in `custom_configFile.json`
  to set the Consumer Key (API Key) from your Twitter app
- Set the twitterConsumerSecret var in `custom_configFile.json`
  to set the Consumer Secret from your Twitter app

### Setting up a twitter application with the correct hosts
1. Edit your hosts file and alias `127.0.0.1     loklak.net` present at /etc/hosts
2. Create a twitter app with the required name
3. Set the callback URL as http://loklak.net:3001/auth/twitter/callback
4. Move to the Keys and Access Tokens tab on the app page and use the credentials present there in custom_configFile.json
5. Use the consumer key (API Key) and Consumer Secret (API Secret) of your application
6. Set the access level to Read and Write

### Deployment to server
1. Follow steps 1-3 of Dev (See above). You will also need `gulp` installed. (`npm install gulp -g`)
2. Minify everything and prepare assets for production using `gulp prod`.
3. Start the node server using `node server/index.js`
4. Better approach is to use [pm2](https://github.com/Unitech/pm2) to start the server using `pm2 start server/index.js`

### Known Authentication issues
In case you encounter a screen with the oauthorize having a long parameter appended to it in the URL, remove the appending URL from `?....` and try again. That should land you onto the `/account` page

###Trial Run
- Try the search feature which lists recent tweets corresponding to a user input keyword at http://localhost:3000/search

### Troubleshooting

- On *nix based systems (latest Ubuntu, Fedora version) you might get an
  `Error: watch ENOSPC` when running `gulp dev`.
   To fix, check [this post](http://stackoverflow.com/questions/16748737/grunt-watch-error-waiting-fatal-error-watch-enospc) on Stackoverflow. 

### Chat with Development Team

[![Join the chat at https://gitter.im/loklak](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/loklak?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
