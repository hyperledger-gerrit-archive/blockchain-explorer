## Configure Operations Service to Hyperledger Explorer


#### The Operations Service
   - The peer and the orderer host an HTTP server that offers a RESTful “operations” API. This API is unrelated to the Fabric network services and is intended to be used by operators, not administrators or “users” of the network, more at
    [Operations Service](https://hyperledger-fabric.readthedocs.io/en/release-1.4/operations_service.html)


  #### Sample configuration for 'fabric-samples/first-network'

   - Modify <fabric-path>/fabric-samples/first-network/base/docker-compose-base.yaml file to add operations service per each orderrer, and each peer, and restart your fabric network in order to have operations service brodcasting metrics, and other info. Please visit provided [docker-compose-base-sample.yaml](blockchain-explorer/app/platform/fabric/connection-profile/docker-compose-base-sample.yaml) sample.


   - Orderer sample configuration
        ````
        - ORDERER_OPERATIONS_LISTENADDRESS=0.0.0.0:8443  # operation RESTful API
        - ORDERER_METRICS_PROVIDER=prometheus  # prometheus will pull metrics from orderer via /metrics RESTful API
        ````

   - Peer sample configuration
        ````
        - CORE_OPERATIONS_LISTENADDRESS=0.0.0.0:9443  # operation RESTful API
        - CORE_METRICS_PROVIDER=prometheus  # prometheus will pull metrics from orderer via /metrics RESTful API
        ````

    **Note that each peer, and orderer need to have a different port, and it available  within your environment.

- Modify blockchain-explorer/app/platform/fabric/connection-profile/first-network.json to add operations service to fabric-samples/first-network connection profile, list all the targeted orderers, and peers you need to get metrics, and other info.

    **Note that this is a non TLS configuration for the operations service

    ```
    "operationsservice": {
    "targets": {
      "orderers": [{
        "name": "orderer.example.com",
        "url": "http://localhost:8443"
      }],
      "peers": [{
          "name": "peer0.org1.example.com",
          "url": "http://localhost:9443"
        },
        {
          "name": "peer1.org1.example.com",
          "url": "http://localhost:9444"
        },
        {
          "name": "peer0.org2.example.com",
          "url": "http://localhost:9445"
        }, {
          "name": "peer1.org2.example.com",
          "url": "http://localhost:9446"
        }
      ]
    }
  }
  ```


