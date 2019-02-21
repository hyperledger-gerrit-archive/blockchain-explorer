/*
 *SPDX-License-Identifier: Apache-2.0
 */

const {
  FileSystemWallet,
  Gateway,
  X509WalletMixin
} = require('fabric-network');
const Fabric_Client = require('fabric-client');
const FabricCAServices = require('fabric-ca-client');
const FabricConfig = require('../FabricConfig');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const helper = require('../../../common/helper');
const logger = helper.getLogger('FabricGateway');
const explorer_mess = require('../../../common/ExplorerMessage').explorer;
const ExplorerError = require('../../../common/ExplorerError');

class FabricGateway {
  constructor(networkConfig) {
    this.networkConfig = networkConfig;
    this.config;
    this.gateway;
    this.userName; // admin
    this.enrollmentSecret; // adminpw
    this.identityLabel;
    this.mspId;
    this.wallet;
    this.tlsEnable;
    this.defaultChannelName;
    this.defaultPeer;
    this.defaultPeerUrl;
    this.gateway = new Gateway();
    this.fabricConfig = new FabricConfig();
    this.fabricCaEnabled = false;
    this.networkName;
    this.client;
    this.FSWALLET;
  }

  async initialize() {
    const configPath = path.resolve(__dirname, this.networkConfig);
    this.fabricConfig = new FabricConfig();
    this.fabricConfig.initialize(configPath);
    this.config = this.fabricConfig.getConfig();
    this.tlsEnable = this.fabricConfig.getTls();
    this.userName = this.fabricConfig.getAdminUser();
    this.enrollmentSecret = this.fabricConfig.getAdminPassword();
    this.networkName = this.fabricConfig.getNetworkName();
    this.identityLabel = this.userName;
    this.FSWALLET = 'wallet/' + this.networkName;

    const info = `\n\Loading configuration  ${this.networkName}, tlsEnable: ${
      this.tlsEnable
    } \n\n`;
    logger.debug(info.toUpperCase());

    let peers = this.fabricConfig.getPeers();
    this.defaultPeer = peers[0].name;
    this.defaultPeerUrl = peers[0].url;
    let orgMsp = [];
    let signedCertPath;
    let adminPrivateKeyPath;
    logger.log('========== > defaultPeer ', this.defaultPeer);

    // getting ors masp, and certtificates
    ({
      orgMsp,
      adminPrivateKeyPath,
      signedCertPath
    } = this.fabricConfig.getOrganizationsConfig());
    logger.log(
      '\nsignedCertPath ',
      signedCertPath,
      ' \nadminPrivateKeyPath ',
      adminPrivateKeyPath
    );

    this.defaultChannelName = this.fabricConfig.getDefaultChannel();
    this.mspId = orgMsp[0];
    let caURL = this.fabricConfig.getCAurl();
    let identity;
    let enrollment;

    try {
      // Create a new file system based wallet for managing identities.
      let walletPath = path.join(process.cwd(), this.FSWALLET);
      this.wallet = new FileSystemWallet(walletPath);
      //TODO, when used after a different network is configured, fails to get the correct user, may need to use identity label, password, or other
      // Check to see if we've already enrolled the admin user.
      //   const adminExists = await this.wallet.exists(this.userName);
      /*   if (adminExists) {
           console.debug(
             `An identity for the admin user: ${
             this.userName
             } already exists in the wallet`
           );
           await this.wallet.export(this.userName);
         } else {
           */

      if (this.fabricCaEnabled) {
        //TODO best way to verify  if the network has fabric-ca server authorization
        ({ enrollment, identity } = await this._enrollCaIdentity(
          caURL,
          enrollment,
          identity
        ));
      } else {
        // Identity to credentials to be stored in the wallet
        // look for signedCert in first-network-connection.json
        identity = await this._enrollUserIdentity(
          signedCertPath,
          adminPrivateKeyPath,
          identity
        );
      }
      //}

      // Set connection options; identity and wallet
      let connectionOptions = {
        identity: this.userName,
        mspId: this.mspId,
        wallet: this.wallet,
        discovery: { enabled: true },
        clientTlsIdentity: this.userName,
        eventHandlerOptions: { commitTimeout: 100 }
      };

      // connect to gateway
      await this.gateway.connect(
        this.config,
        connectionOptions
      );
      this.client = this.gateway.getClient();

      // TODO, testing only, tobe removed
      // await this.gateWayInfoTest();
    } catch (error) {
      ogger.error(` ${error}`);
      console.debug(error);
      throw new ExplorerError(explorer_mess.error.ERROR_1010);
    }
  }

