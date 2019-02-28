/*
    SPDX-License-Identifier: Apache-2.0
*/

const User = require('../models/User');
const helper = require('../../../common/helper');
const logger = helper.getLogger('UserService');

const { X509WalletMixin } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');

class UserService {
  constructor(platform) {
    this.platform = platform;
  }
  // 1. If config file for a network contains  "enableAuthentication": true|false, based on this flag authenticate
  // platform gives an access to the nettwork configuration, and the client that is derived from the FabricGateway
  /*TODO do an authentication, get the user from the wallet, if it's not in the wallet
   then return null user info object, otherwise return userinfo.
   The wallet is saving user under the wallet<network name>/<user name> directory,
   see variable this.FSWALLET in  blockchain-explorer/app/platform/fabric/gateway/FabricGateway.js
    */

  async authenticate(user) {
    let enableAuthentication = false;
    if (user.user && user.password && user.network) {
      logger.log('user.network ', user.network);
      const network = this.platform.getNetworks().get(user.network);

      //TODO, need review maybe there is a better way to get the client config enableAuthentication
      for (const [network_name, clients] of network.entries()) {
        if (clients.config && clients.config.client) {
          let enableAuth = clients.config.client.enableAuthentication;
          if (typeof enableAuth !== 'undefined' && enableAuth !== null) {
            enableAuthentication = enableAuth;
            logger.log(
              `Network: ${network_name} enableAuthentication ${enableAuthentication}`
            );
            console.log(
              `Network: ${network_name} enableAuthentication ${enableAuthentication}`
            );
            break;
          }
        }
      }

      if (!enableAuthentication) {
        return {
          authenticated: true,
          user: user.user,
          enableAuthentication: enableAuthentication
        };
      }

      // TODO lookup in the wallet/network-name (example wallet/firstnetwork/admin )for the user
      //
      return { authenticated: true, user: user.user };
    } else {
      return { authenticated: false, message: 'Invalid request, found ', user };
    }
  }

  async register(user) {
    /*TODO
    1. verify if user exists
    2. register user if doesn't exist
    3. depending on the user type use either enrollUserIdentity, or  enrollCaIdentity*/
    try {
      var username = user['user'];
      var fabricClient = this.platform.getClient();
      var fabricGw = fabricClient.fabricGateway;
      var userOrg = fabricClient.config.client.organization;
      var isExist = await fabricGw.wallet.exists(username);
      var identity;

      if (isExist) {
        throw new Error('Failed to register : Already exist, ' + username);
      } else {
        if (fabricGw.fabricCaEnabled) {
          var caURL;
          var serverCertPath;
          ({
            caURL,
            serverCertPath
          } = fabricGw.fabricConfig.getCertificateAuthorities());
          let ca = new FabricCAServices(caURL[0]);

          let adminUserObj = await fabricClient.hfc_client.setUserContext({
            username: fabricGw.fabricConfig.getAdminUser(),
            password: fabricGw.fabricConfig.getAdminPassword()
          });
          let secret = await ca.register(
            {
              enrollmentID: username,
              enrollmentSecret: user['password'],
              affiliation: [userOrg.toLowerCase(), user['affiliation']].join(
                '.'
              ),
              role: user['roles']
            },
            adminUserObj
          );
          logger.debug('Successfully got the secret for user %s', username);
        } else {
          throw new Error('Not supported user registration without CA');
        }

        const identity = await this.enrollCaIdentity(user);
        await this.reconnectGw(user, identity);
      }
    } catch (error) {
      return {
        status: 400,
        message:
          'Failed to get registered user: ' +
          username +
          ' with error: ' +
          error.toString()
      };
    }

    return { status: 200 };
  }

  async enroll(user) {
    try {
      logger.debug('UserService::enroll');
      const identity = await this.enrollCaIdentity(user);
      await this.reconnectGw(user, identity);
    } catch (error) {
      return {
        status: 400,
        message:
          'Failed to get enrolled user: ' +
          user['user'] +
          ' with error: ' +
          error.toString()
      };
    }
    return { status: 200 };
  }

  async enrollUserIdentity(user) {
    /*TODO should have the same logic as the method in _enrollUserIdentity of
    blockchain-explorer/app/platform/fabric/gateway/FabricGateway.js
    FabricGateway enrolls an  user that is defined in the config.json, but we may need an entry form to enroll a user */
  }
  async enrollCaIdentity(user) {
    /*TODO should have the same logic as the method in _enrollCaIdentity of
      blockchain-explorer/app/platform/fabric/gateway/FabricGateway.js
      FabricGateway enrolls a CA ( Certificate Authority) Identity that is defined in the config.json,
      but we may need enroll a CA entry form to enroll a CA
    */
    logger.debug('enrollCaIdentity: ', user);
    var username = user['user'];
    var fabricClient = this.platform.getClient();
    var fabricGw = fabricClient.fabricGateway;
    var isExist = await fabricGw.wallet.exists(username);
    if (isExist) {
      // throw new Error('Failed to enroll: Not found identity in wallet, ' + err.toString());
      const identity = await fabricGw.wallet.export(username);
      // await reconnectGw(user, identity);
      return identity;
    } else {
      try {
        var caURL;
        var serverCertPath;

        ({
          caURL,
          serverCertPath
        } = fabricGw.fabricConfig.getCertificateAuthorities());
        let ca = new FabricCAServices(caURL[0]);
        const enrollment = await ca.enroll({
          enrollmentID: username,
          enrollmentSecret: user['password']
        });

        // import identity wallet
        var identity = X509WalletMixin.createIdentity(
          fabricGw.mspId,
          enrollment.certificate,
          enrollment.key.toBytes()
        );
        await fabricGw.wallet.import(username, identity);
        logger.debug(
          'Successfully get user enrolled and imported to wallet, ',
          username
        );

        return identity;
      } catch (err) {
        logger.error('Failed to enroll %s', username);
        throw new Error(
          'Failed to enroll user: ' +
            user['user'] +
            ' with error: ' +
            err.toString()
        );
      }
    }
  }

  async reconnectGw(user, identity) {
    try {
      logger.debug('reconnectGw: ', user);
      var username = user['user'];
      var fabricClient = this.platform.getClient();
      var fabricGw = fabricClient.fabricGateway;

      // Set connection options; identity and wallet
      let connectionOptions = {
        identity: username,
        mspId: identity.mspId,
        wallet: fabricGw.wallet,
        discovery: {
          enabled: true,
          asLocalhost: fabricClient.asLocalhost
        },
        clientTlsIdentity: username,
        eventHandlerOptions: { commitTimeout: 100 }
      };

      fabricGw.gateway.disconnect();

      // connect to gateway
      await fabricGw.gateway.connect(
        fabricGw.config,
        connectionOptions
      );
      logger.debug('Successfully reconnected with ', username);
    } catch (err) {
      throw new Error('Failed to reconnect: ' + err.toString());
    }
  }
}

module.exports = UserService;
