# Hyperledger Explorer

Hyperledger Explorer is a simple, powerful, easy-to-use, well maintained, open source utility to browse activity on the underlying blockchain network. Users have the ability to configure and build Hyperledger Explorer on MacOS and Ubuntu.



# Table of Contents    <!-- do not remove this comment, ensure there is a blank line before each heading -->

- [1.0 Release Notes](#Release-Notes)
- [2.0 Directory Structure](#Directory-Structure)
- [3.0 Dependencies](#Dependencies)
- [4.0 Clone GIT Repository](#Clone-GIT-Repository)
- [5.0 Database Setup](#Database-Setup)
- [6.0 Fabric Network Setup](#Fabric-Network-Setup)
- [7.0 Configure Hyperledger Fabric](#Configure-Hyperledger-Fabric)
    - [7.1 Optional: Configure Fabcar Sample](#Configure-Fabcar-Sample)
    - [7.2 Optional: Configure Balance Transfer Sample](#Configure-Balance-Transfer-Sample)
- [8.0 Hyperledger Composer Setup](#Hyperledger-Composer-Setup)
    - [8.1 Configure Hyperledger Explorer for Composer](#Configure-Hyperledger-Explorer-for-Composer)
- [9.0 Optional: Hyperledger Cello Setup](#Hyperledger-Cello-Setup)
    - [9.1 Configure Hyperledger Explorer for Cello](#Configure-Hyperledger-Explorer-for-Cello)
- [10.0 Build Hyperledger Explorer](#Build-Hyperledger-Explorer)
- [11.0 Run Hyperledger Explorer](#Run-Hyperledger-Explorer)
- [12.0 Optional: Run Hyperledger Explorer Using Docker](#Run-Hyperledger-Explorer-using-Docker)
    - [12.1 Non Interactive Deployment Assumptions](#Docker-Non-Interactive-Deployment-Assumptions)
    - [12.2 Docker Repository](#Docker-Docker-Repository)
    - [12.3 Deploy Explorer Using Docker](#Docker-Deploy-Explorer-Using-Docker)
    - [12.4 Join Existing Docker Network](#Docker-Join-Existing-Docker-Network)
    - [12.5 Stopping Docker Containers](#Docker-Stopping-Docker-Containers)
    - [12.6 Removing Docker Containers and Clean Images](#Docker-Removing-Docker-Containers-and-Clean-Images)
- [13.0 NPM Utility Scripts to Dockerise Application](#NPM-Utility-Scripts-to-Dockerize-Application)
- [14.0 Run Hyperledger Explorer Using Docker Compose](#Run-Hyperledger-Explorer-Using-Docker-Compose)
- [15.0 Hyperledger Explorer Swagger](#Hyperledger-Explorer-Swagger)
- [16.0 Logs](#Logs)
- [17.0 Troubleshooting](#Troubleshooting)
- [18.0 License](#License)



<a name="Release-Notes" />

# 1.0 Release Notes    <!-- do not remove this comment, ensure there is a blank line before each heading -->

| Hyperledger Explorer Version                                | Fabric Version Supported                                         | NodeJS Version Supported                          |
| --                                                          | --                                                               | --                                                |
| <b>[v0.3.9.1](release_notes/v0.3.9.1.md)</b> (Feb 28, 2019) | [v1.4](https://hyperledger-fabric.readthedocs.io/en/release-1.4) | [8.11.x](https://nodejs.org/en/download/releases) |
| <b>[v0.3.9](release_notes/v0.3.9.md)</b> (Feb 7, 2019)      | [v1.4](https://hyperledger-fabric.readthedocs.io/en/release-1.4) | [8.11.x](https://nodejs.org/en/download/releases) |
| <b>[v0.3.8](release_notes/v0.3.8.md)</b> (Dec 13, 2018)     | [v1.3](https://hyperledger-fabric.readthedocs.io/en/release-1.3) | [8.x.x](https://nodejs.org/en/download/releases)  |
| <b>[v0.3.7](release_notes/v0.3.7.md)</b> (Sep 21, 2018)     | [v1.2](https://hyperledger-fabric.readthedocs.io/en/release-1.2) | [8.x.x](https://nodejs.org/en/download/releases)  |
| <b>[v0.3.6.1](release_notes/v0.3.6.1.md)</b> (Sep 21, 2018) | [v1.2](https://hyperledger-fabric.readthedocs.io/en/release-1.2) | [8.x.x](https://nodejs.org/en/download/releases)  |
| <b>[v0.3.6](release_notes/v0.3.6.md)</b> (Sep 6, 2018)      | [v1.2](https://hyperledger-fabric.readthedocs.io/en/release-1.2) | [8.x.x](https://nodejs.org/en/download/releases)  |
| <b>[v0.3.5.1](release_notes/v0.3.5.1.md)</b> (Sep 21, 2018) | [v1.1](https://hyperledger-fabric.readthedocs.io/en/release-1.1) | [8.x.x](https://nodejs.org/en/download/releases)  |
| <b>[v0.3.5](release_notes/v0.3.5.md)</b> (Aug 24, 2018)     | [v1.1](https://hyperledger-fabric.readthedocs.io/en/release-1.1) | [8.x.x](https://nodejs.org/en/download/releases)  |
| <b>[v0.3.4](release_notes/v0.3.4.md)</b> (Jul 13, 2018)     | [v1.1](https://hyperledger-fabric.readthedocs.io/en/release-1.1) | [8.x.x](https://nodejs.org/en/download/releases)  |



<a name="Directory-Structure" />

# 2.0 Directory Structure    <!-- do not remove this comment, ensure there is a blank line before each heading -->

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



<a name="Dependencies" />

# 3.0 Dependencies    <!-- do not remove this comment, ensure there is a blank line before each heading -->

Following are the software dependencies required to install and run hyperledger explorer:
* Nodejs 8.11.x (Note that v9.x is not yet supported)
* PostgreSQL 9.5 or greater
* jq (https://stedolan.github.io/jq)
* Linux-based operating system, such as Ubuntu or MacOS

Verified Docker versions supported:
* Docker CE 18.09.2 or later (https://hub.docker.com/search/?type=edition&offering=community&operating_system=linux)
* Docker Compose 1.14.0 (https://docs.docker.com/compose)



<a name="Clone-GIT-Repository" />

# 4.0 Clone GIT Repository    <!-- do not remove this comment, ensure there is a blank line before each heading -->

Clone this repository to get the latest using the following command.

- `git clone https://github.com/hyperledger/blockchain-explorer.git`
- `cd blockchain-explorer`



<a name="Database-Setup" />

# 5.0 Database Setup    <!-- do not remove this comment, ensure there is a blank line before each heading -->

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



<a name="Fabric-Network-Setup" />

# 6.0 Fabric Network Setup    <!-- do not remove this comment, ensure there is a blank line before each heading -->

- <b>Note: This section will take some time to complete.</b>
- Setup your own network using the [Building Your First Network](http://hyperledger-fabric.readthedocs.io/en/latest/build_network.html) tutorial from Hyperledger. Once you setup the network, please modify the values in `/blockchain-explorer/app/platform/fabric/config.json` accordingly.
- Hyperledger Explorer defaults to utilize [fabric-samples/first-network](https://github.com/hyperledger/fabric-samples).
- Make sure to set the environment variables `CORE_PEER_GOSSIP_BOOTSTRAP` and `CORE_PEER_GOSSIP_EXTERNAL_ENDPOINT` for each peer in the docker-compose.yaml file. These settings enable the Fabric discovery service, which is used by Hyperledger Explorer to discover the network topology.



<a name="Configure-Hyperledger-Fabric" />

# 7.0 Configure Hyperledger Fabric    <!-- do not remove this comment, ensure there is a blank line before each heading -->

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



<a name="Configure-Fabcar-Sample" />

# 7.1 Optional: Configure Fabcar Sample    <!-- do not remove this comment, ensure there is a blank line before each heading -->

Setup Fabcar sample network by following [Fabcar Sample Network](https://hyperledger-fabric.readthedocs.io/en/release-1.4/understand_fabcar_network.html) from Hyperledger fabric samples.
- Make sure to set the environment variables ```CORE_PEER_GOSSIP_BOOTSTRAP``` and ```CORE_PEER_GOSSIP_EXTERNAL_ENDPOINT``` for each peer in the docker-compose.yaml file. These settings enable the Fabric discovery service, which is used by Hyperledger Explorer to discover the network topology.
- Configure Fabcar sample network based on this link [CONFIG-FABCAR-HLEXPLORER.md](CONFIG-FABCAR-HLEXPLORER.md)



<a name="Configure-Balance-Transfer-Sample" />

# 7.2 Optional: Configure Balance Transfer Sample    <!-- do not remove this comment, ensure there is a blank line before each heading -->

 Balance Transfer Sample network by following [Balance Transfer Sample](https://github.com/hyperledger/fabric-samples/tree/release-1.4/balance-transfer) from Hyperledger fabric samples.
- Balance Transfer Sample network based on this link [CONFIG-BALANCE-TRANSFER-HLEXPLORER.md](CONFIG-BALANCE-TRANSFER-HLEXPLORER.md)



<a name="Hyperledger-Composer-Setup" />

# 8.0 Hyperledger Composer Setup    <!-- do not remove this comment, ensure there is a blank line before each heading -->

 Setup your own network using Composer [Build your network](https://hyperledger.github.io/composer/latest/installing/development-tools) from Hyperledger Composer. Once you setup the network, please modify the values in `/blockchain-explorer/app/platform/fabric/config.json` accordingly.



<a name="Configure-Hyperledger-Explorer-for-Composer" />

## 8.1 Configure Hyperledger Explorer for Composer    <!-- do not remove this comment, ensure there is a blank line before each heading -->

On another terminal.

- `git checkout v0.3.5.1`
- `cd blockchain-explorer/app/platform/fabric`
- Modify config.json to update network-config.
	- Change "fabric-path" to your composer network path,
	- Configure the Hyperledger composer based on this link [CONFIG-COMPOSER-HLEXPLORER.md](CONFIG-COMPOSER-HLEXPLORER.md)
- Modify "syncStartDate" to filter data by block timestamp
- Modify "channel" to your default channel

If you are connecting to a non TLS fabric peer, please modify "network-id.clients.client-id.tlsEnable" (`true->false`) in config.json. Depending on this configuration, the application decides whether to go TLS or non TLS route.




<a name="Hyperledger-Cello-Setup" />

# 9.0 Optional: Hyperledger Cello Setup    <!-- do not remove this comment, ensure there is a blank line before each heading -->

 Setup your fabric network using [Setup Cello Platform](https://cello.readthedocs.io/en/latest/setup/setup/) from Hyperledger Cello. Once you setup the network, please modify the values in `/blockchain-explorer/app/platform/fabric/config.json` accordingly.



<a name="Configure-Hyperledger-Explorer-for-Cello" />

## 9.1 Optional: Configure Hyperledger Explorer for Cello    <!-- do not remove this comment, ensure there is a blank line before each heading -->

On another terminal.

- `git checkout v0.3.5.1`
- `cd blockchain-explorer/app/platform/fabric`
- Modify config.json to update network-config.
	- Change "fabric-path" to your cello network path,
	- Configure the Hyperledger cello based on this link [CONFIG-CELLO-HLEXPLORER.md](CONFIG-CELLO-HLEXPLORER.md)
- Modify "syncStartDate" to filter data by block timestamp
- Modify "channel" to your default channel

If you are connecting to a non TLS fabric peer, please modify "network-id.clients.client-id.tlsEnable" (`true->false`) in config.json. Depending on this configuration, the application decides whether to go TLS or non TLS route.



<a name="Build-Hyperledger-Explorer" />

# 10.0 Build Hyperledger Explorer    <!-- do not remove this comment, ensure there is a blank line before each heading -->

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



<a name="Run-Hyperledger-Explorer" />

# 11.0 Run Hyperledger Explorer    <!-- do not remove this comment, ensure there is a blank line before each heading -->

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



<a name="Run-Hyperledger-Explorer-using-Docker" />

# 12.0 Optional: Run Hyperledger Explorer Using Docker    <!-- do not remove this comment, ensure there is a blank line before each heading -->

There is also an automated deployment of the **Hyperledger Explorer** available via **docker** given the following requirements are met:

* **BASH** installed
* **Docker** is installed on deployment machine.



<a name="Docker-Non-Interactive-Deployment-Assumptions" />

## 12.1 Non Interactive Deployment Assumptions    <!-- do not remove this comment, ensure there is a blank line before each heading -->
* By default, the deployment script uses the **192.168.10.0/24** virtual network, and needs to be available with no overlapping IPs (this means you can't have physical computers on that network nor other docker containers running). In case of overlappings, edit the script and change target network and container targets IPs.
* By default both services (frontend and database) will run on same machine, but script modifications is allowed to run on separate machines just changing target DB IP on frontend container.
* Crypto material is correctly loaded under `examples/$network/crypto`
* Fabric network configuration is correctly set under `examples/$network/config.json`



<a name="Docker-Docker-Repository" />

## 12.2 Docker Repository   <!-- do not remove this comment, ensure there is a blank line before each heading -->

* Hyperledger Explorer docker repository `https://hub.docker.com/r/hyperledger/explorer/`
* Hyperledger Explorer PostgreSQL docker repository `https://hub.docker.com/r/hyperledger/explorer-db`



<a name="Docker-Deploy-Explorer-Using-Docker" />

## 12.3 Deploy Explorer Using Docker    <!-- do not remove this comment, ensure there is a blank line before each heading -->

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



<a name="Docker-Join-Existing-Docker-Network" />

## 12.4 Joining Existing Docker Network    <!-- do not remove this comment, ensure there is a blank line before each heading -->
If the Blockchain network is deployed in the Docker, you may pass network name as second parameter to join that network
(docker_network in the example below):
- `./deploy_explorer.sh dockerConfig docker_network`



<a name="Docker-Stopping-Docker-Containers" />

## 12.5 Stopping Docker Containers    <!-- do not remove this comment, ensure there is a blank line before each heading -->
- `./deploy_explorer.sh --down`



<a name="Docker-Removing-Docker-Containers-and-Clean-Images" />

## 12.6 Removing Docker Containers and Clean Images    <!-- do not remove this comment, ensure there is a blank line before each heading -->
- `./deploy_explorer.sh --clean`



<a name="NPM-Utility-Scripts-to-Dockerize-Application" />

# 13.0 NPM Utility Scripts to Dockerize Application    <!-- do not remove this comment, ensure there is a blank line before each heading -->

Set the `DOCKER_REGISTRY` variable to the Container Registry you will use and login to that registry if you want to store your container there.

To build the container (auto-tagged as `latest`), run:
    ```
    npm run docker_build
    ```

To tag the container with your registry and the NPM package version, run:
    ```
    npm run docker_tag
    ```

To push the container to your registry, run:
    ```
    npm run docker_push
    ```



<a name="Run-Hyperledger-Explorer-Using-Docker-Compose" />

# 14.0 Run Hyperledger Explorer Using Docker Compose    <!-- do not remove this comment, ensure there is a blank line before each heading -->

* Modify docker-compose.yaml to align with your environment
    * networks > mynetwork.com > external > name
    * services > explorer.mynetwork.com > volumes
      * Connection profile path (ex. ./examples/net1/config.json)
      * Directory path for crypto artifacts of fabric network (ex. ./examples/net1/crypto)

* Run the following to start up explore and explorer-db services:
    ```
    cd /blockchain-explorer
    docker-compose up -d
    ```

* To stop services without removing persistent data, run the following:
    ```
    docker-compose down
    ```

* In this docker-compose.yaml, two named volumes are allocated for persistent data (for Postgres data and user credential provided by fabric-ca), if you would like to clear these named volumes, run the following:
    ```
    docker-compose down -v
    ```



<a name="Hyperledger-Explorer-Swagger" />

# 15.0 Hyperledger Explorer Swagger    <!-- do not remove this comment, ensure there is a blank line before each heading -->

- Once the Hyperledger Explorer has been launched go to http://localhost:8080/api-docs to view the Rust API description



<a name="Logs" />

# 16.0 Logs    <!-- do not remove this comment, ensure there is a blank line before each heading -->

- Please visit the `./logs/console` folder to view the logs relating to console and `./logs/app` to view the application logs and visit the `./logs/db` to view the database logs.
- Logs rotate every 7 days.



<a name="Troubleshooting" />

# 17.0 Troubleshooting    <!-- do not remove this comment, ensure there is a blank line before each heading -->

- Please visit the [TROUBLESHOOT.md](TROUBLESHOOT.md) to view the Troubleshooting TechNotes for Hyperledger Explorer.



<a name="License" />

# 18.0 License    <!-- do not remove this comment, ensure there is a blank line before each heading -->

Hyperledger Explorer Project source code is released under the Apache 2.0 license. The README.md, CONTRIBUTING.md files, and files in the "images", "__snapshots__" folders are licensed under the Creative Commons Attribution 4.0 International License. You may obtain a copy of the license, titled CC-BY-4.0, at http://creativecommons.org/licenses/by/4.0/.