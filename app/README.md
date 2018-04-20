How to use Explorer's REST API
=======

The Explorer's REST API is an easy way to interact with your fabric network.

## How to create a Channel (../api/channel)
- Generating tx file
	- Run the tool configtxgen. It can be found in ../fabric-samples/first-network/bin/configtxgen
	- Set FABRIC_CFG_PATH to your configtx.yaml file (because the tool will look for this file while generating the tx). Ex. export FABRIC_CFG_PATH = ../../artifacts/channel
	- Example: ../../bin/configtxgen -channelId mychannel -outputCreateChannelTx mychannel.txt -profile TwoOrgsChannel

- Call Explorer' channel API
	- Make sure the network-config.yaml is available up-front. The API will read its configurations to create a channel
    - Make sure your network-config.yaml file have all of the path point to the right locations of .pem and crt files
    - Make sure the channel you are creating has its configuration available in this network-config.yaml file as weel
    - An example of this network-config.yaml file can be found at ../fabric-samples/balance-transfer/artifacts/
    - Make sure the orderers container up and run (order.example.com). Run "docker ps" to check its status
    - Call ../api/channel with POST method 
```
    Example:
    curl -s -X POST \
    http://localhost:8080/api/channel \
    -H 'content-type: application/json' \
    -d '{
            "orgName":"org1",
            "channelName":"mychannel",
            "channelConfigPath":"../fabric-samples/balance-transfer/artifacts/channel/mychannel.tx",
            "orgPath":"../fabric-samples/balance-transfer/artifacts/org1.yaml",
            "networkCfgPath":"../fabric-samples/balance-transfer/artifacts/network-config.yaml"
         }'
```
