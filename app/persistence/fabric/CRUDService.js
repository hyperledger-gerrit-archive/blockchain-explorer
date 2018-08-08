/**
 *    SPDX-License-Identifier: Apache-2.0
 */


var helper = require('../../common/helper');
var fs = require('fs');
var path = require('path');
var logger = helper.getLogger('CRUDService');

class CRUDService {
    constructor(sql) {
        this.sql = sql;
    }

    getTxCountByBlockNum(channel_genesis_hash, blockNum) {
        return this.sql.getRowByPkOne(
            `select blocknum ,txcount from blocks where channel_genesis_hash='${channel_genesis_hash}' and blocknum=${blockNum} `
        );
    }

    getTransactionByID(channel_genesis_hash, txhash) {
        let sqlTxById = ` select t.txhash,t.validation_code,t.payload_proposal_hash,t.creator_msp_id,t.endorser_msp_id,
        t.chaincodename,t.type,t.createdt,t.read_set,t.write_set,channel.name as channelName from TRANSACTIONS as t inner join channel on
        t.channel_genesis_hash=channel.channel_genesis_hash where t.txhash = '${txhash}' `;
        return this.sql.getRowByPkOne(sqlTxById);
    }

    getTxList(channel_genesis_hash, blockNum, txid) {
        let sqlTxList = ` select t.creator_msp_id,t.txhash,t.type,t.chaincodename,t.createdt,channel.name as channelName from transactions as t
        inner join channel on t.channel_genesis_hash=channel.channel_genesis_hash where  t.blockid >= ${blockNum} and t.id >= ${txid} and
        t.channel_genesis_hash = '${channel_genesis_hash}'  order by  t.id desc`;
        return this.sql.getRowsBySQlQuery(sqlTxList);
    }

    getBlockAndTxList(channel_genesis_hash, blockNum) {
        let sqlBlockTxList = ` select blocks.blocknum,blocks.txcount ,blocks.datahash ,blocks.blockhash ,blocks.prehash,blocks.createdt,(
        SELECT  array_agg(txhash) as txhash FROM transactions where blockid = blocks.blocknum and channel_genesis_hash = '${channel_genesis_hash}' group by transactions.blockid ),
        channel.name as channelName  from blocks inner join channel on blocks.channel_genesis_hash =channel.channel_genesis_hash  where
         blocks.channel_genesis_hash ='${channel_genesis_hash}' and blocknum >= ${blockNum}
         order by blocks.blocknum desc`;
        return this.sql.getRowsBySQlQuery(sqlBlockTxList);
    }

    async getChannelConfig(channelName) {
        let channelConfig = await this.sql.getRowsBySQlCase(
            ` select * from channel where channel_genesis_hash ='${channelName}' `
        );
        return channelConfig;
    }

    async getChannel(channelname, channel_genesis_hash) {
        let channel = await this.sql.getRowsBySQlCase(
            ` select * from channel where name='${channelname}' and channel_genesis_hash='${channel_genesis_hash}' `
        );
        return channel;
    }

    async existChannel(channelname) {
        let channel = await this.sql.getRowsBySQlCase(
            ` select count(1) from channel where name='${channelname}' `
        );
        return channel;
    }

    async saveChannelRow(artifacts) {
        var channelTxArtifacts = fs.readFileSync(artifacts.channelTxPath);
        var channelConfig = fs.readFileSync(artifacts.channelConfigPath);
        try {
            let insert = await this.sql.saveRow('channel', {
                name: artifacts.channelName,
                channel_hash: artifacts.channelHash,
                channel_config: channelConfig,
                channel_tx: channelTxArtifacts,
                createdt: new Date()
            });

            let resp = {
                success: true,
                message: 'Channel ' + artifacts.channelName + ' saved'
            };

            return resp;
        } catch (err) {
            let resp = {
                success: false,
                message:
                    'Faile to save channel ' + artifacts.channelName + ' in database '
            };
            return resp;
        }
    }

    async saveBlock(block) {
        let c = await this.sql.getRowByPkOne(`select count(1) as c from blocks where blocknum='${
            block.blocknum
            }' and txcount='${block.txcount}'
        and channel_genesis_hash='${block.channel_genesis_hash}' and prehash='${
            block.prehash
            }' and datahash='${block.datahash}' `);
        if (c.c == 0) {
            await this.sql.saveRow('blocks', block);
            await this.sql.updateBySql(
                `update channel set blocks =blocks+1 where channel_genesis_hash='${
                block.channel_genesis_hash
                }'`
            );
            return true;
        }

        return false;
    }

