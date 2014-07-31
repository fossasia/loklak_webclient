var express        = require('express'),
    morgan         = require('morgan'),
    app            = express();

app.use(morgan('dev'));     // logs all requests to the console
app.set('json spaces', 0);  // remove superfluous spaces from JSON responses

// serve all asset files from necessary directories
app.use("/bower_components", express.static(__dirname + "/bower_components"));
app.use(express.static(__dirname + '/app'));

// serve index.html for all routes, in order to leave routing up to angular
app.all("/*", function(req, res, next) {
    res.sendfile("index.html", { root: __dirname + "/app" });
});

app.listen(process.env.PORT || 3000);