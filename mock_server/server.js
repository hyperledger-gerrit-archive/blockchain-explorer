/*
The Depository Trust & Clearing Corporation. 2018 All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
		 http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


var express = require("express");
var path = require('path');
var app = express();
var http = require('http').Server(app);
var router = express.Router();
var bodyParser = require('body-parser');
app.use(express.static(path.join(__dirname, '../client/build')));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: true }));

var config = require('../config.json');
var host = process.env.HOST || config.host;
var port = process.env.PORT || config.port;

var status = require('../app/routes/status');
var channels = require('../app/routes/channels');
var blocks = require('../app/routes/blocks');
var transactions = require('../app/routes/transactions');

//routes
// get url http://localhost:8080/api/status
router.get('/api/status', function (req, res) {
    status.getStatus(req, res)
});

// get url : http://localhost:8080/api/channels/host_name=example.org
router.get('/api/channels/:host_name', function (req, res) {
    channels.getChannels(req, res)
});
// get url GET http://localhost:8080/api/block/id=2
app.get("/api/block/:id", function (req, res) {
    blocks.getBlockById(req, res)
});

// get url http://localhost:8080/api/block/transactions/number=2
app.get("/api/block/transactions/:number", function (req, res) {
    transactions.getTransactionsByNumber(req, res)
});
// get url http://localhost:8080/api/block/transaction/txid=4
app.get("/api/block/transaction/:txid", function (req, res) {
    console.log('/api/block/transaction/:txid');
    transactions.getTransactionById(req, res)
});


/*



///api/transaction/<txid>
app.get("/api/transaction", function (req, res) {
    console.log('mock server data');
    let txid = req.body.txid
    let apitxgetinfo = require('./mockData/apitxgetinfo.json')
    if (txid != '0') {
        res.send(apitxgetinfo)
    }
    else {
        res.send({})
    }
});

///api/peers
app.post("/peerlist", function (req, res) {
    console.log('mock server data');
    let peerList = require('./mockData/peerList.json')
    res.send(apiblockget);
});
///api/chaincode
app.get('/api/chaincode', function (req, res) {
    console.log('mock server data');
    let chaincodelist = require('./mockData/chaincodelist.json')
    res.send(chaincodelist);

})
*/

app.use('/', router);
//var server = http.
app.listen(port, function () {
    console.log(`Please open Internet explorer to access ：http://${host}:${port}/`);
});

module.exports = app; // for testing

