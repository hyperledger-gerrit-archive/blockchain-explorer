/*
*SPDX-License-Identifier: Apache-2.0
*/

var explorer_const = require('../common/helper').explorer.const;
var ExplorerError = require('../common/ExplorerError');

class PlatformBuilder {

  static async build(pltfrm, persistence, broadcaster) {

    if (pltfrm === explorer_const.PLATFORM_FABRIC) {
      let Platform = require('./fabric/Platform');
      var platform = new Platform(persistence, broadcaster);
      return platform;
    }
    throw new ExplorerError('Platform implimenation is not found for ' + pltfrm);
  }
}

module.exports = PlatformBuilder;
