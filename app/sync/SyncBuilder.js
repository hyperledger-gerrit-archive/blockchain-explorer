/*
*SPDX-License-Identifier: Apache-2.0
*/
var explorer_const = require('../common/helper.js').explorer.const;
const ExplorerError = require('../common/ExplorerError');

class SyncBuilder {

  static async build(pltfrm, persistence, sender) {

    if (pltfrm === explorer_const.PLATFORM_FABRIC) {
      let SyncPlatform = require('../platform/fabric/sync/SyncPlatform');
      var platform = new SyncPlatform(persistence, sender);
      return platform;
    }
    throw new ExplorerError('Platform implimenation is not found for synch process' + pltfrm);
  }
}

module.exports = SyncBuilder;
