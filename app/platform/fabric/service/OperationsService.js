/**
 *    SPDX-License-Identifier: Apache-2.0
 */

let helper = require('../../../common/helper');
const logger = helper.getLogger('OperationsService');

class OperationsService {
  constructor(platform) {
    this.platform = platform;
  }

  /**
   *
   * Get the operations service configuration, that is a part of HLFabric network configuration
   */

  async getOperationsServiceConfig(networkName) {
    let operationsServiceConfig = [];
    const network = this.platform.getNetworks().get(networkName);
    for (const [network_name, clients] of network.entries()) {
      if (clients.config && clients.config.operationsservice) {
        let orderers = clients.config.operationsservice.targets.orderers;
        if (orderers) {
          operationsServiceConfig.push({
            orderers: orderers
          });
        }
        let peers = clients.config.operationsservice.targets.peers;
        if (peers) {
          operationsServiceConfig.push({
            peers: peers
          });
        }
        logger.log(
          `\n OperationsService.getOperationsServiceConfig, network ${network_name} `,
          operationsServiceConfig
        );
        console.log(
          `\n OperationsService.getOperationsServiceConfig, network ${network_name} `,
          operationsServiceConfig
        );
        break;
      }
    }

    return operationsServiceConfig;
  }
}

module.exports = OperationsService;
