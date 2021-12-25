var express = require('express');
const request = require('request');
var router = express.Router();

router.get('/', function (req, res, next) {
  var url = 'https://www.gov.uk/bank-holidays.json'
  var options = {
    method: 'get',
    json: true,
    url: url
  }

  request(options, function (err, _, body) {
    if (err) { return console.log(err); }
    res.send(body);
  });
});

module.exports = router;
