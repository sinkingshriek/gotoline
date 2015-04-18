var http = require('http');
var https = require('https');
var express = require('express');
var router = express.Router();
var pageModel = require('../models/page');
var positionify = require('../lib/core/scroll');
var scrollify = require('../lib/scripts/scroll');
var splitter = /(<\/body>)/;

router.get('/?', function(req, res) {
  res.render('page', pageModel.getPage());
});

router.get('/:id', function(req, response) {
  pageModel.getPage(req.params.id, function(err, res) {
  var url = res.toString();
    if (err) {
      return new Error(err);
    }
    try {
      http.get(url, injectScript(response, url));
    } catch (e) {
      console.log("trying https..");
      https.get(url, injectScript(response, url));
    }
  });
});

module.exports = router;

function injectScript(resp, url) {
  return function(dat) {
    var serve = '';
    dat.on('data', function(res) {
      serve += res.toString();
    });
    dat.on('end', function() {
      var slicedUp = serve.split(splitter);
      slicedUp.splice(2, 0, scrollify(0, positionify.getScrollTo(url)));
      resp.status(200).send(slicedUp.join(''));
    });
  };
}
