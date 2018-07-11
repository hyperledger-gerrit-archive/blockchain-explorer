/*
    SPDX-License-Identifier: Apache-2.0
*/

var Fabric_Client = require('fabric-client');

class FabricClient {

    constructor(client_name, fabricServices) {
        this.client_name = client_name;
        this.client = new Fabric_Client();
        this.defaultPeer = {};
        this.defaultChannel = {};
        this.defaultOrderer = null;
        this.eventHub = {};
        this.asLocalhost = false
        this.fabricServices = fabricServices;
    }

    async initialize(client_config) {

        //Loading client from network configuration file
        console.log('Started client Load From Confi');
        await this.clientLoadFromConfig(client_config);
        console.log('End client Load From Confi');

        // Creating EventHubs
        this.eventHub = await this.client.getEventHub(this.defaultPeer.getName());

        await this.eventHub.registerBlockEvent(
            (block) => {
                this.fabricServices.processBlockEvent(block);
            },
            (err) => {
                console.log('Block Event ' + err);
            }
        );
        console.log('Start EventHub');
        this.connectEventHub();
        console.log('End EventHub');

        // getting channels from queryChannels
        let channels = await this.client.queryChannels(this.defaultPeer.getName(), true);

        console.log('Channels' + JSON.stringify(channels));

        // initialize channel network information from Discover
        for (let channel of channels.channels) {
            this.newChannel(channel.channel_id)
        }

        try {
            let result = await this.defaultChannel.getDiscoveryResults();
        }
        catch (e) {
            console.log('Channel Discovery ' + e);
            throw new Error('Default defined channel ' + this.defaultChannel.getName() + ' not found for the client ' + this.client_name + ' peer');
        }

        let channel_name = client_config.client.channel;
        let channel = await this.client.getChannel(channel_name);
        let temp_orderers = await channel.getOrderers();

        if (temp_orderers && temp_orderers.length > 0) {
            this.defaultOrderer = temp_orderers[0];
        }
        else {
            throw new Error('There are no orderers defined on this channel in the network configuration');
        }
    }

    newChannel(channel_name) {

        if (!this.client._network_config._network_config.channels[channel_name]) {
            this.client._network_config._network_config.channels[channel_name] = this.client._network_config._network_config.channels[this.defaultChannel.getName()];
        }
        this.client.getChannel(channel_name);

    }


    connectEventHub() {
        console.log('Start connectEventHub Method');
        let _self = this;
        this.eventHub.connect();
        setTimeout(function () {
            _self.synchBlocks();
        }, 5000);
        console.log('End connectEventHub Method');
    }

    async synchBlocks() {
        console.log('Start synchBlocks Method');
        if (this.isEventHubConnected()) {
            this.fabricServices.synchBlocks(this.client_name);
        }
        console.log('End synchBlocks Method');
    }

    isEventHubConnected() {

        return this.eventHub.isconnected();
    }

    disconnectEventHub() {
        this.eventHub.disconnec();
    }

    async clientLoadFromConfig(client_config) {
        console.log('Started clientLoadFromConfig Method');

        var _self = this;
        await this.client.loadFromConfig(client_config);
        await this.client.initCredentialStores();

        // Creating Admin User
        let organization = await this.client._network_config.getOrganization(client_config.client.organization, true);
        if (organization) {
            let mspid = organization.getMspid();
            let admin_key = organization.getAdminPrivateKey();
            let admin_cert = organization.getAdminCert();
            await this.client.createUser({
                username: client_config.client.adminName,
                mspid: mspid,
                cryptoContent: {
                    privateKeyPEM: admin_key,
                    signedCertPEM: admin_cert
                },
                skipPersistence: false
            });
        }

        // Loading default Peer and channel
        let channel_name = client_config.client.channel;
        this.defaultChannel = this.client.getChannel(channel_name);

        if (this.defaultChannel.getPeers().length > 0) {
            this.defaultPeer = this.defaultChannel.getPeers()[0];
        } else {
            throw new Error('No Default peer added for the client ' + this.client_name + ' channel');
        }


        console.log('Start initializeChannelFromDiscover' + channel_name);
        await this.initializeChannelFromDiscover(channel_name);
        console.log('End initializeChannelFromDiscover' + channel_name);

        console.log('End clientLoadFromConfig Method');

    }

