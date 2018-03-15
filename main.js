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

app.get("/api/transaction/:txid", function (req, res) {
    let txid = req.params.txid
    if (txid && txid != '0') {
        query.getTransactionByID(peer, ledgerMgr.getCurrChannel(), txid, org).then(response_payloads => {
            var header = response_payloads['transactionEnvelope']['payload']['header']
            var data = response_payloads['transactionEnvelope']['payload']['data']
            var signature = response_payloads['transactionEnvelope']['signature'].toString("hex")

            res.send({
                'validation_code' : response_payloads['validationCode'],
                'tx_id': header.channel_header.tx_id,
                'timestamp': header.channel_header.timestamp,
                'channel_id': header.channel_header.channel_id,
                'type': header.channel_header.type,
                'creator_msp' : header.signature_header.creator.Mspid,
                'chaincode_id' : String.fromCharCode.apply(null, new Uint8Array(header.channel_header.extension)),
            })
        })

    } else {
        res.send({})
    }});

app.post("/api/tx/json", function (req, res) {

    let txid = req.body.number
    if (txid && txid != '0') {
        query.getTransactionByID(peer, ledgerMgr.getCurrChannel(), txid, org).then(response_payloads => {

            var header = response_payloads['transactionEnvelope']['payload']['header']
            var data = response_payloads['transactionEnvelope']['payload']['data']
            var signature = response_payloads['transactionEnvelope']['signature'].toString("hex")

            var blockjsonstr = JSON.stringify(response_payloads['transactionEnvelope'])

            res.send(blockjsonstr)

        })

    } else {
        res.send({})
}

});

app.post("/api/block/json", function (req, res) {

    let number = req.body.number
    query.getBlockByNumber(peer, ledgerMgr.getCurrChannel(), parseInt(number), org).then(block => {

        var blockjsonstr = JSON.stringify(block)

        res.send(blockjsonstr)
    })
});


app.post("/api/block/getinfo", function (req, res) {

    let number = req.body.number
    query.getBlockByNumber(peer, ledgerMgr.getCurrChannel(), parseInt(number), org).then(block => {
        res.send({
            'number': block.header.number.toString(),
            'previous_hash': block.header.previous_hash,
            'data_hash': block.header.data_hash,
            'transactions': block.data.data
        })
    })
});

app.post("/api/block/get", function (req, res) {
    let number = req.body.number
    sql.getRowByPkOne(`select blocknum ,txcount from blocks where channelname='${ledgerMgr.getCurrChannel()}' and blocknum='${number}'`).then(row => {
        if (row) {
            res.send({
                'number': row.blocknum,
                'txCount': row.txcount
            })
        }
    })

});

app.post("/api/block/list", function (req, res) {
    let lastblockid = req.body.lastblockid
    let maxblocks = req.body.maxblocks
    var MAX = 50;
    var rows = [];
    if (maxblocks === undefined) {
        maxblocks = MAX
    } else if (maxblocks > 50) {
        maxblocks = MAX
    }

    if (lastblockid === undefined) {
        res.send({ rows })
    }

    if (lastblockid >= 0) {
        let sqlQuery = ` select blocknum ,txcount from blocks where channelname='${ledgerMgr.getCurrChannel()}' and blocknum <= ${lastblockid} order by blocknum desc limit ${maxblocks} `

        sql.getRowsBySQlQuery(sqlQuery)
            .then(rows => {
                if (rows) {
                    res.send({ rows })
                }
            })
    }
});

