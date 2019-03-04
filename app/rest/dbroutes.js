/**
 *    SPDX-License-Identifier: Apache-2.0
 */

const requtil = require('./requestutils.js');

const dbroutes = (app, platform) => {
  const crudService = platform.getPersistence().getCrudService();

  /**
  Transaction count
  GET /api/block/get -> /api/block/transactions/
  curl -i 'http://<host>:<port>/api/block/transactions/<channel_genesis_hash>/<number>'
  Response:
  {
    'number': 2,
    'txCount': 1
  }
  */
  app.get(
    '/api/block/transactions/:channel_genesis_hash/:number',
    async (req, res) => {
      const number = parseInt(req.params.number);
      const channel_genesis_hash = req.params.channel_genesis_hash;
      if (!isNaN(number) && channel_genesis_hash) {
        const row = await crudService.getTxCountByBlockNum(
          channel_genesis_hash,
          number
        );
        if (row) {
          return res.send({
            status: 200,
            number: row.blocknum,
            txCount: row.txcount
          });
        }
        return requtil.notFound(req, res);
      }
      return requtil.invalidRequest(req, res);
    }
  );

  /**
  Transaction Information
  GET /api/tx/getinfo -> /api/transaction/<txid>
  curl -i 'http://<host>:<port>/api/transaction/<channel_genesis_hash>/<txid>'
  Response:
  {
    'tx_id': 'header.channel_header.tx_id',
    'timestamp': 'header.channel_header.timestamp',
    'channel_id': 'header.channel_header.channel_id',
    'type': 'header.channel_header.type'
  }
  */
  app.get('/api/transaction/:channel_genesis_hash/:txid', (req, res) => {
    const txid = req.params.txid;
    const channel_genesis_hash = req.params.channel_genesis_hash;
    if (txid && txid != '0' && channel_genesis_hash) {
      crudService.getTransactionByID(channel_genesis_hash, txid).then(row => {
        if (row) {
          row.createdt = new Date(row.createdt).toISOString();
          return res.send({ status: 200, row });
        }
      });
    } else {
      return requtil.invalidRequest(req, res);
    }
  });

  app.get('/api/blockActivity/:channel_genesis_hash', (req, res) => {
    const channel_genesis_hash = req.params.channel_genesis_hash;
    if (channel_genesis_hash) {
      crudService.getBlockActivityList(channel_genesis_hash).then(row => {
        if (row) {
          return res.send({ status: 200, row });
        }
      });
    } else {
      return requtil.invalidRequest(req, res);
    }
  });

  /**
  Transaction list
  GET /api/txList/
  curl -i 'http://<host>:<port>/api/txList/<channel_genesis_hash>/<blocknum>/<txid>/<limitrows>/<offset>'
  Response:
  {'rows':[{'id':56,'channelname':'mychannel','blockid':24,
  'txhash':'c42c4346f44259628e70d52c672d6717d36971a383f18f83b118aaff7f4349b8',
  'createdt':'2018-03-09T19:40:59.000Z','chaincodename':'mycc'}]}
  */
  app.get(
    '/api/txList/:channel_genesis_hash/:blocknum/:txid',
    async (req, res) => {
      const channel_genesis_hash = req.params.channel_genesis_hash;
      const blockNum = parseInt(req.params.blocknum);
      let txid = parseInt(req.params.txid);
      const orgs = requtil.orgsArrayToString(req.query.orgs);
      const { from, to } = requtil.queryDatevalidator(
        req.query.from,
        req.query.to
      );
      if (isNaN(txid)) {
        txid = 0;
      }
      if (channel_genesis_hash) {
        crudService
          .getTxList(channel_genesis_hash, blockNum, txid, from, to, orgs)
          .then(rows => {
            if (rows) {
              return res.send({ status: 200, rows });
            }
          });
      } else {
        return requtil.invalidRequest(req, res);
      }
    }
  );

  /**
  List of blocks and transaction list per block
  GET /api/blockAndTxList
  curl -i 'http://<host>:<port>/api/blockAndTxList/channel_genesis_hash/<blockNum>/<limitrows>/<offset>'
  Response:
  {'rows':[{'id':51,'blocknum':50,'datahash':'374cceda1c795e95fc31af8f137feec8ab6527b5d6c85017dd8088a456a68dee',
  'prehash':'16e76ca38975df7a44d2668091e0d3f05758d6fbd0aab76af39f45ad48a9c295','channelname':'mychannel','txcount':1,
  'createdt':'2018-03-13T15:58:45.000Z','txhash':['6740fb70ed58d5f9c851550e092d08b5e7319b526b5980a984b16bd4934b87ac']}]}
  */
  app.get(
    '/api/blockAndTxList/:channel_genesis_hash/:blocknum',
    async (req, res) => {
      const channel_genesis_hash = req.params.channel_genesis_hash;
      const blockNum = parseInt(req.params.blocknum);
      const orgs = requtil.orgsArrayToString(req.query.orgs);
      const { from, to } = requtil.queryDatevalidator(
        req.query.from,
        req.query.to
      );

      if (channel_genesis_hash && !isNaN(blockNum)) {
        crudService
          .getBlockAndTxList(channel_genesis_hash, blockNum, from, to, orgs)
          .then(rows => {
            if (rows) {
              return res.send({ status: 200, rows });
            }
            return requtil.notFound(req, res);
          });
      } else {
        return requtil.invalidRequest(req, res);
      }
    }
  );
}; //end dbroutes()

module.exports = dbroutes;