    async saveTransaction(transaction) {
        let c = await this.sql.getRowByPkOne(
            `select count(1) as c from transactions where blockid='${
            transaction.blockid
            }' and txhash='${transaction.txhash}' and channel_genesis_hash='${
            transaction.channel_genesis_hash
            }'`
        );

        if (c.c == 0) {
            await this.sql.saveRow('transactions', transaction);
            await this.sql.updateBySql(
                `update chaincodes set txcount =txcount+1 where channel_genesis_hash='${
                transaction.channel_genesis_hash
                }'`
            );
            await this.sql.updateBySql(
                `update channel set trans =trans+1 where channel_genesis_hash='${
                transaction.channel_genesis_hash
                }'`
            );
            return true;
        }

        return false;
    }
    getChannelByGenesisBlockHash(channel_genesis_hash) {
        return this.sql.getRowByPkOne(
            `select name from channel where channel_genesis_hash='${channel_genesis_hash}'`
        );
    }

    async getCurBlockNum(channel_genesis_hash) {
        try {
            var row = await this.sql.getRowsBySQlCase(
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
        let c = await this.sql.getRowByPkOne(`select count(1) as c from chaincodes where name='${
            chaincode.name
            }' and
        channel_genesis_hash='${chaincode.channel_genesis_hash}' and version='${
            chaincode.version
            }' and path='${chaincode.path}'`);
        if (c.c == 0) {
            await this.sql.saveRow('chaincodes', chaincode);
        }
    }

    async saveChaincodPeerRef(peers_ref_chaincode) {
        let c = await this.sql.getRowByPkOne(
            `select count(1) as c from peer_ref_chaincode prc where prc.peerid= '${
            peers_ref_chaincode.peerid
            }' and prc.chaincodeid='${
            peers_ref_chaincode.chaincodeid
            }' and cc_version='${peers_ref_chaincode.cc_version}' and channelid='${
            peers_ref_chaincode.channelid
            }'`
        );
        if (c.c == 0) {
            await this.sql.saveRow('peer_ref_chaincode', peers_ref_chaincode);
        }
    }

    async saveChannel(channel) {
        let c = await this.sql.getRowByPkOne(
            `select count(1) as c from channel where name='${
            channel.name
            }' and channel_genesis_hash='${channel.channel_genesis_hash}'`
        );
        if (c.c == 0) {
            await this.sql.saveRow('channel', {
                name: channel.name,
                createdt: channel.createdt,
                blocks: channel.blocks,
                trans: channel.trans,
                channel_hash: channel.channel_hash,
                channel_genesis_hash: channel.channel_genesis_hash
            });
        }
    }

    async savePeer(peer) {
        let c = await this.sql.getRowByPkOne(
            `select count(1) as c from peer where channel_genesis_hash='${
            peer.channel_genesis_hash
            }' and server_hostname='${peer.server_hostname}' `
        );
        if (c.c == 0) {
            await this.sql.saveRow('peer', peer);
        }
    }

    async savePeerChannelRef(peers_ref_Channel) {
        let c = await this.sql.getRowByPkOne(
            `select count(1) as c from peer_ref_channel prc where prc.peerid = '${
            peers_ref_Channel.peerid
            }' and prc.channelid='${peers_ref_Channel.channelid}' `
        );
        if (c.c == 0) {
            await this.sql.saveRow('peer_ref_channel', peers_ref_Channel);
        }
    }

    async getChannelsInfo(peerid) {
        var channels = await this.sql.getRowsBySQlNoCondtion(` select c.id as id,c.name as channelName,c.blocks as blocks ,c.channel_genesis_hash as channel_genesis_hash,c.trans as transactions,c.createdt as createdat,c.channel_hash as channel_hash from channel c,
        peer_ref_channel pc where c.channel_genesis_hash = pc.channelid and pc.peerid='${
            peerid
            }' group by c.id ,c.name ,c.blocks  ,c.trans ,c.createdt ,c.channel_hash,c.channel_genesis_hash order by c.name `);

        return channels;
    }

    // ====================Orderer BE-303=====================================
    async saveOrderer(orderer) {
        let c = await this.sql.getRowByPkOne(
            `select count(1) as c from orderer where requests='${orderer.requests}' `
        );
        if (c.c == 0) {
            await this.sql.saveRow('orderer', orderer);
        }
    }

    // ====================Orderer BE-303=====================================
}

module.exports = CRUDService;