app.post("/api/blockAndTxList", function (req, res) {
    let channelName = req.body.channel;
    let blockNum = req.body.blocknum;
    let limitRows = req.body.limitrows;
    let offset = req.body.offset;
    // console.dir(req);
    if(offset == null){
        offset = 0;
    }
    if (channelName && blockNum && limitRows) {
        statusMetrics.getBlockAndTxList(channelName, parseInt(blockNum), parseInt(limitRows),parseInt(offset))
            .then(rows => {
                if (rows) {
                    return res.send({ rows })
                }
            })
    } else {
        return res.send({})
    }
});
app.post("/stats/charts", function (req, res) {
    let lastblockid = req.body.lastblockid
    let maxblocks = req.body.maxblocks
    let period = req.body.period
    let table = req.body.table
    var MAX = 50;
    var rows = [];
    let sqlQuery = ` select date_trunc('${period}',createdt) as dtime,count(1) from ${table} where channelname='${ledgerMgr.getCurrChannel()}'  group by 1 order by dtime`

    sql.getRowsBySQlQuery(sqlQuery)
        .then(rows => {
            if (rows) {
                res.send({ rows })
            }
        })
});
//return latest status
app.post("/api/status/get", function (req, res) {
    statusMetrics.getStatus(ledgerMgr.getCurrChannel(), function (status) {
        res.send(status)
    })
});

app.post('/chaincodelist', function (req, res) {
    statusMetrics.getTxPerChaincode(ledgerMgr.getCurrChannel(), function (data) {
        res.send(data)
    })
})

app.post('/changeChannel', function (req, res) {
    let channelName = req.body.channelName
    ledgerMgr.changeChannel(channelName)
    res.end()
})

app.post('/curChannel', function (req, res) {
    res.send({ 'currentChannel': ledgerMgr.getCurrChannel() })
})

app.post('/api/channels', function (req, res) {
    var channels = [], counter = 0;
    const orgs_peers = helper.getOrgMapFromConfig(networkConfig);

    orgs_peers.forEach(function (org) {
        query.getChannels(org['value'], org['key']).then(channel => {
            channel['channels'].forEach(function (element) {
                channels.push(element['channel_id']);
            });
            if (counter == orgs_peers.length - 1) {
                var response = {};
                response["channels"] = [...(new Set(channels))]
                res.send(response);
            }
            counter++;
        });
    })
})

app.post("/peerlist", function (req, res) {
    statusMetrics.getPeerList(ledgerMgr.getCurrChannel(), function (data) {
        res.send(data)
    })
});
app.post("/api/txCountByInterval", function (req, res) {
    let lastTimestamp = req.body.lastts;
    let minutesInterval = parseInt(req.body.minutesInterval);
    if (lastTimestamp && (minutesInterval && minutesInterval > 0)) {
        let sqlQuery = `select count(1) txcount from transaction where channelname='${ledgerMgr.getCurrChannel()}'
        and createdt between symmetric '${lastTimestamp}'::timestamp and
        '${lastTimestamp}'::timestamp - interval '${minutesInterval}m' `
        sql.getRowsBySQlQuery(sqlQuery)
            .then(rows => {
                if (rows) {
                    return res.send({ rows })
                }
            })
    } else
        return res.send({})

});

app.post("/api/blockCountByInterval", function (req, res) {
    let lastTimestamp = req.body.lastts;
    let minutesInterval = parseInt(req.body.minutesInterval);
    if (lastTimestamp && (minutesInterval && minutesInterval > 0)) {
        let sqlQuery = `select count(1) blockcount from blocks where channelname='${ledgerMgr.getCurrChannel()}'
        and createdt between symmetric '${lastTimestamp}'::timestamp and
        '${lastTimestamp}'::timestamp - interval '${minutesInterval}m' `
        console.log(sqlQuery);
        sql.getRowsBySQlQuery(sqlQuery)
            .then(rows => {
                if (rows) {
                    return res.send({ rows })
                }
            })
    } else
        return res.send({})
});

// TRANSACTION METRICS
app.post("/api/txByMinute", function (req, res) {
    let channelName = req.body.channel;
    let hours = req.body.hours;
    if (channelName && hours) {
        statusMetrics.getTxByMinute(channelName, parseInt(hours))
            .then(rows => {
                if (rows) {
                    return res.send({ rows })
                }
            })
    } else {
        return res.send({})
    }
});

