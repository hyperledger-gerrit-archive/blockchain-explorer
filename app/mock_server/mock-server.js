/**
 * Mock Server
 * endpoint api, see doc at:
 * https://docs.google.com/document/d/1_BVSMZCfyQLUuWIbxbi14mWT0b8v0O-OelQOdTIH50Q/edit?usp=sharing_eil&ts=5a6f1534
 *
 */

var express = require("express");
var path = require('path');
var app = express();
var http = require('http').Server(app);
var router = express.Router();
var bodyParser = require('body-parser');
app.use(express.static(path.join(__dirname, './client/build')));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: true }));
///home/nfrunza/workspace/blockchain-explorer/config.json
var config = require('../../../config.json');
var host = process.env.HOST || config.host;
var port = process.env.PORT || config.port;

var status = require('./routes/status');

//routes
//  curl -i 'http://localhost:8080/api/status/mychannel'
router.get('/api/status/:channel', function (req, res) {
    status.getStatus(req, res)
});


app.use('/', router);
//var server = http.
app.listen(port, function () {
    console.log(`Please open Internet explorer to access ：http://${host}:${port}/`);
});

module.exports = app; // for testing

