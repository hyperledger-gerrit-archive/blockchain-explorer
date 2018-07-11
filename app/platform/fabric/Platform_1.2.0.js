/**
 *    SPDX-License-Identifier: Apache-2.0
 */

var path = require("path");
var fs = require('fs-extra');
var FabricClient = require('./FabricClient.js');
var FabricServices = require('./service/FabricServices.js');
var dbroutes = require("./rest/dbroutes.js");
var platformroutes = require("./rest/platformroutes.js");

var config_path = path.resolve(__dirname, './config.json');

const NETWORK_CONFIG = 'network-config';

class Platform {
  constructor(app, persistance, broadcaster) {
    this.app = app;
    this.persistance = persistance;
    this.broadcaster = broadcaster;
    this.clients = new Map();
    this.channelsClient = new Map();
    this.fabricServices = new FabricServices(this, persistance, broadcaster);
    this.synchBlocksTime = 60000;
    this.config;
  }

  async initialize() {
    let _self = this;

    // build client context
    await this.buildClientByFile(config_path);

    // update client network configuration details to DB
    await this.fabricServices.loadNetworkConfigToDB();

    await dbroutes(this.app, this.fabricServices);
    await platformroutes(this.app, this.fabricServices);

    setInterval(function () {
      _self.isEventHubConnected();
    }, this.synchBlocksTime);

  }

  async buildClientByFile(config_path) {

    let _self = this;

    let config = JSON.parse(fs.readFileSync(config_path, 'utf8'));
    let all_config = config[NETWORK_CONFIG];
    await this.setSynchBlocksTime(all_config);
    global.hfc.config.set('discovery-cache-life', this.synchBlocksTime);
    var g_config = JSON.parse(JSON.stringify(global.hfc.config));// clone global.hfc.config configuration
    all_config = await this.setAdminPrivateKey(all_config);

    this.config = all_config;

    for (let client_name in all_config.clients) {

      let client_config = all_config.clients[client_name];

      let c_config = g_config;
      c_config.client = client_config;
      c_config.version = all_config.version;
      c_config.channels = all_config.channels;
      c_config.organizations = all_config.organizations;
      c_config.peers = all_config.peers;


      let client = await this.buildClientFromJSON(client_name, c_config);

      // console.log("clients >>>>>>>>>3 channel_key"+client._channels);

      let channels = await client.getChannels();
      this.clients.set(client_name, client);
      this.channelsClient.set(client_config.channel, client);

      for (var [channel_key, value] of channels.entries()) {
        if (!this.channelsClient.get(channel_key)) {
          this.channelsClient.set(channel_key, client);
        }
      }
    }
  }

  async buildClientFromJSON(client_name, client_config) {

    let client = new FabricClient(client_name, this.fabricServices);

    console.log("buildClientFromJSON >>>>>>>>>" + client_config.client.asLocalhost);

    if (client_config.client.asLocalhost) {
      console.log("buildClientFromJSON >>>>>>>>>" + client_config.client.asLocalhost);
      client.setAsLocalhost(client_config.client.asLocalhost);
    }

    await client.initialize(client_config);

    return client;
  }

  async isEventHubConnected() {
    this.clients.forEach(function logMapElements(value, key, map) {
      value.isEventHubConnected().then((status) => {
        console.log(key + ' Event Hub status :' + status)
        if (status) {
          this.fabricServices.synchBlocks();
        } else {
          value.connectEventHub();
        }
      });
    });
  }

  async setSynchBlocksTime(all_config) {

    if (all_config.synchBlocksTime) {
      let time = parseInt(all_config.synchBlocksTime, 10);
      if (!isNaN(time)) {
        this.synchBlocksTime = time * 60 * 1000;
      }
    }

  }
  async setAdminPrivateKey(all_config) {

    if (all_config && all_config.organizations) {
      for (let organization_name in all_config.organizations) {
        let fPath = all_config.organizations[organization_name].adminPrivateKey.path;
        var files = fs.readdirSync(fPath);
        if (files && files.length > 0) {
          all_config.organizations[organization_name].adminPrivateKey.path = path.join(fPath, files[0]);
        }
      }
    }
    return all_config;

  }

  getApp() {
    return this.app;
  }

  getClients() {
    return this.clients;
  }

  getClient(clientName) {
    return this.clients.get(clientName);
  }

  getChannelClient(channelName) {
    return this.channelsClient.get(channelName);
  }
  getPersistance() {
    return this.persistance;
  }
  getBroadcaster() {
    return this.broadcaster;
  }

  getFabricServices() {
    return this.fabricServices;
  }

  async distroy() {
    for (var [channel_key, client] of this.clients.entries()) {
      let status = client.isEventHubConnected();
      if (status) {
        client.disconnectEventHub();
      }
    }
  }
}
module.exports = Platform;