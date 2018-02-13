/****Transaction count
We need to define input parameters as well, like channel, chaincode etc.

GET /api/block/get -> /api/block/transactions/number=2
request payload : { "number":2 }
 */

function getTransactionsByNumber(req, res) {
    let number = req.params.number
    console.log('number', number)
    let data = require('../../mock_server/mockData/apiblockget.json')
    if (number) {
        res.send(data);
    } else {
        res.send({});
    }
};

//getTransaction

/****Transaction Information

GET /api/tx/getinfo -> /api/transaction/<txid>
request payload {"txid": <txid>}
response
{
"tx_id": "header.channel_header.tx_id",
"timestamp": "header.channel_header.timestamp",
"channel_id": "header.channel_header.channel_id",
"type": "header.channel_header.type"
}
 */

function getTransactionById(req, res) {
    let txid = req.params.txid;
    console.log('txid ', txid);
    let data = require('../../mock_server/mockData/transaction.json');
    res.set('Content-Type', 'application/json');
    if (txid) {
        res.send(data);
    } else {
        res.send({});
    }
};

module.exports = { getTransactionsByNumber, getTransactionById };