app.post("/api/txByHour", function (req, res) {
    let channelName = req.body.channel;
    let days = req.body.days;
    if (channelName && days) {
        statusMetrics.getTxByHour(channelName, parseInt(days))
            .then(rows => {
                if (rows) {
                    return res.send({ rows })
                }
            })
    } else {
        return res.send({})
    }
});

app.post("/api/txByDay", function (req, res) {
    let channelName = req.body.channel;
    let days = req.body.days;
    if (channelName && days) {
        statusMetrics.getTxByDay(channelName, parseInt(days))
            .then(rows => {
                if (rows) {
                    return res.send({ rows })
                }
            })
    } else {
        return res.send({})
    }
});

app.post("/api/txByWeek", function (req, res) {
    let channelName = req.body.channel;
    let weeks = req.body.weeks;
    if (channelName && weeks) {
        statusMetrics.getTxByWeek(channelName, parseInt(weeks))
            .then(rows => {
                if (rows) {
                    return res.send({ rows })
                }
            })
    } else {
        return res.send({})
    }
});

app.post("/api/txByMonth", function (req, res) {
    let channelName = req.body.channel;
    let months = req.body.months;
    if (channelName && months) {
        statusMetrics.getTxByMonth(channelName, parseInt(months))
            .then(rows => {
                if (rows) {
                    return res.send({ rows })
                }
            })
    } else {
        return res.send({})
    }
});

app.post("/api/txByYear", function (req, res) {
    let channelName = req.body.channel;
    let years = req.body.years;
    if (channelName && years) {
        statusMetrics.getTxByYear(channelName, parseInt(years))
            .then(rows => {
                if (rows) {
                    return res.send({ rows })
                }
            })
    } else {
        return res.send({})
    }
});

// BLOCK METRICS


app.post("/api/blocksByMinute", function (req, res) {
    let channelName = req.body.channel;
    let hours = req.body.hours;
    if (channelName && hours) {
        statusMetrics.getBlocksByMinute(channelName, parseInt(hours))
            .then(rows => {
                if (rows) {
                    return res.send({ rows })
                }
            })
    } else {
        return res.send({})
    }
});

app.post("/api/blocksByHour", function (req, res) {
    let channelName = req.body.channel;
    let days = req.body.days;
    if (channelName && days) {
        statusMetrics.getBlocksByHour(channelName, parseInt(days))
            .then(rows => {
                if (rows) {
                    return res.send({ rows })
                }
            })
    } else {
        return res.send({})
    }
});

app.post("/api/blocksByDay", function (req, res) {
    let channelName = req.body.channel;
    let days = req.body.days;
    if (channelName && days) {
        statusMetrics.getBlocksByDay(channelName, parseInt(days))
            .then(rows => {
                if (rows) {
                    return res.send({ rows })
                }
            })
    } else {
        return res.send({})
    }
});

app.post("/api/blocksByWeek", function (req, res) {
    let channelName = req.body.channel;
    let weeks = req.body.weeks;
    if (channelName && weeks) {
        statusMetrics.getBlocksByWeek(channelName, parseInt(weeks))
            .then(rows => {
                if (rows) {
                    return res.send({ rows })
                }
            })
    } else {
        return res.send({})
    }
});

app.post("/api/blocksByMonth", function (req, res) {
    let channelName = req.body.channel;
    let months = req.body.months;
    if (channelName && months) {
        statusMetrics.getBlocksByMonth(channelName, parseInt(months))
            .then(rows => {
                if (rows) {
                    return res.send({ rows })
                }
            })
    } else {
        return res.send({})
    }
});

app.post("/api/blocksByYear", function (req, res) {
    let channelName = req.body.channel;
    let years = req.body.years;
    if (channelName && years) {
        statusMetrics.getBlocksByYear(channelName, parseInt(years))
            .then(rows => {
                if (rows) {
                    return res.send({ rows })
                }
            })
    } else {
        return res.send({})
    }
});

// ============= start server =======================

var server = http.listen(port, function () {
    console.log(`Please open web browser to access ：http://${host}:${port}/`);
});




