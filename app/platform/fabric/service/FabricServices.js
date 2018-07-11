'use strict';

var fs = require('fs-extra');
var grpc = require('grpc');
var convertHex = require('convert-hex');
const BlockDecoder = require('fabric-client/lib/BlockDecoder');
var fileUtil = require('../../../explorer/rest/logical/utils/fileUtils.js');
var dateUtils = require('../../../explorer/rest/logical/utils/dateUtils.js');

var _transProto = grpc.load(__dirname + '/../../../../node_modules/fabric-client/lib/protos/peer/transaction.proto').protos;


var _validation_codes = {};
var keys = Object.keys(_transProto.TxValidationCode);
for (let i = 0; i < keys.length; i++) {
    let new_key = _transProto.TxValidationCode[keys[i]];
    _validation_codes[new_key] = keys[i];
}

class FabricServices {

    constructor(platform, persistence, broadcaster) {
        this.platform = platform;
        this.persistence = persistence;
        this.broadcaster = broadcaster;
        this.blocks = [];
        this.synchInProcess = [];
    }

    async initialize() {

    }

    async loadNetworkConfigToDB() {
        let _self = this;
        let clients = this.platform.getClients();
        for (var [client_key, client] of clients.entries()) {
            console.log(client_key + ' = ' + client);
            let channels = client.getChannels();
            for (var [channel_key, channel] of channels.entries()) {

                let block = await this.getGenesisBlock(client, channel);
                let genesis_block_hash = await fileUtil.generateBlockHash(block.header);

                await this.insertNewChannel(client, channel, block, genesis_block_hash);
                await this.insertFromDiscoveryResults(client, channel, genesis_block_hash);
            }
        }
    }

    async insertNewChannel(client, channel, block, genesis_block_hash) {

        if (block.data && block.data.data.length > 0 && block.data.data[0]) {
            let channel_name = channel.getName();
            let createdt = await this.getBlockTimeStamp(block.data.data[0].payload.header.channel_header.timestamp);
            let channel_row = {
                "name": channel_name,
                "createdt": createdt,
                "blocks": 0,
                "trans": 0,
                "channel_hash": "",
                "channel_version": block.data.data[0].payload.header.channel_header.version,
                "genesis_block_hash": genesis_block_hash
            }
            await this.persistence.getCrudService().saveChannel(channel_row);
        }
    }

    async insertFromDiscoveryResults(client, channel, genesis_block_hash) {

        let channel_name = channel.getName();
        let discoveryResults;

        try {
            discoveryResults = await channel.getDiscoveryResults();
        }
        catch (e) {
            // console.log(e);
            discoveryResults = await client.initializeChannelFromDiscover(channel_name);
        }

        //console.log("clients >>>>>>>>>3 " + JSON.stringify(discoveryResults));
        if (discoveryResults && discoveryResults.peers_by_org) {
            for (let org_name in discoveryResults.peers_by_org) {
                let org = discoveryResults.peers_by_org[org_name];
                for (var peer of org.peers) {
                    await this.insertNewPeer(peer, genesis_block_hash, client);
                }
            }
        }

        if (discoveryResults && discoveryResults.orderers) {

            for (let org_name in discoveryResults.orderers) {
                let org = discoveryResults.orderers[org_name];
                for (var orderer of org.endpoints) {
                    orderer.org_name = org_name;
                    await this.insertNewOrderers(orderer, genesis_block_hash);
                }
            }
        }

        if (discoveryResults && discoveryResults.endorsement_targets) {
            await this.insertNewChaincode(client, channel, genesis_block_hash);
        }

        //console.log('chaincode_peer_row' + JSON.stringify(discoveryResults.peers_by_org));

        if (discoveryResults && discoveryResults.peers_by_org) {
            for (let org_name in discoveryResults.peers_by_org) {
                let org = discoveryResults.peers_by_org[org_name];
                for (var peer of org.peers) {
                    await this.insertNewChaincodePeerRef(peer);
                }
            }
        }
    }

