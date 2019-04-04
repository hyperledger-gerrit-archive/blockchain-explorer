/**
 *    SPDX-License-Identifier: Apache-2.0
 */

const requtil = require('./../../../rest/requestutils');
const axios = require('axios');

const opsserviceroutes = async function(router, platform) {
  const proxy = platform.getProxy();
  const HEALTHZ = 'healthz';
  const METRICS = 'metrics';

  /**
    Get metrics from HLFabric operations service

    'healthz' returns the status of the peer, or orderer UP, or DOWN
    curl -s -X GET \
        http://localhost:8080/api/operationsService/healthz \
        -H "authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTU1Mzc5MTEyNiwiZXhwIjoxNTUzOTYzOTI2fQ.hGl7vXdeaAOFrp133R12v55ZSHuAztliInwdPukWMRg" \
        -H "content-type: application/json" \

    OR

    curl -s -X GET \
        http://localhost:8080/api/operationsService/metrcis \
        -H "authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTU1Mzc5MTEyNiwiZXhwIjoxNTUzOTYzOTI2fQ.hGl7vXdeaAOFrp133R12v55ZSHuAztliInwdPukWMRg" \
        -H "content-type: application/json" \

    The "authorization: Bearer" JWT tokeen can be retrieved using Dev tools in Chrome under Network - Request Headers

*/

  router.get('/operationsService/:network/:type', async (req, res) => {
    let TYPE = HEALTHZ;
    let healthStatus = [];
    let network = req.params.network;
    let checkType = req.params.type;
    if (checkType) {
      if (checkType === METRICS) {
        TYPE = METRICS;
      }
    }
    console.log(`Initiated /operationsService ${TYPE} request`);
    if (network && checkType) {
      const opsServConfig = await proxy.getOperationsServiceConfig(network);

      if (opsServConfig) {
        for (let i = 0; i < opsServConfig.length; i++) {
          for (let x in opsServConfig[i]) {
            let target = opsServConfig[i][x];

            for (let t in target) {
              let targetUrl = target[t].url + '/' + TYPE;
              let targetName = target[t].name;
              if (targetUrl && targetName) {
                console.log(
                  'initiated request to HLFabric Operations Service, URL: ',
                  targetUrl,
                  ' target ',
                  targetName
                );
                // call fabric operations service REST
                let data = await getOperationsService(
                  targetUrl,
                  targetName,
                  TYPE,
                  []
                );
                healthStatus.push(data);
              } else {
                console.error('Invalid target URL, and Name ', target[t]);
              }
            }
            //
          }
        }
      }

      res.send({
        status: 200,
        healthStatus: healthStatus
      });
    } else {
      return requtil.invalidRequest(req, res);
    }
  });

  async function getOperationsService(
    targetUrl,
    targetName,
    type,
    connectionOptions
  ) {
    console.log(
      'getOperationsService: ',
      targetUrl,
      targetName,
      type,
      connectionOptions
    );
    let healthStatus = null;
    try {
      const response = await axios.get(targetUrl);
      let data = null;
      if (type === HEALTHZ) {
        data = JSON.stringify(response.data);
        healthStatus = {
          targetName: targetName,
          targetUrl: targetUrl,
          status: 'SUCCESS',
          data: data
        };
      } else if (type === METRICS) {
        /**
                 * Example response from hlfabric metrics rest api
                line  # HELP ledger_statedb_commit_time Time taken in seconds for committing block changes to state db.
                line  # TYPE ledger_statedb_commit_time histogram
                line  ledger_statedb_commit_time_bucket{channel="mychannel",le="0.005"} 5
                line  ledger_statedb_commit_time_bucket{channel="mychannel",le="0.01"} 5
                line  ledger_statedb_commit_time_bucket{channel="mychannel",le="0.015"} 5
                line  ledger_statedb_commit_time_bucket{channel="mychannel",le="0.05"} 5
                 *
                 */
        let headerType = '# TYPE';
        let headerHelp = '# HELP';
        // process response from the HLFabric Operations Service
        const lines = response.data.split(/\n|\r/);
        let tempHeaderHelp = '';
        let tempHeaderType = '';
        let metricsData = [];
        let metricsRow = [];
        for (let i in lines) {
          if (lines[i]) {
            let line = lines[i].toString().trim();
            if (line.startsWith(headerHelp)) {
              // new set of metrics in
              if (metricsRow.length > 0) {
                metricsData.push({
                  HELP: tempHeaderHelp,
                  TYPE: tempHeaderType,
                  data: metricsRow
                });
                // reset metrics row
                metricsRow = [];
              }
              tempHeaderHelp = JSON.stringify(line.replace(headerHelp, ''));
            } else if (line.startsWith(headerType)) {
              tempHeaderType = JSON.stringify(line.replace(headerType, ''));
            } else {
              metricsRow.push(JSON.stringify(line));
            }
          }
        }

        healthStatus = {
          targetName: targetName,
          targetUrl: targetUrl,
          status: 'SUCCESS',
          data: metricsData
        };
      }
    } catch (error) {
      console.error(error);
      healthStatus = {
        targetName: targetName,
        targetUrl: targetUrl,
        status: 'ERROR',
        error: error,
        data: data
      };
    }
    return healthStatus;
  }
};

module.exports = opsserviceroutes;
