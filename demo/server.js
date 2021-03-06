var path = require('path');
var express = require('express');
var webpack = require('webpack');
var webpackMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var config = require('./webpack.config.js');
var osPath = require('./osPath');

var isDeveloping = process.env.NODE_ENV !== 'production';
var port = isDeveloping ? 3000 : process.env.PORT;
var app = express();
var formidable = require('formidable');

var isValidUsername = true;
app.post('/username', function (req, res) {
  setTimeout(function () {
    isValidUsername = !isValidUsername;
    res.status(isValidUsername ? 200 : 500);
    res.send({
      available: isValidUsername,
      message: isValidUsername ? null : 'Not valid username'
    });
  }, 500);
});


app.post( '/upload' , function(req, res ){
     var form = new formidable.IncomingForm({
     	uploadDir: osPath(),
        keepExtensions: true
     });
     form.on('progress', function(bytesReceived, bytesExpected) {
        var percent_complete = (bytesReceived / bytesExpected) * 100;
    });
    
    form.on('end', function(fields, files) {
        res.send({});
    });
    
    form.parse(req);
});

if (isDeveloping) {
  var compiler = webpack(config);
  var middleware = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    contentBase: 'src',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false
    }
  });

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));
  app.get('*', function response(req, res) {
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')));
    res.end();
  });
} else {
  app.use(express.static(__dirname + '/dist'));
  app.get('*', function response(req, res) {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  });
}

app.listen(port, '0.0.0.0', function onStart(err) {
  if (err) {
    console.log(err);
  }
  console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});
