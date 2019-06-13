#
#    SPDX-License-Identifier: Apache-2.0
#

#!/bin/bash

ROOTDIR="$(cd "$(dirname "$0")"/.. && pwd)"
export CORE_PEER_NETWORKID=e2egui
export COMPOSE_PROJECT_NAME=$CORE_PEER_NETWORKID
export NETWORK_PROFILE=first-network

docker rm -f $(docker ps -aq)
docker volume rm -f $(docker volume ls -q)

TIMEOUT=120
DELAY=5

pushd $ROOTDIR/app/platform/fabric/e2e-test/fabric-samples/first-network

rm -rf ../../configs/$CORE_PEER_NETWORKID
rm -rf channel-artifacts/* ordererOrganizations peerOrganizations

mkdir -p ../../configs/$CORE_PEER_NETWORKID
./byfn.sh generate -c mychannel

cp -a channel-artifacts ordererOrganizations peerOrganizations ../../configs/$CORE_PEER_NETWORKID

docker-compose -f docker-compose-cli.yaml down -v
docker-compose -f docker-compose-cli.yaml up -d

# continue to poll
# we either get a matched keyword, or reach TIMEOUT
rc=1
starttime=$(date +%s)
while
  [[ "$(($(date +%s) - starttime))" -lt "$TIMEOUT" ]] && [[ $rc -ne 0 ]];
do
  sleep $DELAY
  set -x
  docker logs cli | grep -q "All GOOD, BYFN execution completed"
  rc=$?
  set +x
done

popd


pushd $ROOTDIR/app/platform/fabric/e2e-test/docker-compose
docker-compose -f docker-compose-explorer.yaml down -v
docker-compose -f docker-compose-explorer.yaml up -d

rc=1
starttime=$(date +%s)
while
  [[ "$(($(date +%s) - starttime))" -lt "$TIMEOUT" ]] && [[ $rc -ne 0 ]];
do
  sleep $DELAY
  set -x
  docker logs explorer.mynetwork.com | grep -q "Please open web browser to access"
  rc=$?
  set +x
done

popd

