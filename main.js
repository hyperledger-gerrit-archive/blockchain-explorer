/**
 *
 * Created by shouhewu on 6/8/17.
 *
 */

var express = require("express");
var path = require('path');
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var helper = require('./app/helper');
var HttpStatus = require('http-status-codes');
var logger = helper.getLogger('main');

require('./socket/websocketserver.js')(http)

var timer = require('./timer/timer.js')
timer.start()


var query = require('./app/query.js');
var ledgerMgr = require('./utils/ledgerMgr.js')

var statusMetrics = require('./service/metricservice.js')

app.use(express.static(path.join(__dirname, 'client/build')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var config = require('./config.json');
var query = require('./app/query.js');
var sql = require('./db/pgservice.js');

var host = process.env.HOST || config.host;
var port = process.env.PORT || config.port;


var networkConfig = config["network-config"];
var org = Object.keys(networkConfig)[0];
var orgObj = config["network-config"][org];
var orgKey = Object.keys(orgObj);
var index = orgKey.indexOf("peer1");
var peer = orgKey[index];

// =======================   controller  ===================

/**
Return latest status
GET /api/status/get - > /api/status
curl -i 'http://<host>:<port>/api/status/<channel>'
Example Response:
{
  "chaincodeCount": 1,
  "txCount": 3,
  "latestBlock": 2,
  "peerCount": 1
}
 *
 */

app.get("/api/status/:channel", function (req, res) {
    let channelName = req.params.channel
    if (channelName) {
        statusMetrics.getStatus(channelName, function (data) {
            if (data && (data.chaincodeCount && data.txCount && data.latestBlock && data.peerCount)) {
                return res.send(data)
            } else {
                return notFound(req, res)
            }
        })
    }
    else {
        return invalidRequest(req, res)
    }
});


/**
Return list of channels
GET /channellist -> /api/channels
curl -i http://<host>:<port>/api/channels
Example Response:
{
  "channels": [
    {
    "channel_id": "mychannel"
    }
  ]
}
 */

app.get('/api/channels', function (req, res) {
    var channels = [], counter = 0;
    const orgs_peers = helper.getOrgMapFromConfig(networkConfig);

    orgs_peers.forEach(function (org) {
        query.getChannels(org['value'], org['key']).then(channel => {
            channel['channels'].forEach(function (element) {
                channels.push(element['channel_id']);
            });
            if (counter == orgs_peers.length - 1) {
                var response = { status: HttpStatus.OK };
                response["channels"] = [...(new Set(channels))]
                res.send(response);
            }
            counter++;
        });
    })
})
/**
Return current channel
GET /api/curChannel
curl -i 'http://<host>:<port>/api/curChannel'
*/
app.get('/api/curChannel', function (req, res) {
    res.send({ 'currentChannel': ledgerMgr.getCurrChannel() })
})
/***
Block by number
GET /api/block/getinfo -> /api/block
curl -i 'http://<host>:<port>/api/block/<channel>/<number>'
 *
 */
app.get("/api/block/:channel/:number", function (req, res) {
    let number = parseInt(req.params.number)
    let channelName = req.params.channel
    if (!isNaN(number) && channelName) {
        query.getBlockByNumber(peer, channelName, number, org)
            .then(block => {
                res.send({
                    status: HttpStatus.OK,
                    'number': block.header.number.toString(),
                    'previous_hash': block.header.previous_hash,
                    'data_hash': block.header.data_hash,
                    'transactions': block.data.data
                })
            })
    } else {
        return invalidRequest(req, res)
    }
});

/***
Transaction count
GET /api/block/get -> /api/block/transactions/
curl -i 'http://<host>:<port>/api/block/transactions/<channel>/<number>'
Example Response:
{
  "number": 2,
  "txCount": 1
}
 */
app.get("/api/block/transactions/:channel/:number", function (req, res) {
    let number = parseInt(req.params.number)
    let channelName = req.params.channel
    if (!isNaN(number) && channelName) {
        sql.getRowByPkOne(`select blocknum ,txcount from blocks where channelname='${channelName}' and blocknum=${number} `).then(row => {
            if (row) {
                return res.send({
                    status: HttpStatus.OK,
                    'number': row.blocknum,
                    'txCount': row.txcount
                })
            }
            return notFound(req, res)
        })
    } else {
        return invalidRequest(req, res)
    }
});
//
/***
Transaction Information
GET /api/tx/getinfo -> /api/transaction/<txid>
curl -i 'http://<host>:<port>/api/transaction/<channel>/<txid>'
Example Response:
{
  "tx_id": "header.channel_header.tx_id",
  "timestamp": "header.channel_header.timestamp",
  "channel_id": "header.channel_header.channel_id",
  "type": "header.channel_header.type"
}
 */

app.get("/api/transaction/:channel/:txid", function (req, res) {
    let txid = req.params.txid
    let channelName = req.params.channel
    if (txid && txid != '0' && channelName) {
        query.getTransactionByID(peer, channelName, txid, org).then(response_payloads => {
            var header = response_payloads['transactionEnvelope']['payload']['header']
            var data = response_payloads['transactionEnvelope']['payload']['data']
            var signature = response_payloads['transactionEnvelope']['signature'].toString("hex")

            res.send({
                status: HttpStatus.OK,
                'validation_code': response_payloads['validationCode'],
                'tx_id': header.channel_header.tx_id,
                'timestamp': header.channel_header.timestamp,
                'channel_id': header.channel_header.channel_id,
                'type': header.channel_header.type,
                'creator_msp': header.signature_header.creator.Mspid,
                'chaincode_id': String.fromCharCode.apply(null, new Uint8Array(header.channel_header.extension)),
            })
        })

    } else {
        return invalidRequest(req, res)
    }
});

/***
Transaction list
GET /api/txList/
curl -i 'http://<host>:<port>/api/txList/<channel>/<blocknum>/<txid>/<limitrows>/<offset>'
Example Response:
{"rows":[{"id":56,"channelname":"mychannel","blockid":24,
"txhash":"c42c4346f44259628e70d52c672d6717d36971a383f18f83b118aaff7f4349b8",
"createdt":"2018-03-09T19:40:59.000Z","chaincodename":"mycc"}]}
 */
app.get("/api/txList/:channel/:blocknum/:txid/:limitrows/:offset", function (req, res) {
    let channelName = req.params.channel;
    let blockNum = parseInt(req.params.blocknum);
    let txid = parseInt(req.params.txid);
    let limitRows = parseInt(req.params.limitrows);
    let offset = parseInt(req.params.offset);
    if (isNaN(offset)) {
        offset = 0;
    }
    if (isNaN(txid)) {
        txid = 0;
    }
    if (channelName && !isNaN(limitRows)) {
        statusMetrics.getTxList(channelName, blockNum, txid, limitRows, offset)
            .then(rows => {
                if (rows) {
                    return res.send({ status: HttpStatus.OK, rows })
                }
            })
    } else {
        return invalidRequest(req, res)
    }
});




/***Peer List
GET /peerlist -> /api/peers
curl -i 'http://<host>:<port>/api/peers/<channel>'
Example Response:
[
  {
    "requests": "grpcs://127.0.0.1:7051",
    "server_hostname": "peer0.org1.example.com"
  }
]
 */
app.get("/api/peers/:channel", function (req, res) {
    let channelName = req.params.channel
    if (channelName) {
        statusMetrics.getPeerList(channelName, function (data) {
            res.send({ status: HttpStatus.OK, peers: data })
        })
    } else {
        return invalidRequest(req, res)
    }
});


/**
Chaincode list
GET /chaincodelist -> /api/chaincode
curl -i 'http://<host>:<port>/api/chaincode/<channel>'
Example Response:
[
  {
    "channelName": "mychannel",
    "chaincodename": "mycc",
    "path": "github.com/hyperledger/fabric/examples/chaincode/go/chaincode_example02",
    "version": "1.0",
    "txCount": 0
  }
]
 */

app.get('/api/chaincode/:channel', function (req, res) {
    let channelName = req.params.channel
    if (channelName) {
        statusMetrics.getTxPerChaincode(channelName, function (data) {
            res.send({ status: HttpStatus.OK, chaincode: data })
        })
    } else {
        return invalidRequest(req, res)
    }
})

/***
 List of blocks and transaction list per block
GET /api/blockAndTxList
curl -i 'http://<host>:<port>/api/blockAndTxList/channel/<blockNum>/<limitrows>/<offset>'
Example Response:
{"rows":[{"id":51,"blocknum":50,"datahash":"374cceda1c795e95fc31af8f137feec8ab6527b5d6c85017dd8088a456a68dee",
"prehash":"16e76ca38975df7a44d2668091e0d3f05758d6fbd0aab76af39f45ad48a9c295","channelname":"mychannel","txcount":1,
"createdt":"2018-03-13T15:58:45.000Z","txhash":["6740fb70ed58d5f9c851550e092d08b5e7319b526b5980a984b16bd4934b87ac"]}]}
 *
 */

app.get("/api/blockAndTxList/:channel/:blocknum/:limitrows/:offset", function (req, res) {
    let channelName = req.params.channel;
    let blockNum = parseInt(req.params.blocknum);
    let limitRows = parseInt(req.params.limitrows);
    let offSet = parseInt(req.params.offset);
    if (isNaN(offSet)) {
        offSet = 0;
    }
    if (channelName && !isNaN(blockNum) && !isNaN(limitRows)) {
        statusMetrics.getBlockAndTxList(channelName, blockNum, limitRows, offSet)
            .then(rows => {
                if (rows) {
                    return res.send({ status: HttpStatus.OK, rows })
                }
                return notFound(req, res)
            })
    } else {
        return invalidRequest(req, res)
    }
});

// TRANSACTION METRICS

/***
 Transactions per minute with hour interval
GET /api/txByMinute
curl -i 'http://<host>:<port>/api/txByMinute/<channel>/<hours>'
Example Response:
{"rows":[{"datetime":"2018-03-13T17:46:00.000Z","count":"0"},{"datetime":"2018-03-13T17:47:00.000Z","count":"0"},{"datetime":"2018-03-13T17:48:00.000Z","count":"0"},{"datetime":"2018-03-13T17:49:00.000Z","count":"0"},{"datetime":"2018-03-13T17:50:00.000Z","count":"0"},{"datetime":"2018-03-13T17:51:00.000Z","count":"0"},
{"datetime":"2018-03-13T17:52:00.000Z","count":"0"},{"datetime":"2018-03-13T17:53:00.000Z","count":"0"}]}

 */

app.get("/api/txByMinute/:channel/:hours", function (req, res) {
    let channelName = req.params.channel;
    let hours = parseInt(req.params.hours);

    if (channelName && !isNaN(hours)) {
        statusMetrics.getTxByMinute(channelName, hours)
            .then(rows => {
                if (rows) {
                    return res.send({ status: HttpStatus.OK, rows })
                }
                return notFound(req, res)
            })
    } else {
        return invalidRequest(req, res)
    }
});

/***
 Transactions per hour(s) with day interval
GET /api/txByHour
curl -i 'http://<host>:<port>/api/txByHour/<channel>/<days>'
Example Response:
{"rows":[{"datetime":"2018-03-12T19:00:00.000Z","count":"0"},
{"datetime":"2018-03-12T20:00:00.000Z","count":"0"}]}
 */

app.get("/api/txByHour/:channel/:days", function (req, res) {
    let channelName = req.params.channel;
    let days = parseInt(req.params.days);

    if (channelName && !isNaN(days)) {
        statusMetrics.getTxByHour(channelName, days)
            .then(rows => {
                if (rows) {
                    return res.send({ status: HttpStatus.OK, rows })
                }
                return notFound(req, res)
            })
    } else {
        return invalidRequest(req, res)
    }
});

/***
 Transactions per day(s) with day interval
GET /api/txByDay
curl -i 'http://<host>:<port>/api/txByDay/<channel>/<days>'
Example Response:
{"rows":[{"datetime":"2018-03-12T04:00:00.000Z","count":"0"},
{"datetime":"2018-03-13T04:00:00.000Z","count":"17"}]}
 */

app.get("/api/txByDay/:channel/:days", function (req, res) {
    let channelName = req.params.channel;
    let days = parseInt(req.params.days);

    if (channelName && !isNaN(days)) {
        statusMetrics.getTxByDay(channelName, days)
            .then(rows => {
                if (rows) {
                    return res.send({ status: HttpStatus.OK, rows })
                }
                return notFound(req, res)
            })
    } else {
        return invalidRequest(req, res)
    }
});

/***
 Transactions per week(s) with week interval
GET /api/txByWeek
curl -i 'http://<host>:<port>/api/txByWeek/<channel>/<weeks>'
Example Response:
{"rows":[{"datetime":"2018-03-12T04:00:00.000Z","count":"17"}]}

*/

app.get("/api/txByWeek/:channel/:weeks", function (req, res) {
    let channelName = req.params.channel;
    let weeks = parseInt(req.params.weeks);

    if (channelName && !isNaN(weeks)) {
        statusMetrics.getTxByWeek(channelName, weeks)
            .then(rows => {
                if (rows) {
                    return res.send({ status: HttpStatus.OK, rows })
                }
                return notFound(req, res)
            })
    } else {
        return invalidRequest(req, res)
    }
});


/***
 Transactions per month(s) with month( interval
GET /api/txByMonth
curl -i 'http://<host>:<port>/api/txByMonth/<months>'
Example Response:
{"rows":[{"datetime":"2018-03-01T05:00:00.000Z","count":"106"}]}

*/

app.get("/api/txByMonth/:channel/:months", function (req, res) {
    let channelName = req.params.channel;
    let months = parseInt(req.params.months);

    if (channelName && !isNaN(months)) {
        statusMetrics.getTxByMonth(channelName, months)
            .then(rows => {
                if (rows) {
                    return res.send({ status: HttpStatus.OK, rows })
                }
                return notFound(req, res)
            })
    } else {
        console.log(channelName, months)
        return invalidRequest(req, res)
    }
});

/***
 Transactions per year(s) with year interval
GET /api/txByYear
curl -i 'http://<host>:<port>/api/txByYear/<channel>/<years>'
Example Response:
{"rows":[{"year":"2018-01-01T05:00:00.000Z","count":"106"}]}

*/

app.get("/api/txByYear/:channel/:years", function (req, res) {
    let channelName = req.params.channel;
    let years = parseInt(req.params.years);
    if (channelName && !isNaN(years)) {
        statusMetrics.getTxByYear(channelName, years)
            .then(rows => {
                if (rows) {
                    return res.send({ status: HttpStatus.OK, rows })
                }
                return notFound(req, res)
            })
    } else {
        return invalidRequest(req, res)
    }
});

// BLOCK METRICS

/***
 Blocks per minute with hour interval
GET /api/blocksByMinute
curl -i 'http://<host>:<port>/api/blocksByMinute/<channel>/<hours>'
Example Response:
{"rows":[{"datetime":"2018-03-13T19:59:00.000Z","count":"0"}]}

*/

app.get("/api/blocksByMinute/:channel/:hours", function (req, res) {
    let channelName = req.params.channel;
    let hours = parseInt(req.params.hours);

    if (channelName && !isNaN(hours)) {
        statusMetrics.getBlocksByMinute(channelName, hours)
            .then(rows => {
                if (rows) {
                    return res.send({ status: HttpStatus.OK, rows })
                }
                return notFound(req, res)
            })
    } else {
        return invalidRequest(req, res)
    }
});


/***
 Blocks per hour(s) with day interval
GET /api/blocksByHour
curl -i 'http://<host>:<port>/api/blocksByHour/<channel>/<days>'
Example Response:
{"rows":[{"datetime":"2018-03-13T20:00:00.000Z","count":"0"}]}

*/

app.get("/api/blocksByHour/:channel/:days", function (req, res) {
    let channelName = req.params.channel;
    let days = parseInt(req.params.days);

    if (channelName && !isNaN(days)) {
        statusMetrics.getBlocksByHour(channelName, days)
            .then(rows => {
                if (rows) {
                    return res.send({ status: HttpStatus.OK, rows })
                }
                return notFound(req, res)
            })
    } else {
        return invalidRequest(req, res)
    }
});

/***
 Blocks per day(s) with day interval
GET /api/blocksByDay
curl -i 'http://<host>:<port>/api/blocksByDay/<channel>/<days>'
Example Response:
{"rows":[{"datetime":"2018-03-13T04:00:00.000Z","count":"13"}]}

*/

app.get("/api/blocksByDay/:channel/:days", function (req, res) {
    let channelName = req.params.channel;
    let days = parseInt(req.params.days);
    if (channelName && !isNaN(days)) {
        statusMetrics.getBlocksByDay(channelName, days)
            .then(rows => {
                if (rows) {
                    return res.send({ status: HttpStatus.OK, rows })
                }
                return notFound(req, res)
            })
    } else {
        return invalidRequest(req, res)
    }
});

/***
 Blocks per week(s) with week interval
GET /api/blocksByWeek
curl -i 'http://<host>:<port>/api/blocksByWeek/<channel>/<weeks>'
Example Response:
{"rows":[{"datetime":"2018-03-12T04:00:00.000Z","count":"13"}]}

*/

app.get("/api/blocksByWeek/:channel/:weeks", function (req, res) {

    let channelName = req.params.channel;
    let weeks = parseInt(req.params.weeks);
    if (channelName && !isNaN(weeks)) {
        statusMetrics.getBlocksByWeek(channelName, weeks)
            .then(rows => {
                if (rows) {
                    return res.send({ status: HttpStatus.OK, rows })
                }
                return notFound(req, res)
            })
    } else {
        return invalidRequest(req, res)
    }
});

/***
 Blocks per month(s) with month interval
GET /api/blocksByMonth
curl -i 'http://<host>:<port>/api/blocksByMonth/<channel>/<months>'
Example Response:
{"rows":[{"datetime":"2018-03-01T05:00:00.000Z","count":"30"}]}

*/

app.get("/api/blocksByMonth/:channel/:months", function (req, res) {

    let channelName = req.params.channel;
    let months = parseInt(req.params.months);
    if (channelName && !isNaN(months)) {
        statusMetrics.getBlocksByMonth(channelName, months)
            .then(rows => {
                if (rows) {
                    return res.send({ status: HttpStatus.OK, rows })
                }
                return notFound(req, res)
            })
    } else {
        return invalidRequest(req, res)
    }
});

/***
 Blocks per year(s) with year interval
GET /api/blocksByYear
curl -i 'http://<host>:<port>/api/blocksByYear/<channel>/<years>'
Example Response:
{"rows":[{"year":"2018-01-01T05:00:00.000Z","count":"30"}]}

*/
app.get("/api/blocksByYear/:channel/:years", function (req, res) {

    let channelName = req.params.channel;
    let years = parseInt(req.params.years);
    if (channelName && !isNaN(years)) {
        statusMetrics.getBlocksByYear(channelName, years)
            .then(rows => {
                if (rows) {
                    return res.send({ status: HttpStatus.OK, rows })
                }
                return notFound(req, res)
            })
    } else {
        return invalidRequest(req, res)
    }
});

function invalidRequest(req, res) {
    logger.error(HttpStatus.getStatusText(HttpStatus.BAD_REQUEST), ", payload:", req.query)
    res.send({
        status: HttpStatus.BAD_REQUEST,
        error: HttpStatus.getStatusText(HttpStatus.BAD_REQUEST),
        "payload": req.params
    })
}

function notFound(req, res) {
    res.send({
        status: HttpStatus.NOT_FOUND,
        error: HttpStatus.getStatusText(HttpStatus.NOT_FOUND),
        "payload": req.params
    })
}

// ============= start server =======================

var server = http.listen(port, function () {
    console.log(`Please open web browser to access ：http://${host}:${port}/`);
});


// this is for the unit testing
module.exports = app;