    async insertNewPeer(peer, genesis_block_hash, client) {

        let events = "";
        const host_port = peer.endpoint.split(':');
        if (client) {
            let evenHub = client.getEventHub();
            if (host_port[0] === evenHub._ep._options['grpc.ssl_target_name_override']) {
                events = evenHub.getPeerAddr();
            }
        }

        let peer_row = {
            //"org": org_name,
            // "name": peer.endpoint,
            "mspid": peer.mspid,
            "requests": peer.endpoint,
            "events": events,
            "server_hostname": host_port[0],
            "peer_type": "PEER"
        }
        console.log(" PEER :>>>>>>>>>>>>>>>>>>>>>" + JSON.stringify(peer_row));
        await this.persistence.getCrudService().savePeer(peer_row);
        let channel_peer_row = {
            "peerid": host_port[0],
            "channelid": genesis_block_hash
        }
        console.log(" PEER Channel:>>>>>>>>>>>>>>>>>>>>>" + JSON.stringify(channel_peer_row));
        await this.persistence.getCrudService().savePeerChannelRef(channel_peer_row);

    }
    async insertNewOrderers(orderer, genesis_block_hash) {

        let orderer_row = {
            //"name": orderer.host,
            "mspid": orderer.org_name,
            "requests": orderer.host + ":" + orderer.port,
            "server_hostname": orderer.host,
            "peer_type": "ORDERER"
        }
        console.log(" ORDERER :>>>>>>>>>>>>>>>>>>>>>" + JSON.stringify(orderer_row));
        await this.persistence.getCrudService().savePeer(orderer_row);
        let channel_orderer_row = {
            "peerid": orderer.host,
            "channelid": genesis_block_hash
        }
        console.log(" ORDERER CHANNEL :>>>>>>>>>>>>>>>>>>>>>" + JSON.stringify(channel_orderer_row));
        await this.persistence.getCrudService().savePeerChannelRef(channel_orderer_row);
    }

    async insertNewChaincode(client, channel, genesis_block_hash) {


        let chaincodes = await channel.queryInstantiatedChaincodes(client.getDefaultPeer(), true);
        console.log('chaincode_peer_row' + JSON.stringify(chaincodes));
        for (let chaincode of chaincodes.chaincodes) {
            let chaincode_row = {
                "name": chaincode.name,
                "version": chaincode.version,
                "path": chaincode.path,
                "txcount": 0,
                "createdt": new Date(),
                "genesis_block_hash": genesis_block_hash
            }
            await this.persistence.getCrudService().saveChaincode(chaincode_row);

        }

    }

    async insertNewChaincodePeerRef(peer) {

        for (var chaincode of peer.chaincodes) {
            const host_port = peer.endpoint.split(':');
            let chaincode_peer_row = {
                "chaincodeid": chaincode.name,
                "peerid": host_port[0],
            }
            console.log('chaincode_peer_row' + JSON.stringify(chaincode_peer_row));
            await this.persistence.getCrudService().saveChaincodPeerRef(chaincode_peer_row);
        }

    }

    async synchBlocks(client_name) {

        if (this.synchInProcess.includes(client_name)) {
            console.log('Block synch in process for >> ' + client_name);
            return;
        }
        let client = this.platform.getClient(client_name);
        let channels = await client.getHFClient().queryChannels(client.getDefaultPeer().getName(), true);

        for (let channel of channels.channels) {
            let channel_name = channel.channel_id;
            if (!client.getChannels().get(channel_name)) {
                await saveChannelFromBlock(client, channel_name);
            }
        }
        console.log('Synch Blocks >>> ' + JSON.stringify(channels));

        for (let channel of channels.channels) {
            let channel_name = channel.channel_id;

            let channelInfo = await client.getHFClient().getChannel(channel_name).queryInfo(client.getDefaultPeer(), true);

            let blockHeight = (parseInt(channelInfo.height.low) - 1);
            let results = await this.persistence.getMetricService().findMissingBlockNumber(channel_name, blockHeight);


            if (results) {
                for (let result of results) {
                    //queryBlock(blockNumber, target, useAdmin, skipDecode)
                    console.log('Missing Block Numbers' + JSON.stringify(result));
                    let block = await client.getHFClient().getChannel(channel_name).queryBlock(result.missing_id, client.getDefaultPeer().getName(), true);
                    //console.log('Missing Block Numbers' + JSON.stringify(block));
                    await this.processBlockEvent(block);
                }
            } else {
                console.log('No Missing blocks found');
            }
        }
        var index = this.synchInProcess.indexOf(client_name);
        this.synchInProcess.splice(index, 1);

    }

