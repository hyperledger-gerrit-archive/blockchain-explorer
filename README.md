# fabric explorer

Fabric-explorer is a simple, powerful, easy-to-use, highly maintainable, open source fabric browser. Fabric-explorer can reduce the difficulty of learning and using fabric, so that we can intuitively feel the fabric of the powerful features.

## Directory Structure
```
├── app                    fabric GRPC interface
├── artifacts              
├── db			   the mysql script and help class
├── explorer_client        Web Ui
├── listener               websocket listener
├── metrics                metrics about tx count per minute and block count per minute
├── service                the service 
├── socket		   push real time data to front end
├── timer                    
└── utils                    
```


## Requirements

Please follow the Pre-requisites from [Hyperledger Fabric](http://hyperledger-fabric.readthedocs.io/en/latest/prereqs.html)

Following are the software dependencies required to install and run this fabric-explorer (Please refer to the above link for specific versions)
* docker-ce 17.06.2-ce
* docker-compose 1.14.0
* golang 1.9.x
* nodejs 6.9.x
* git
* mysql 5 or greater

## Clone Repository

Clone this repository to get the latest using the following command.
`git clone https://github.com/hyperledger/blockchain-explorer.git`
`cd blockchain-explorer`

## Database setup
Run the database setup scripts located under `db/fabricexplorer.sql`

`mysql -u<username> -p < db/fabricexplorer.sql`

## Fabric network setup

You can setup your own network using [Build your network](http://hyperledger-fabric.readthedocs.io/en/latest/build_network.html) tutorial from Fabric. Once you setup the network, please modify the values in `network-config.json` accordingly.

This repository comes with a sample network configuration to start with

1. `cd fabric-docker-compose-svt`
2. `./download_images.sh`
3. `./start.sh`

This brings up a 2 org network with channel name `mychannel` .

## Running blockchain-explorer

On another terminal, 
1. `cd blockchain-explorer`
2. Modify config.json, set channel, mysql, tls (if you use tls communication, please set  enableTls  true , if not set false) 
```json
 "channelsList": ["mychannel"],
 "enableTls":true, 
 "mysql":{
      "host":"172.16.10.162",
      "database":"fabricexplorer",
      "username":"root",
      "passwd":"123456"
   }
```

3. Modify `app/network-config.json` or `app/network-config-tls.json` (if you use tls communication) 

```json
 {
	"network-config": {
		"orderer": [{
			"url": "grpc://112.124.115.82:7050",
			"server-hostname": "orderer0.example.com"
		},{
			"url": "grpc://112.124.115.82:8050",
			"server-hostname": "orderer1.example.com"
		},{
			"url": "grpc://112.124.115.82:9050",
			"server-hostname": "orderer2.example.com"
		}],
		"org1": {
			"name": "peerOrg1",
			"mspid": "Org1MSP",
			"ca": "http://112.124.115.82:7054",
			"peer1": {
				"requests": "grpc://112.124.115.82:7051",
				"events": "grpc://112.124.115.82:7053",
				"server-hostname": "peer0.org1.example.com"
			},
			"peer2": {
				"requests": "grpc://112.124.115.82:8051",
				"events": "grpc://112.124.115.82:8053",
				"server-hostname": "peer1.org1.example.com"
			},
			"admin": {
				"key": "/artifacts/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore",
				"cert": "/artifacts/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts"
			}
		},
		"org2": {
			"name": "peerOrg2",
			"mspid": "Org2MSP",
			"ca": "http://112.124.115.82:8054",
			"peer1": {
				"requests": "grpc://112.124.115.82:9051",
				"events": "grpc://112.124.115.82:9053",
				"server-hostname": "peer0.org2.example.com"
			},
			"peer2": {
				"requests": "grpc://112.124.115.82:10051",
				"events": "grpc://112.124.115.82:10053",
				"server-hostname": "peer1.org2.example.com"
			},
			"admin": {
				"key": "/artifacts/crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp/keystore",
				"cert": "/artifacts/crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp/signcerts"
			}
		}
	}
}
```

4. `npm install`
5. `./start.sh`

Launch the URL http://localhost:8080 on a browser.

## Screenshots

This is how the fabric-explorer looks like,

![Fabric Explorer](https://github.com/xspeedcruiser/explorer-images/raw/master/blockchain-exp1.png)

![Fabric Explorer](https://github.com/xspeedcruiser/explorer-images/raw/master/blockchain-exp.png)

![Fabric Explorer](https://github.com/xspeedcruiser/explorer-images/raw/master/blockchain-exp3.png)