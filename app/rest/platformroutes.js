/**
 *    SPDX-License-Identifier: Apache-2.0
 *
 *    Database calls are in dbroutes.js
 */

const requtil = require('./requestutils');
const User = require('../platform/fabric/models/User');

const platformroutes = async function(app, platform) {
  const proxy = platform.getProxy();
  const statusMetrics = platform.getPersistence().getMetricService();

  /**
  Network list
  GET /api/networklist -> /api/login
  curl -i 'http://<host>:<port>/api/networklist'
  */
  app.get('/api/networklist', async (req, res) => {
    proxy.networkList(req).then(list => {
      res.send({
        status: 200,
        networkList: list
      });
    });
  });

  /**
  Login
  POST /api/login -> /api/login
  curl curl -X POST -H 'Content-Type: application/json' -d '{ 'user': '<user>', 'password': '<password>', 'network': '<network>' }' 'http://<host>:<port>/api/login'
  */
  app.post('/api/login', async (req, res) => {
    console.log('req.body', req.body);
    const reqUser = await new User(req.body).asJson();
    proxy.authenticate(reqUser).then(userInfo => {
      res.send({
        status: 200,
        userInfo: userInfo
      });
    });
  });

  /**
  Login
  GET /api/register -> /api/register
  curl -i 'http://<host>:<port>/api/register/<user>/<password>/<affiliation>/<roles>'
  */
  app.get(
    '/api/register/:user/:password/:affiliation/:roles',
    async (req, res) => {
      console.log('/api/register/:user/:password/:affiliation/:roles');
      console.log('req.params', req.params);
      const reqUser = await new User(req.params).asJson();
      proxy.register(reqUser).then(userInfo => {
        res.send({
          status: 200,
          userInfo: userInfo
        });
      });
    }
  );

  /**
  Block by number
  GET /api/block/getinfo -> /api/block
  curl -i 'http://<host>:<port>/api/block/<channel>/<number>'
  */
  app.get('/api/block/:channel_genesis_hash/:number', (req, res) => {
    const number = parseInt(req.params.number);
    const channel_genesis_hash = req.params.channel_genesis_hash;
    if (!isNaN(number) && channel_genesis_hash) {
      proxy.getBlockByNumber(channel_genesis_hash, number).then(block => {
        res.send({
          status: 200,
          number: block.header.number.toString(),
          previous_hash: block.header.previous_hash,
          data_hash: block.header.data_hash,
          transactions: block.data.data
        });
      });
    } else {
      return requtil.invalidRequest(req, res);
    }
  });

  /**
  Return list of channels
  GET /channellist -> /api/channels
  curl -i http://<host>:<port>/api/channels
  Response:
  {
  'channels': [
      {
      'channel_id': 'mychannel'
      }
  ]
  }
  */
  app.get('/api/channels', (req, res) => {
    proxy.getChannels().then(channels => {
      const response = {
        status: 200
      };
      response.channels = channels;
      res.send(response);
    });
  });

  /**
  Return current channel
  GET /api/curChannel
  curl -i 'http://<host>:<port>/api/curChannel'
  */
  app.get('/api/curChannel', (req, res) => {
    proxy.getCurrentChannel().then(data => {
      res.send(data);
    });
  });

  /**
  Return change channel
  POST /api/changeChannel
  curl -i 'http://<host>:<port>/api/curChannel'
  */
  app.get('/api/changeChannel/:channel_genesis_hash', (req, res) => {
    const channel_genesis_hash = req.params.channel_genesis_hash;
    proxy.changeChannel(channel_genesis_hash).then(data => {
      res.send({
        currentChannel: data
      });
    });
  });

  /**
  Read 'blockchain-explorer/app/config/CREATE-CHANNEL.md' on 'how to create a channel'

  The values of the profile and genesisBlock are taken fron the configtx.yaml file that
  is used by the configtxgen tool
  Example values from the defualt first network:
  profile = 'TwoOrgsChannel';
  genesisBlock = 'TwoOrgsOrdererGenesis';
  */

  /**
  Create new channel
  POST /api/channel
  Content-Type : application/x-www-form-urlencoded
  {channelName:'newchannel02'
  genesisBlock:'TwoOrgsOrdererGenesis'
  orgName:'Org1'
  profile:'TwoOrgsChannel'}
  {fieldname: 'channelArtifacts', fieldname: 'channelArtifacts'}
  <input type='file' name='channelArtifacts' multiple />
  Response: {  success: true, message: 'Successfully created channel '   }
  */
  app.post('/api/channel', async (req, res) => {
    try {
      // upload channel config, and org config
      const artifacts = await requtil.aSyncUpload(req, res);
      const chCreate = await proxy.createChannel(artifacts);
      const channelResponse = {
        success: chCreate.success,
        message: chCreate.message
      };
      return res.send(channelResponse);
    } catch (err) {
      logger.error(err);
      const channelError = {
        success: false,
        message: 'Invalid request, payload'
      };
      return res.send(channelError);
    }
  });

  /**
  An API to join channel
  POST /api/joinChannel

  curl -X POST -H 'Content-Type: application/json' -d '{ 'orgName':'Org1','channelName':'newchannel'}' http://localhost:8080/api/joinChannel

  Response: {  success: true, message: 'Successfully joined peer to the channel '   }
  */
  app.post('/api/joinChannel', (req, res) => {
    const channelName = req.body.channelName;
    const peers = req.body.peers;
    const orgName = req.body.orgName;
    if (channelName && peers && orgName) {
      proxy
        .joinChannel(channelName, peers, orgName)
        .then(resp => res.send(resp));
    } else {
      return requtil.invalidRequest(req, res);
    }
  });

  /**
  Chaincode list
  GET /chaincodelist -> /api/chaincode
  curl -i 'http://<host>:<port>/api/chaincode/<channel>'
  Response:
  [
    {
      'channelName': 'mychannel',
      'chaincodename': 'mycc',
      'path': 'github.com/hyperledger/fabric/examples/chaincode/go/chaincode_example02',
      'version': '1.0',
      'txCount': 0
    }
  ]
  */
  app.get('/api/chaincode/:channel', (req, res) => {
    const channelName = req.params.channel;
    if (channelName) {
      statusMetrics.getTxPerChaincode(channelName, async data => {
        res.send({
          status: 200,
          chaincode: data
        });
      });
    } else {
      return requtil.invalidRequest(req, res);
    }
  });

  /** 
  Peer Status List
  GET /peerlist -> /api/peersStatus
  curl -i 'http://<host>:<port>/api/peersStatus/<channel>'
  Response:
  [
    {
      'requests': 'grpcs://127.0.0.1:7051',
      'server_hostname': 'peer0.org1.example.com'
    }
  ]
  */
  app.get('/api/peersStatus/:channel', (req, res) => {
    const channelName = req.params.channel;
    if (channelName) {
      proxy.getPeersStatus(channelName).then(data => {
        res.send({ status: 200, peers: data });
      });
    } else {
      return requtil.invalidRequest(req, res);
    }
  });

  /** 
  Transactions by Organization(s)
  GET /api/txByOrg
  curl -i 'http://<host>:<port>/api/txByOrg/<channel_genesis_hash>'
  Response:
  {'rows':[{'count':'4','creator_msp_id':'Org1'}]}
  */
  app.get('/api/txByOrg/:channel_genesis_hash', (req, res) => {
    const channel_genesis_hash = req.params.channel_genesis_hash;

    if (channel_genesis_hash) {
      proxy
        .getTxByOrgs(channel_genesis_hash)
        .then(rows => res.send({ status: 200, rows }));
    } else {
      return requtil.invalidRequest(req, res);
    }
  });

  /**
  Channels
  GET /channels -> /api/channels/info
  curl -i 'http://<host>:<port>/api/channels/<info>'
  Response:
    [
      {
        'channelName': 'mychannel',
        'channel_hash': '',
        'craetedat': '1/1/2018'
      }
    ]
  */
  app.get('/api/channels/info', (req, res) => {
    proxy
      .getChannelsInfo()
      .then(data => {
        data.forEach(element => {
          element.createdat = new Date(element.createdat).toISOString();
        });
        res.send({ status: 200, channels: data });
      })
      .catch(err => res.send({ status: 500 }));
  });

  /** *Peer Status List
  GET /peerlist -> /api/peersStatus
  curl -i 'http://<host>:<port>/api/peersStatus/<channel>'
  Response:
  [
    {
      'requests': 'grpcs://127.0.0.1:7051',
      'server_hostname': 'peer0.org1.example.com'
    }
  ]
  */
  app.get('/api/peersStatus/:channel', (req, res) => {
    const channelName = req.params.channel;
    if (channelName) {
      proxy.getPeersStatus(channelName).then(data => {
        res.send({ status: 200, peers: data });
      });
    } else {
      return requtil.invalidRequest(req, res);
    }
  });

  /**
  Transactions by Organization(s)
  GET /api/txByOrg
  curl -i 'http://<host>:<port>/api/txByOrg/<channel_genesis_hash>'
  Response:
  {'rows':[{'count':'4','creator_msp_id':'Org1'}]}
  */
  app.get('/api/txByOrg/:channel_genesis_hash', (req, res) => {
    const channel_genesis_hash = req.params.channel_genesis_hash;

    if (channel_genesis_hash) {
      proxy
        .getTxByOrgs(channel_genesis_hash)
        .then(rows => res.send({ status: 200, rows }));
    } else {
      return requtil.invalidRequest(req, res);
    }
  });

  /**
  Channels
  GET /channels -> /api/channels/info
  curl -i 'http://<host>:<port>/api/channels/<info>'
  Response:
  [
    {
      'channelName': 'mychannel',
      'channel_hash': '',
      'craetedat': '1/1/2018'
    }
  ]
  */
  app.get('/api/channels/info', (req, res) => {
    proxy
      .getChannelsInfo()
      .then(data => {
        data.forEach(element => {
          element.createdat = new Date(element.createdat).toISOString();
        });

        res.send({ status: 200, channels: data });
      })
      .catch(err => res.send({ status: 500 }));
  });

  /** 
  Peer Status List
  GET /peerlist -> /api/peersStatus
  curl -i 'http://<host>:<port>/api/peersStatus/<channel>'
  Response:
  [
    {
      'requests': 'grpcs://127.0.0.1:7051',
      'server_hostname': 'peer0.org1.example.com'
    }
  ]
  */
  app.get('/api/peersStatus/:channel', (req, res) => {
    const channelName = req.params.channel;
    if (channelName) {
      proxy.getPeersStatus(channelName).then(data => {
        res.send({ status: 200, peers: data });
      });
    } else {
      return requtil.invalidRequest(req, res);
    }
  });

  // TRANSACTION METRICS

  /**
  Transactions per minute with hour interval
  GET /api/txByMinute
  curl -i 'http://<host>:<port>/api/txByMinute/<channel_genesis_hash>/<hours>'
  Response:
  {'rows':[{'datetime':'2018-03-13T17:46:00.000Z','count':'0'},{'datetime':'2018-03-13T17:47:00.000Z','count':'0'},{'datetime':'2018-03-13T17:48:00.000Z','count':'0'},{'datetime':'2018-03-13T17:49:00.000Z','count':'0'},{'datetime':'2018-03-13T17:50:00.000Z','count':'0'},{'datetime':'2018-03-13T17:51:00.000Z','count':'0'},
  {'datetime':'2018-03-13T17:52:00.000Z','count':'0'},{'datetime':'2018-03-13T17:53:00.000Z','count':'0'}]}
  */
  app.get('/api/txByMinute/:channel_genesis_hash/:hours', (req, res) => {
    const channel_genesis_hash = req.params.channel_genesis_hash;
    const hours = parseInt(req.params.hours);

    if (channel_genesis_hash && !isNaN(hours)) {
      statusMetrics.getTxByMinute(channel_genesis_hash, hours).then(rows => {
        if (rows) {
          return res.send({ status: 200, rows });
        }
        return requtil.notFound(req, res);
      });
    } else {
      return requtil.invalidRequest(req, res);
    }
  });

  /**
  Transactions per hour(s) with day interval
  GET /api/txByHour
  curl -i 'http://<host>:<port>/api/txByHour/<channel_genesis_hash>/<days>'
  Response:
  {'rows':[{'datetime':'2018-03-12T19:00:00.000Z','count':'0'},
  {'datetime':'2018-03-12T20:00:00.000Z','count':'0'}]}
  */
  app.get('/api/txByHour/:channel_genesis_hash/:days', (req, res) => {
    const channel_genesis_hash = req.params.channel_genesis_hash;
    const days = parseInt(req.params.days);

    if (channel_genesis_hash && !isNaN(days)) {
      statusMetrics.getTxByHour(channel_genesis_hash, days).then(rows => {
        if (rows) {
          return res.send({ status: 200, rows });
        }
        return requtil.notFound(req, res);
      });
    } else {
      return requtil.invalidRequest(req, res);
    }
  });

  // BLOCK METRICS

  /**
  Blocks per minute with hour interval
  GET /api/blocksByMinute
  curl -i 'http://<host>:<port>/api/blocksByMinute/<channel_genesis_hash>/<hours>'
  Response:
  {'rows':[{'datetime':'2018-03-13T19:59:00.000Z','count':'0'}]}
  */
  app.get('/api/blocksByMinute/:channel_genesis_hash/:hours', (req, res) => {
    const channel_genesis_hash = req.params.channel_genesis_hash;
    const hours = parseInt(req.params.hours);

    if (channel_genesis_hash && !isNaN(hours)) {
      statusMetrics
        .getBlocksByMinute(channel_genesis_hash, hours)
        .then(rows => {
          if (rows) {
            return res.send({ status: 200, rows });
          }
          return requtil.notFound(req, res);
        });
    } else {
      return requtil.invalidRequest(req, res);
    }
  });

  /**
  Blocks per hour(s) with day interval
  GET /api/blocksByHour
  curl -i 'http://<host>:<port>/api/blocksByHour/<channel_genesis_hash>/<days>'
  Response:
  {'rows':[{'datetime':'2018-03-13T20:00:00.000Z','count':'0'}]}
  */
  app.get('/api/blocksByHour/:channel_genesis_hash/:days', (req, res) => {
    const channel_genesis_hash = req.params.channel_genesis_hash;
    const days = parseInt(req.params.days);

    if (channel_genesis_hash && !isNaN(days)) {
      statusMetrics.getBlocksByHour(channel_genesis_hash, days).then(rows => {
        if (rows) {
          return res.send({ status: 200, rows });
        }
        return requtil.notFound(req, res);
      });
    } else {
      return requtil.invalidRequest(req, res);
    }
  });

  app.get('/api/status/:channel_genesis_hash', (req, res) => {
    const channel_genesis_hash = req.params.channel_genesis_hash;
    if (channel_genesis_hash) {
      statusMetrics.getStatus(channel_genesis_hash, data => {
        if (data && (data.chaincodeCount && data.txCount && data.peerCount)) {
          return res.send(data);
        }
        return requtil.notFound(req, res);
      });
    } else {
      return requtil.invalidRequest(req, res);
    }
  });

  /**
  Peer List
  GET /peerlist -> /api/peers
  curl -i 'http://<host>:<port>/api/peers/<channel_genesis_hash>'
  Response:
  [
    {
      'requests': 'grpcs://127.0.0.1:7051',
      'server_hostname': 'peer0.org1.example.com'
    }
  ]
  */
  app.get('/api/peers/:channel_genesis_hash', (req, res) => {
    const channel_genesis_hash = req.params.channel_genesis_hash;
    if (channel_genesis_hash) {
      statusMetrics.getPeerList(channel_genesis_hash, data => {
        res.send({ status: 200, peers: data });
      });
    } else {
      return requtil.invalidRequest(req, res);
    }
  });
}; //end platformroutes()

module.exports = platformroutes;