    async processBlockEvent(block) {
        var first_tx = block.data.data[0]; // get the first transaction
        var header = first_tx.payload.header; // the "header" object contains metadata of the transaction
        var channel_name = header.channel_header.channel_id;

        console.log('Channel name' + channel_name);

        let channelConfig = await this.persistence.getCrudService().getChannelConfig(channel_name);

        if (!channelConfig) {
            let client = this.platform.getChannelClient(channel_name);
            await saveChannelFromBlock(client, channel_name);
            channelConfig = await this.persistence.getCrudService().getChannelConfig(channel_name);
        }

        //console.log('Get Channel Config >>>>>>>' + JSON.stringify(channelConfig));

        let createdt = await this.getBlockTimeStamp(header.channel_header.timestamp);
        let blockhash = await fileUtil.generateBlockHash(block.header);

        if (channelConfig) {

            let block_row = {
                "blocknum": block.header.number,
                "datahash": block.header.data_hash,
                "prehash": block.header.previous_hash,
                "txcount": block.data.data.length,
                "createdt": createdt,
                "prev_blockhash": '',
                "blockhash": blockhash,
                "genesis_block_hash": channelConfig.genesis_block_hash
            }

            let client = this.platform.getChannelClient(channel_name);

            let txLen = block.data.data.length
            for (let i = 0; i < txLen; i++) {
                let txObj = block.data.data[i]
                let txid = txObj.payload.header.channel_header.tx_id;
                let validation_code = '';
                let endorser_signature = '';
                let payload_proposal_hash = '';
                let endorser_id_bytes = '';
                let chaincode_proposal_input = '';
                let chaincode = '';
                let rwset;
                let readSet;
                let writeSet;
                let chaincodeID;
                let status;
                let mspId = [];

                if (txid != undefined && txid != "") {
                    var processedTransaction = await client.getHFClient().getChannel(channel_name).queryTransaction(txid, client.getDefaultPeer(), true);
                    txObj = processedTransaction.transactionEnvelope;
                    validation_code = convertValidationCode(processedTransaction.validationCode);
                }
                let envelope_signature = txObj.signature;
                if (envelope_signature != undefined)
                    envelope_signature = convertHex.bytesToHex(envelope_signature)
                let payload_extension = txObj.payload.header.channel_header.extension;
                if (payload_extension != undefined)
                    payload_extension = convertHex.bytesToHex(payload_extension)
                let creator_nonce = txObj.payload.header.signature_header.nonce;
                if (creator_nonce != undefined)
                    creator_nonce = convertHex.bytesToHex(creator_nonce)
                let creator_id_bytes = txObj.payload.header.signature_header.creator.IdBytes;

                if (txObj.payload.data.actions != undefined) {
                    chaincode = txObj.payload.data.actions[0].payload.action.proposal_response_payload.extension.chaincode_id.name;
                    chaincodeID = new Uint8Array(txObj.payload.data.actions[0].payload.action.proposal_response_payload.extension);
                    status = txObj.payload.data.actions[0].payload.action.proposal_response_payload.extension.response.status;
                    mspId = txObj.payload.data.actions[0].payload.action.endorsements.map(i => { return i.endorser.Mspid });

                    rwset = txObj.payload.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset;
                    readSet = rwset.map(i => {
                        return {
                            'chaincode': i.namespace,
                            'set': i.rwset.reads
                        }
                    });
                    writeSet = rwset.map(i => {
                        return {
                            'chaincode': i.namespace,
                            'set': i.rwset.writes
                        }
                    });

                    chaincode_proposal_input = txObj.payload.data.actions[0].payload.chaincode_proposal_payload.input.chaincode_spec.input.args;

                    if (chaincode_proposal_input != undefined) {
                        let inputs = '';
                        for (let input of chaincode_proposal_input) {
                            inputs = (inputs === '' ? inputs : (inputs + ",")) + convertHex.bytesToHex(input);
                        }
                        chaincode_proposal_input = inputs;
                    }
                    endorser_signature = txObj.payload.data.actions[0].payload.action.endorsements[0].signature;

                    if (endorser_signature != undefined) {
                        endorser_signature = convertHex.bytesToHex(endorser_signature)
                    }

                    payload_proposal_hash = txObj.payload.data.actions[0].payload.action.proposal_response_payload.proposal_hash;
                    endorser_id_bytes = txObj.payload.data.actions[0].payload.action.endorsements[0].endorser.IdBytes;

                }

                let read_set = JSON.stringify(readSet, null, 2);
                let write_set = JSON.stringify(writeSet, null, 2);
                let chaincode_id = String.fromCharCode.apply(null, chaincodeID);

                var transaction_row = {
                    'blockid': block.header.number,
                    'txhash': txObj.payload.header.channel_header.tx_id,
                    'createdt': createdt,
                    'chaincodename': chaincode,
                    'chaincode_id': chaincode_id,
                    'status': status,
                    'creator_msp_id': txObj.payload.header.signature_header.creator.Mspid,
                    'endorser_msp_id': mspId,
                    'type': txObj.payload.header.channel_header.typeString,
                    'read_set': read_set,
                    'write_set': write_set,
                    'genesis_block_hash': channelConfig.genesis_block_hash,
                    'validation_code': validation_code,
                    'envelope_signature': envelope_signature,
                    'payload_extension': payload_extension,
                    'creator_nonce': creator_nonce,
                    'chaincode_proposal_input': chaincode_proposal_input,
                    'endorser_signature': endorser_signature,
                    'creator_id_bytes': creator_id_bytes,
                    'payload_proposal_hash': payload_proposal_hash,
                    'endorser_id_bytes': endorser_id_bytes
                };
                let res = await this.persistence.getCrudService().saveTransaction(transaction_row);
            }
            let status = await this.persistence.getCrudService().saveBlock(block_row);
        } else {
            console.log('Failed to process the block of channel ' + channel_name);
        }

    }

