# Hyperledger Explorer

Hyperledger Explorer is a simple, powerful, easy-to-use, highly maintainable, open source browser for viewing activity on the underlying blockchain network.

## Directory Structure
```
├── app            Fabric GRPC interface
├── db			   Postgres script and help class
├── client         Web Ui
├── listener       Websocket listener
├── metrics        Metrics about tx count per minute and block count per minute
├── service        The service
├── socket		   Push real time data to front end
├── timer          Timer to post information periodically
└── utils          Various utility scripts
```


## Requirements


Following are the software dependencies required to install and run hyperledger explorer
* nodejs 6.9.x (Note that v7.x is not yet supported)
* PostgreSQL 9.5 or greater

Hyperledger Explorer works with Hyperledger Fabric 1.0.  Install the following software dependencies to manage fabric network.
* docker 17.06.2-ce [https://www.docker.com/community-edition]
* docker-compose 1.14.0 [https://docs.docker.com/compose/]

## Clone Repository

Clone this repository to get the latest using the following command.
1. `git clone https://github.com/hyperledger/blockchain-explorer.git`
2. `cd blockchain-explorer`

## Database setup
Run the database setup scripts located under `db/explorerpg.sql`

Connect to postgres database by entering below command from `blockchain-explorer` directory
`$ sudo -u postgres psql -d fabricexplorer`

On successfull login you should see `fabricexplorer=#`

Run sql script
`\i db/explorerpg.sql`

Run `\l` to see created fabricexplorer database
Run `\d` to see created tables

## Fabric network setup

 Setup your own network using [Build your network](http://hyperledger-fabric.readthedocs.io/en/latest/build_network.html) tutorial from Fabric. Once you setup the network, please modify the values in `config.json` accordingly.

## Running hyperledger-explorer

On another terminal,
1. `cd blockchain-explorer`
2. Modify config.json to update network-config
Change "fabric-path" to your fabric network path, example "/home/user1/workspace/fabric-samples" for the following keys: "tls_cacerts", "key", "cert".
Final path for key "tls_cacerts" will be "/home/user1/workspace/fabric-samples/first-network/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
3. Modify config.json to update one of the channel
	* pg host, username, password details
```json
 "channel": "mychannel",
 "pg": {
		"host": "127.0.0.1",
		"port": "5432",
		"database": "fabricexplorer",
		"username": "hppoc",
		"passwd": "password"
	}
```
If you are connecting to a non TLS fabric peer, please modify the
protocol (`grpcs->grpc`) and port (`9051-> 9050`) in the peer url and remove the `tls_cacerts`. Depending on this key, the application decides whether to go TLS or non TLS route.

## Build Hyperledger Explorer
From new terminal
4. cd blockchain-explorer/app/test
5. `npm install`
6. `npm run test`
7. cd blockchain-explorer
8. `npm install`
9. cd client/
10. `npm install`
11. `npm test -- -u --coverage`
12. `npm run build`
13. `npm run start` (to run in development mode port 3000)

## Run Hyperledger Explorer
From new terminal
14. cd blockchain-explorer/
15. `node main.js`  (it will have the backend up)
16. Launch the URL http://localhost:8080 on a browser.