    async initializeChannelFromDiscover(channel_name) {
        let channel = this.client.getChannel(channel_name);

        const discover_request = {
            target: this.defaultPeer.getName(),
            config: true
        };
        let discover_results = await channel._discover(discover_request);
        if (discover_results) {

            /*if (discover_results.msps) {
                for (let msp_name in discover_results.msps) {
                   //logger.debug('%s - build msps', method);
                   this.addMSPToChannel(discover_results.msps[msp_name]);
                }
            }*/
            if (discover_results.orderers) {
                for (let msp_id in discover_results.orderers) {
                    //logger.debug('%s - orderers msp:%s', method, msp_id);
                    const endpoints = discover_results.orderers[msp_id].endpoints;
                    for (const endpoint of endpoints) {
                        let name = endpoint.host;
                        this.newOrderer(channel_name, name, msp_id, endpoint.host, endpoint.port, discover_results.msps, { asLocalhost: this.asLocalhost });
                    }
                }
            }


            channel._discovery_results = discover_results;

            return discover_results;

        }

        return;

        //console.log('initialize Channel From Discover' + JSON.stringify(discover_results));
    }



    addMSPToChannel(channel_name, msp_config) {

        let channel = this.client.getChannel(channel_name);

        const config = {
            rootCerts: msp_config.rootCerts,
            intermediateCerts: msp_config.intermediateCerts,
            admins: msp_config.admins,
            cryptoSuite: channel._clientContext._crytoSuite,
            id: msp_config.id,
            orgs: msp_config.orgs,
            tls_root_certs: msp_config.tls_root_certs,
            tls_intermediate_certs: msp_config.tls_intermediate_certs
        };

        channel._msp_manager.addMSP(config);

    }

    newOrderer(channel_name, name, msp_id, host, port, msps, request) {
        //const method = '_buildOrdererName';
        //logger.debug('%s - start', method);

        let channel = this.client.getChannel(channel_name);

        const url = channel._buildUrl(host, port, request);
        let newOrderer = null;
        channel._orderers.forEach((orderer) => {
            if (orderer.getName() === name) {
                //logger.debug('%s - found existing orderer %s', method, url);
                newOrderer = orderer;
            }
        });
        if (!newOrderer) {
            if (msps[msp_id]) {
                //logger.debug('%s - create a new orderer %s', method, url);

                newOrderer = this.client.newOrderer(url, channel._buildOptions(name, url, host, msps[msp_id]));
                channel.addOrderer(newOrderer, true);
            } else {
                throw new Error('No TLS cert information available');
            }
        }

        return newOrderer;
    }

    newPeer(channel_name, name, endpoint, msp_id, msps, request) {

        let channel = this.client.getChannel(channel_name);

        //const method = '_buildPeerName';
        //logger.debug('%s - start', method);

        const host_port = endpoint.split(':');
        const url = channel._buildUrl(host_port[0], host_port[1], request);
        let newpeer = null;
        channel._channel_peers.forEach((peer) => {
            if (peer.getName() === name) {
                //logger.debug('%s - found existing peer %s', method, url);
                newpeer = peer;
            }
        });
        if (!newpeer) {
            if (msp_id && msps && msps[msp_id]) {
                //logger.debug('%s - create a new peer %s', method, url);
                newpeer = this.client.newPeer(url, channel._buildOptions(name, url, host_port[0], msps[msp_id]));
                channel.addPeer(newpeer, msp_id, null, true);
            } else {
                throw new Error('No TLS cert information available');
            }
        }
        return newpeer;
    }

    setAsLocalhost(value) {
        this.asLocalhost = value;
    }

    getHFClient() {
        return this.client;
    }

    getDefaultPeer() {
        return this.defaultPeer;
    }

    getDefaultChannel() {
        return this.defaultChannel;
    }

    getChannels() {
        return this.client._channels; // return Map
    }
    getEventHub() {
        return this.eventHub;
    }

    getDefaultOrderer() {
        return this.defaultOrderer;
    }

}

module.exports = FabricClient;