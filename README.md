![Hyperledger Explorer](https://pbs.twimg.com/media/DhRGZJDWkAEKjIT.jpg "Hyperledger Explorer")


Hyperledger Explorer
=======

Hyperledger Explorer is a simple, powerful, easy-to-use, highly maintainable, open source browser for viewing activity on the underlying blockchain network. Users have the ability to configure & build Hyperledger Explorer natively on MacOS and Ubuntu.



## Table of Contents

- [Release Notes](#Release-Notes)
- [Directory Structure](#Directory-Structure)
- [Dependencies](#Dependencies)
- [Clone GIT Repository](#Clone-GIT-Repository)
- [Database Setup](#Database-Setup)
- [Fabric Network Setup](#Fabric-Network-Setup)
- [Configure Hyperledger Fabric](#Configure-Hyperledger-Fabric)
- [Fabcar Sample Configure Hyperledger Explorer](#Fabcar-Sample-Configure-Hyperledger-Explorer)
- [Balance Transfer Sample Configure Hyperledger Explorer](#Balance-Transfer-Sample-Configure-Hyperledger-Explorer)
- [Hyperledger Composer Setup](#Hyperledger-Composer-Setup)
- [Hyperledger Cello Setup](#Hyperledger-Cello-Setup)
- [Build Hyperledger Explorer](#Build-Hyperledger-Explorer)
- [Run Hyperledger Explorer](#Run-Hyperledger-Explorer)
- [Run Hyperledger Explorer using Docker](#Run-Hyperledger-Explorer-using-Docker)
- [Hyperledger Explorer Swagger](#Hyperledger-Explorer-Swagger)
- [Logs](#Logs)
- [Troubleshooting](#Troubleshooting)
- [License](#License)

<a href="https://jbt.github.io/markdown-editor/#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">README.md</a>

<a name="Release-Notes"/>
## 1.0 Release Notes


| Hyperledger Explorer Version                                | Fabric Version Supported                                         | NodeJS Version Supported                          |
| --                                                          | --                                                               | --                                                |
| <b>[v0.3.9.1](release_notes/v0.3.9.1.md)</b> (Feb 28, 2019) | [v1.4](https://hyperledger-fabric.readthedocs.io/en/release-1.4) | [8.11.x](https://nodejs.org/en/download/releases) |
| <b>[v0.3.9](release_notes/v0.3.9.md)</b> (Feb 7, 2019)      | [v1.4](https://hyperledger-fabric.readthedocs.io/en/release-1.4) | [8.11.x](https://nodejs.org/en/download/releases) |
| <b>[v0.3.8](release_notes/v0.3.8.md)</b> (Dec 13, 2018)     | [v1.3](https://hyperledger-fabric.readthedocs.io/en/release-1.3) | [???](https://nodejs.org/en/download/releases) |
| <b>[v0.3.7](release_notes/v0.3.7.md)</b> (Sep 21, 2018)     | [v1.2](https://hyperledger-fabric.readthedocs.io/en/release-1.2) | [???](https://nodejs.org/en/download/releases) |
| <b>[v0.3.6.1](release_notes/v0.3.6.1.md)</b> (Sep 21, 2018) | [v1.2](https://hyperledger-fabric.readthedocs.io/en/release-1.2) | [???](https://nodejs.org/en/download/releases) |
| <b>[v0.3.6](release_notes/v0.3.6.md)</b> (Sep 6, 2018)      | [v1.2](https://hyperledger-fabric.readthedocs.io/en/release-1.2) | [???](https://nodejs.org/en/download/releases) |
| <b>[v0.3.5.1](release_notes/v0.3.5.1.md)</b> (Sep 21, 2018) | [v1.1](https://hyperledger-fabric.readthedocs.io/en/release-1.1) | [???](https://nodejs.org/en/download/releases) |
| <b>[v0.3.5](release_notes/v0.3.5.md)</b> (Aug 24, 2018)     | [v1.1](https://hyperledger-fabric.readthedocs.io/en/release-1.1) | [???](https://nodejs.org/en/download/releases) |
| <b>[v0.3.4](release_notes/v0.3.4.md)</b> (Jul 13, 2018)     | [v1.1](https://hyperledger-fabric.readthedocs.io/en/release-1.1) | [???](https://nodejs.org/en/download/releases) |



<a name="Directory-Structure"/>
## 2.0 Directory Structure

<pre>
blockchain-explorer
    |
    ├── app                     Application backend root, Explorer configuration
    |    ├── rest               REST API
    |    ├── persistence        Persistence layer
    |    ├── fabric             Persistence API (Hyperledger Fabric)
    |    └── platform           Platforms
    |    |    └── fabric        Explorer API (Hyperledger Fabric)
    |    └── test               Application backend test
    |
    └── client         	        Web UI
         ├── public             Assets
         └── src                Front end source code
              ├── components    React framework
              ├── services      Request library for API calls
              ├── state         Redux framework
              └── static        Custom and Assets
</pre>



<a name="Dependencies"/>
## 3.0 Dependencies

Following are the software dependencies required to install and run hyperledger explorer:
* Nodejs 8.11.x (Note that v9.x is not yet supported)
* PostgreSQL 9.5 or greater
* jq [https://stedolan.github.io/jq/]
* Linux-based operating system, such as Ubuntu or MacOS

Verified Docker versions supported:
* Docker 17.06.2-ce [https://www.docker.com/community-edition]   CHECK LINK  RECOMMEND Docker greater than 18.09.2
* Docker Compose 1.14.0 [https://docs.docker.com/compose/]



<a name="Clone-GIT-Repository"/>
## 4.0 Clone GIT Repository

Clone this repository to get the latest using the following command.

- `git clone https://github.com/hyperledger/blockchain-explorer.git`
- `cd blockchain-explorer`



<a name="Database-Setup"/>
## 5.0 Database Setup

- `cd blockchain-explorer/app`
- Modify explorerconfig.json to update PostgreSQL database settings.

<pre>
"postgreSQL": {
    "host": "127.0.0.1",
    "port": "5432",
    "database": "fabricexplorer",
    "username": "hppoc",
    "passwd": "password"
}
</pre>

Another alternative to configure database settings is to use environment variables, example of settings:
<pre>
export DATABASE_HOST=127.0.0.1
export DATABASE_PORT=5432
export DATABASE_DATABASE=fabricexplorer
export DATABASE_USERNAME=hppoc
export DATABASE_PASSWD=pass12345
</pre>

**Important repeat after every git pull (in some case you may need to apply permission to db/ directory, from blockchain-explorer/app/persistence/fabric/postgreSQL run: `chmod -R 775 db/` 
 

Run create database script:

<b>Ubuntu</b>

- `cd blockchain-explorer/app/persistence/fabric/postgreSQL/db`
- `sudo -u postgres ./createdb.sh`


<b>MacOS</b>

- `cd blockchain-explorer/app/persistence/fabric/postgreSQL/db`
- `./createdb.sh`


Connect to the PostgreSQL database and run DB status commands:

- `\l`  View created fabricexplorer database.
- `\d`  View created tables.



<a name="Fabric-Network-Setup"/>
## 6.0 Fabric Network Setup

- <b>Note: This section will take some time to complete.</b>
- Setup your own network using the [Building Your First Network](http://hyperledger-fabric.readthedocs.io/en/latest/build_network.html) tutorial from Hyperledger. Once you setup the network, please modify the values in `/blockchain-explorer/app/platform/fabric/config.json` accordingly.
- Hyperledger Explorer defaults to utilize [fabric-samples/first-network](https://github.com/hyperledger/fabric-samples).
- Make sure to set the environment variables `CORE_PEER_GOSSIP_BOOTSTRAP` and `CORE_PEER_GOSSIP_EXTERNAL_ENDPOINT` for each peer in the docker-compose.yaml file. These settings enable the Fabric discovery service, which is used by Hyperledger Explorer to discover the network topology.



<a name="Configure-Hyperledger-Fabric"/>
## 7.0 Configure Hyperledger Fabric

On another terminal:

- `cd blockchain-explorer/app/platform/fabric`
- Modify config.json to define your fabric network connection profile:
<pre>{
    "network-configs": {
        "first-network": {
            "name": "firstnetwork",
            "profile": "./connection-profile/first-network.json",
            "enableAuthentication": false
        }
    },
    "license": "Apache-2.0"
}</pre>

- "first-network" is the name of your connection profile, and can be changed to any name.
- "name" is a name you want to give to your fabric network, you can change only value of the key "name".
- "profile" is the location of your connection profile, you can change only value of the key "profile"

- Modify connection profile in the JSON file first-network.json:
	- Change "fabric-path" to your fabric network disk path in the first-network.json file: <br>`/blockchain-explorer/app/platform/fabric/connection-profile/first-network.json`
	- Provide the full disk path to the adminPrivateKey config option, it ussually ends with "_sk", for example:<br>
	`"/fabric-path/fabric-samples/first-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/aaacd899a6362a5c8cc1e6f86d13bfccc777375365bbda9c710bb7119993d71c_sk"`

	- "adminUser" is the the admin user of the network, in this case it's fabric CA or an identity user.
    - "adminPassword" is the password for the admin user.
	- "enableAuthentication" is a flag to enable authentication using a login page, setting to false will skip authentication.



<a name="Fabcar-Sample-Configure-Hyperledger-Explorer"/>
## 7.1 Optional: Fabcar Sample Configure Hyperledger Explorer

 Setup Fabcar sample network by following [Fabcar Sample Network](https://hyperledger-fabric.readthedocs.io/en/release-1.4/understand_fabcar_network.html) from Hyperledger fabric samples.
- Make sure to set the environment variables ```CORE_PEER_GOSSIP_BOOTSTRAP``` and ```CORE_PEER_GOSSIP_EXTERNAL_ENDPOINT``` for each peer in the docker-compose.yaml file. These settings enable the Fabric discovery service, which is used by Hyperledger Explorer to discover the network topology.
- Configure Fabcar sample network based on this link [CONFIG-FABCAR-HLEXPLORER.md](CONFIG-FABCAR-HLEXPLORER.md)


<a name="Balance-Transfer-Sample-Configure-Hyperledger-Explorer"/>
## 7.2 Optional: Balance Transfer Sample Configure Hyperledger Explorer

 Balance Transfer Sample network by following [Balance Transfer Sample](https://github.com/hyperledger/fabric-samples/tree/release-1.4/balance-transfer) from Hyperledger fabric samples.
- Balance Transfer Sample network based on this link [CONFIG-BALANCE-TRANSFER-HLEXPLORER.md](CONFIG-BALANCE-TRANSFER-HLEXPLORER.md)



<a name="Hyperledger-Composer-Setup"/>
## 8.0 Hyperledger Composer Setup

 Setup your own network using Composer [Build your network](https://hyperledger.github.io/composer/latest/installing/development-tools) from Hyperledger Composer. Once you setup the network, please modify the values in `/blockchain-explorer/app/platform/fabric/config.json` accordingly.

### 8.1 Composer Configure Hyperledger Explorer

On another terminal.

- `git checkout v0.3.5.1`
- `cd blockchain-explorer/app/platform/fabric`
- Modify config.json to update network-config.
	- Change "fabric-path" to your composer network path,
	- Configure the Hyperledger composer based on this link [CONFIG-COMPOSER-HLEXPLORER.md](CONFIG-COMPOSER-HLEXPLORER.md)
- Modify "syncStartDate" to filter data by block timestamp
- Modify "channel" to your default channel

If you are connecting to a non TLS fabric peer, please modify "network-id.clients.client-id.tlsEnable" (`true->false`) in config.json. Depending on this configuration, the application decides whether to go TLS or non TLS route.




<a name="Hyperledger-Cello-Setup"/>
## 9.0 Optional: Hyperledger Cello Setup

 Setup your fabric network using [Setup Cello Platform](https://cello.readthedocs.io/en/latest/setup/setup/) from Hyperledger Cello. Once you setup the network, please modify the values in `/blockchain-explorer/app/platform/fabric/config.json` accordingly.


### 9.1 Cello Configure Hyperledger Explorer

On another terminal.

- `git checkout v0.3.5.1`
- `cd blockchain-explorer/app/platform/fabric`
- Modify config.json to update network-config.
	- Change "fabric-path" to your cello network path,
	- Configure the Hyperledger cello based on this link [CONFIG-CELLO-HLEXPLORER.md](CONFIG-CELLO-HLEXPLORER.md)
- Modify "syncStartDate" to filter data by block timestamp
- Modify "channel" to your default channel

If you are connecting to a non TLS fabric peer, please modify "network-id.clients.client-id.tlsEnable" (`true->false`) in config.json. Depending on this configuration, the application decides whether to go TLS or non TLS route.



<a name="Build-Hyperledger-Explorer"/>
## 10.0 Build Hyperledger Explorer
**Important: repeat the below steps after every git pull.**

On another terminal:

- `cd blockchain-explorer`
- `npm install`
- `cd blockchain-explorer/app/test`
- `npm install`
- `npm run test`
- `cd client/`
- `npm install`
- `npm test -- -u --coverage`
- `npm run build`



<a name="Run-Hyperledger-Explorer"/>
## 11.0 Run Hyperledger Explorer

- `cd blockchain-explorer/app`
- Modify explorerconfig.json to update sync properties
	- sync type (local or host), platform, blocksSyncTime(in min) details.

Sync Process Configuration

- Please restart Explorer if any changes made to explorerconfig.json

Host (Standalone)

- Ensure same configuration in Explorer explorerconfig.json if sync process is running from different locations

```json
 "sync": {
    "type": "host"
 }
```
Local (Run with Explorer)

```json
 "sync": {
    "type": "local"
 }
```

From a new terminal:

- `cd blockchain-explorer/`
- `./start.sh`  (it will have the backend up).
- Launch the URL http://localhost:8080 on a browser.
- `./stop.sh`  (it will stop the node server).

From new terminal (if Sync Process in Standalone).

- `cd blockchain-explorer/`
- `./syncstart.sh` (it will have the sync node up).
- `./syncstop.sh`  (it will stop the sync node).

- If the Hyperledger Explorer was used previously in your browser be sure to clear the cache before relaunching.



<a name="Run-Hyperledger-Explorer-using-Docker"/>
## 12.0 Optional: Run Hyperledger Explorer using Docker

There is also an automated deployment of the **Hyperledger Explorer** available via **docker** given the following requirements are met:

* **BASH** installed
* **Docker** is installed on deployment machine.


### 12.1 Non interactive deployment assumptions
* By default, the deployment script uses the **192.168.10.0/24** virtual network, and needs to be available with no overlapping IPs (this means you can't have physical computers on that network nor other docker containers running). In case of overlappings, edit the script and change target network and container targets IPs.
* By default both services (frontend and database) will run on same machine, but script modifications is allowed to run on separate machines just changing target DB IP on frontend container.
* Crypto material is correctly loaded under `examples/$network/crypto`
* Fabric network configuration is correctly set under `examples/$network/config.json`


### 12.2 Docker

* Hyperledger Explorer docker repository `https://hub.docker.com/r/hyperledger/explorer/`
* Hyperledger Explorer PostgreSQL docker repository `https://hub.docker.com/r/hyperledger/explorer-db`


### 12.3 Steps to deploy using Docker

From a new terminal:

- `cd blockchain-explorer/`
- Create a new folder (lets call it `dockerConfig`) to store your hyperledger network configuration under `examples` (`mkdir -p ./examples/dockerConfig`)
- Save your hyperledger network configuration under `examples/dockerConfig/config.json`
- Save your hyperledger network certs data under `examples/dockerConfig/crypto`
- Run the explorer pointing to previously created folder.

From a new terminal:

- `cd blockchain-explorer/`
- `./deploy_explorer.sh dockerConfig`  (it will automatically deploy both database and frontend apps using Hyperledger Fabric network configuration stored under `examples/dockerConfig` folder)

Note: the example with additional information can be found at [examples/net1](./examples/net1) folder.

### 12.4 Joining existing Docker network
If the Blockchain network is deployed in the Docker, you may pass network name as second parameter to join that network
(docker_network in the example below):
- `./deploy_explorer.sh dockerConfig docker_network`

### 12.5 Steps to stop containers
- `./deploy_explorer.sh --down`

### 12.6 Steps to remove containers and clean images
- `./deploy_explorer.sh --clean`


## 13.0 NPM utility scripts to Dockerise application

Set the `DOCKER_REGISTRY` variable to the Container Registry you will use and login to that registry if you want to store your container there.

To build the container (auto-tagged as `latest`), run:

    npm run docker_build

To tag the container with your registry and the NPM package version, run:

    npm run docker_tag


To push the container to your registry, run:

    npm run docker_push


## 14.0 Run Hyperledger Explorer using Docker-Compose

* Modify docker-compose.yaml to align with your environment
  * networks > mynetwork.com > external > name
  * services > explorer.mynetwork.com > volumes
    * Connection profile path (ex. ./examples/net1/config.json)
    * Directory path for crypto artifacts of fabric network (ex. ./examples/net1/crypto)
* Run the following to start up explore and explorer-db services

	```
	cd /some/where/blockchain-explorer
	docker-compose up -d
	```

* To stop services without removing persistent data, run the following:

	```
	docker-compose down
	```

* In this docker-compose.yaml, 2 named volumes are allocated for persistent data (for Postgres data and user credential provided by fabric-ca)
  * If you would like to clear these named volumes, run the following:
	```
	docker-compose down -v
	```


<a name="Hyperledger-Explorer-Swagger"/>
## 15.0 Hyperledger Explorer Swagger

- Once the Hyperledger Explorer has been launched go to http://localhost:8080/api-docs to view the Rust API description



<a name="Logs"/>
## 16.0 Logs
- Please visit the `./logs/console` folder to view the logs relating to console and `./logs/app` to view the application logs and visit the `./logs/db` to view the database logs.
- Logs rotate for every 7 days.



<a name="Troubleshooting"/>
## 17.0 Troubleshooting

- Please visit the [TROUBLESHOOT.md](TROUBLESHOOT.md) to view the Troubleshooting TechNotes for Hyperledger Explorer.



<a name="License"/>
## 18.0 License

Hyperledger Explorer Project source code is released under the Apache 2.0 license. The README.md, CONTRIBUTING.md files, and files in the "images", "__snapshots__" folders are licensed under the Creative Commons Attribution 4.0 International License. You may obtain a copy of the license, titled CC-BY-4.0, at http://creativecommons.org/licenses/by/4.0/.
