/*
    SPDX-License-Identifier: Apache-2.0
*/

const User = require('../models/User');
const helper = require('../../../common/helper');
const logger = helper.getLogger('UserService');

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
    const client = this.platform.getClient();
    client.getRegisteredUser();
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
  }
}

module.exports = UserService;
