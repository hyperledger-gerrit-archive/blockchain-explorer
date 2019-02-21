/*
    SPDX-License-Identifier: Apache-2.0
*/

const fs = require('fs');
class FabricConfig {
  constructor() {}

  initialize(configPath) {
    // TODO create a utility to read configuration
    const configJson = fs.readFileSync(configPath, 'utf8');
    this.config = JSON.parse(configJson);
  }

  getConfig() {
    return this.config;
  }
  getTls() {
    return this.config.client.tlsEnable;
  }

  getAdminUser() {
    return this.config.client.adminUser;
  }

  getNetworkName() {
    return this.config.name;
  }
  getAdminPassword() {
    this.config.client.adminPassword;
  }

  getDefaultChannel() {
    let defChannel;
    for (let x in this.config.channels) {
      // getting default channel
      console.log('FabricConfig, this.config.channels ', x);
      if (x) {
        defChannel = x;
      }
    }
    return defChannel;
  }
  getDefaultPeerConfig() {
    let defaultPeerConfig = [];
    let peers = this.getPeersConfig();
    if (peers) {
      defaultPeerConfig = peers[0];
    }
    return defaultPeerConfig;
  }

  getPeersConfig() {
    let peers = [];
    for (let x in this.config.peers) {
      //TODO may need to handle multiple fabric-ca server ??
      if (this.config.peers[x].url) {
        let peer = {
          name: x,
          url: this.config.peers[x].url,
          tlsCACerts: this.config.peers[x].tlsCACerts,
          eventUrl: this.config.peers[x].eventUrl,
          grpcOptions: this.config.peers[x].grpcOptions
        };
        peers.push(peer);
      }
    }
    return peers;
  }

  getOrganizationsConfig() {
    let orgMsp = [];
    let adminPrivateKeyPath;
    let signedCertPath;
    for (let x in this.config.organizations) {
      //TODO may need to handle multiple MSPID's ??
      if (this.config.organizations[x].mspid) {
        orgMsp.push(this.config.organizations[x].mspid);
      }
      if (this.config.organizations[x].adminPrivateKey) {
        adminPrivateKeyPath = this.config.organizations[x].adminPrivateKey.path;
      }
      if (this.config.organizations[x].signedCert) {
        signedCertPath = this.config.organizations[x].signedCert.path;
      }
    }
    return { orgMsp, adminPrivateKeyPath, signedCertPath };
  }
  getCAurl() {
    let caURL = [];
    if (this.config.certificateAuthorities) {
      this.fabricCaEnabled = true;
      for (let x in this.config.certificateAuthorities) {
        //TODO may need to handle multiple fabric-ca server ??
        if (this.config.certificateAuthorities[x].url) {
          caURL.push(this.config.certificateAuthorities[x].url);
        }
      }
    }
    return caURL;
  }

  getPeers() {
    let peers = [];
    for (let x in this.config.peers) {
      //TODO may need to handle multiple fabric-ca server ??
      if (this.config.peers[x].url) {
        let peer = {
          name: x,
          url: this.config.peers[x].url,
          tlsCACerts: this.config.peers[x].tlsCACerts,
          eventUrl: this.config.peers[x].eventUrl,
          grpcOptions: this.config.peers[x].grpcOptions
        };
        peers.push(peer);
      }
    }
    return peers;
  }
}

module.exports = FabricConfig;