    async saveChannelFromBlock(client, channel_name) {

        let channel = client.newChannel(channel_name);

        client.initializeChannelFromDiscover(channel_name);

        let block = await this.getGenesisBlock(client, channel);
        let genesis_block_hash = await fileUtil.generateBlockHash(block.header);

        await this.insertNewChannel(client, channel, block, genesis_block_hash);
        await this.insertFromDiscoveryResults(client, channel, genesis_block_hash);

    }


    async getGenesisBlock(client, channel) {

        let defaultOrderer = client.getDefaultOrderer();

        let request = {
            orderer: defaultOrderer,
            txId: client.getHFClient().newTransactionID(true) //get an admin based transactionID
        };

        let genesisBlock = await channel.getGenesisBlock(request);
        let block = BlockDecoder.decodeBlock(genesisBlock);
        //console.log(" Genesis Block: >>>>>>>>>>>>>>>>>>>>>" + JSON.stringify(block));
        return block;
    }

    async getBlockTimeStamp(dateStr) {
        try {
            return new Date(dateStr);
        } catch (err) {
            console.log(err)
        }

        return new Date(dateStr);
    };


    getPlatform() {
        return this.platform;
    }

    getPersistence() {
        return this.persistence;
    }

    getBroadcaster() {
        return this.broadcaster;
    }

}

module.exports = FabricServices;

function convertValidationCode(code) {
    if (typeof code === 'string') {
        return code;
    }
    return _validation_codes[code];
}