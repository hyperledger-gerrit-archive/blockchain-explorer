/**
 *    SPDX-License-Identifier: Apache-2.0
 */

let helper = require('../../../common/helper');
const logger = helper.getLogger('NetworkService');

class NetworkService {
  constructor(platform) {
    this.platform = platform;
  }

  async networkList() {
    // Get the list of the networks from the  configuration that was loaded from the config.json
    let networklist = [];
    const networks = this.platform.getNetworks();
    const iterator = networks.entries();
    for (let value of iterator) {
      networklist.push(value);
    }

    logger.log('Network list ', networklist);
    return networklist;
  }
}

module.exports = NetworkService;
