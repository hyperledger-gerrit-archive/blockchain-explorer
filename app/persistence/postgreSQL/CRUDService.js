/**
 *    SPDX-License-Identifier: Apache-2.0
 */

let sql = require('./db/pgservice.js');
let helper = require('../../helper.js');
let fs = require('fs');
let path = require('path');

let logger = helper.getLogger('blockscanner');

class CRUDService {
  constructor() {}

  getTxCountByBlockNum(channel_genesis_hash, blockNum) {
    return sql.getRowByPkOne(
      `select blocknum ,txcount from blocks where channel_genesis_hash='${channel_genesis_hash}' and blocknum=${blockNum} `
    );
  }

  getTransactionByID(channel_genesis_hash, txhash) {
    const sqlTxById = ` select t.txhash,t.validation_code,t.payload_proposal_hash,t.creator_msp_id,t.endorser_msp_id,t.chaincodename,t.type,t.createdt,t.read_set,
        t.write_set,channel.name as channelName from TRANSACTIONS as t inner join channel on t.channel_genesis_hash=channel.genesis_block_hash where t.txhash = '${txhash}' `;
    return sql.getRowByPkOne(sqlTxById);
  }

  getTxList(channel_genesis_hash, blockNum, txid) {
    const sqlTxList = ` select t.creator_msp_id,t.txhash,t.type,t.chaincodename,t.createdt,channel.name as channelName from transactions as t
         inner join channel on t.channel_genesis_hash=channel.genesis_block_hash where  t.blockid >= ${blockNum} and t.id >= ${txid} and
        t.channel_genesis_hash = '${channel_genesis_hash}'  order by  t.id desc`;
    return sql.getRowsBySQlQuery(sqlTxList);
  }

  getBlockAndTxList(channel_genesis_hash, blockNum) {
    const sqlBlockTxList = ` select blocks.id,blocks.blocknum,blocks.txcount ,blocks.datahash ,blocks.blockhash ,blocks.prehash,blocks.createdt,(
        SELECT  array_agg(txhash) as txhash FROM transactions where blockid = blocks.blocknum and channel_genesis_hash = '${channel_genesis_hash}' group by transactions.blockid ),
        channel.name as channelName  from blocks inner join channel on blocks.channel_genesis_hash =channel.genesis_block_hash  where
         blocks.channel_genesis_hash ='${channel_genesis_hash}' and blocknum >= ${blockNum}
         order by blocks.blocknum desc`;
    return sql.getRowsBySQlQuery(sqlBlockTxList);
  }

  async getChannelConfig(channel_genesis_hash) {
    const channelConfig = await sql.getRowsBySQlCase(
      ` select * from channel where genesis_block_hash ='${channel_genesis_hash}' `
    );
    return channelConfig;
  }

  async saveChannelRow(artifacts) {
    let channelTxArtifacts = fs.readFileSync(artifacts.channelTxPath);
    let channelConfig = fs.readFileSync(artifacts.channelConfigPath);
    try {
      const insert = await sql.saveRow('channel', {
        name: artifacts.channelName,
        channel_hash: artifacts.channelHash,
        channel_config: channelConfig,
        channel_tx: channelTxArtifacts,
        createdt: new Date()
      });

      const resp = {
        success: true,
        message: `Channel ${artifacts.channelName} saved`
      };

      return resp;
    } catch (err) {
      const resp = {
        success: false,
        message: `Faile to save channel ${artifacts.channelName} in database `
      };
      return resp;
    }
  }

  async saveBlock(block) {
    const c = await sql.getRowByPkOne(`select count(1) as c from blocks where blocknum='${
      block.blockNum
    }' and txcount='${block.txCount}'
        and channel_genesis_hash='${block.channel_genesis_hash}' and prehash='${
      block.preHash
    }' and datahash='${block.dataHash}' `);
    if (c.c == 0) {
      await sql.saveRow('blocks', {
        blocknum: block.blockNum,
        prehash: block.preHash,
        datahash: block.dataHash,
        blockhash: block.blockhash,
        txcount: block.txCount,
        channel_genesis_hash: block.channel_genesis_hash,
        createdt: new Date(block.firstTxTimestamp)
      });

      return true;
    }

    return false;
  }

  async saveTransaction(transaction) {
    await sql.saveRow('transactions', transaction);
    await sql.updateBySql(
      `update chaincodes set txcount =txcount+1 where name = '${
        transaction.chaincodename
      }' and channel_genesis_hash='${transaction.channel_genesis_hash}'`
    );
  }

  async getCurBlockNum(channel_genesis_hash) {
    try {
      var row = await sql.getRowsBySQlCase(
        `select max(blocknum) as blocknum from blocks  where channel_genesis_hash='${channel_genesis_hash}'`
      );
    } catch (err) {
      logger.error(err);
      return -1;
    }

    let curBlockNum;

    if (row == null || row.blocknum == null) {
      curBlockNum = -1;
    } else {
      curBlockNum = parseInt(row.blocknum);
    }

    return curBlockNum;
  }

  // ====================chaincodes=====================================
  async saveChaincode(chaincode) {
    const c = await sql.getRowByPkOne(
      `select count(1) as c from chaincodes where name='${
        chaincode.name
      }' and channel_genesis_hash='${
        chaincode.channel_genesis_hash
      }' and version='${chaincode.version}' and path='${chaincode.path}'`
    );
    if (c.c == 0) {
      await sql.saveRow('chaincodes', chaincode);
    }
  }

  getChannelByGenesisBlockHash(channel_genesis_hash) {
    return sql.getRowByPkOne(
      `select name from channel where genesis_block_hash='${channel_genesis_hash}'`
    );
  }

  async saveChannel(channel) {
    const c = await sql.getRowByPkOne(
      `select count(1) as c from channel where name='${
        channel.name
      }' and genesis_block_hash='${channel.genesis_block_hash}'`
    );
    if (c.c == 0) {
      await sql.saveRow('channel', {
        name: channel.name,
        createdt: channel.createdt,
        blocks: channel.blocks,
        trans: channel.trans,
        channel_hash: channel.channel_hash,
        genesis_block_hash: channel.genesis_block_hash
      });
    } else {
      await sql.updateBySql(
        `update channel set blocks='${channel.blocks}',trans='${
          channel.trans
        }',channel_hash='${channel.channel_hash}' where name='${
          channel.name
        }'and genesis_block_hash='${channel.genesis_block_hash}'`
      );
    }
  }

  async savePeer(peer) {
    const c = await sql.getRowByPkOne(
      `select count(1) as c from peer where channel_genesis_hash='${
        peer.channel_genesis_hash
      }' and requests='${peer.requests}' `
    );
    if (c.c == 0) {
      await sql.saveRow('peer', peer);
    }
  }

  async getChannelsInfo() {
    let channels = await sql.getRowsBySQlNoCondtion(` select c.id as id,c.name as channelName,c.blocks as blocks ,c.genesis_block_hash as genesis_block_hash,c.trans as transactions,c.createdt as createdat,c.channel_hash as channel_hash from channel c
        group by c.id ,c.name ,c.blocks  ,c.trans ,c.createdt ,c.channel_hash,c.genesis_block_hash order by c.name `);

    return channels;
  }

  // ====================Orderer BE-303=====================================
  async saveOrderer(orderer) {
    const c = await sql.getRowByPkOne(
      `select count(1) as c from orderer where requests='${orderer.requests}' `
    );
    if (c.c == 0) {
      await sql.saveRow('orderer', orderer);
    }
  }
  // ====================Orderer BE-303=====================================
}

module.exports = CRUDService;