  getDefaultChannelName() {
    return this.defaultChannelName;
  }
  getDefaultPeer() {
    return this.defaultPeer;
  }
  getDefaultPeerUrl() {
    return this.defaultPeerUrl;
  }

  getDefaultMspId() {
    return this.mspId;
  }
  async getClient() {
    return this.client;
  }

  getTls() {
    return this.tlsEnable;
  }

  getConfig() {
    return this.config;
  }

  /**
   * @private method
   *
   */
  async _enrollUserIdentity(signedCertPath, adminPrivateKeyPath, identity) {
    let _signedCertPath = signedCertPath;
    let _adminPrivateKeyPath = adminPrivateKeyPath;
    const cert = fs.readFileSync(_signedCertPath, 'utf8');
    // see in first-network-connection.json adminPrivateKey key
    const key = fs.readFileSync(_adminPrivateKeyPath, 'utf8');
    //console.log('key =========> \n\n\n\n ', key);
    identity = X509WalletMixin.createIdentity(this.mspId, cert, key);
    // console.log(cert, key);
    logger.log('this.identityLabel ', this.identityLabel);
    await this.wallet.import(this.identityLabel, identity);
    return identity;
  }

  /**
   * @private method
   *
   */
  async _enrollCaIdentity(caURL, enrollment, identity) {
    try {
      logger.log(
        'this.fabricCaEnabled ',
        this.fabricCaEnabled,
        ' caURL[0] ',
        caURL[0]
      );
      if (this.fabricCaEnabled) {
        let ca = new FabricCAServices(caURL[0]);
        enrollment = await ca.enroll({
          enrollmentID: this.userName,
          enrollmentSecret: this.enrollmentSecret
        });
        logger.log('>>>>>>>>>>>>>>>>>>>>>>>>> enrollment ', enrollment);
        identity = X509WalletMixin.createIdentity(
          this.mspId,
          enrollment.certificate,
          enrollment.key.toBytes()
        );
        logger.log('identity ', identity);
        // import identity wallet
        await this.wallet.import(this.identityLabel, identity);
      }
    } catch (error) {
      //TODO add explanation for message 'Calling enrollment endpoint failed with error [Error: connect ECONNREFUSED 127.0.0.1:7054]'
      // reason : no fabric running, check your network
      logger.error('Error instantiating FabricCAServices ', error);
      console.dir('Error instantiating FabricCAServices ', error);
      //TODO decide how to proceed if error
    }
    return { enrollment, identity };
  }

  async getIdentityInfo(label) {
    let identityInfo;
    console.log('Searching for an identity with label: ', label);
    try {
      let list = await this.wallet.list();
      identityInfo = list.filter(id => {
        return id.label === label;
      });
    } catch (error) {
      logger.error(error);
    }
    return identityInfo;
  }

  //TODO testing only, to be removed or a test needs to be created
  async gateWayInfoTest() {
    const client = this.gateway.getClient();
    console.log('this.defaultPeer', this.defaultPeer);
    let channels = await client.queryChannels(this.defaultPeer, true);
    console.log(channels);
    const channel = await client.getChannel(this.defaultChannelName, true);
    await channel.initialize({
      discover: true,
      target: this.defaultPeer
    });
    let queryInfo = await channel.queryInfo(this.defaultPeer, true);
    console.log('\n\n\n queryInfo', queryInfo, '\n\n');
    console.log(channel.getChannelPeers());
    console.log('getDiscoveryResults ', await channel.getDiscoveryResults());
    let block = await channel.queryBlock(0, this.defaultPeer, true);
    console.log('\n\n', block, '\n\n');
  }
}

module.exports = FabricGateway;
