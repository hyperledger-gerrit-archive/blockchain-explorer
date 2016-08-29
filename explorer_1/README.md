#Hyperledger Explorer
This is the initial release of the Hyperledger explorer which provides a User Interface to explore and examine the current state of the Hyperledger blockchain in a convenient and easy to use manner. Similar to bitcoin explorers or crypto-currency explorers, information such as transaction information, network activity, recent blocks, visuals and search etc. are available that allows for information to be quickly found.

The explorer relies on the current gRPC and REST APIs that are available. To run the explorer make sure that at least one validating peer is running.
>  cd $GOPATH/github.com/hyperledger/fabric/peer

> peer node start

Make sure node is installed

```
npm install npm -g
```

From explorer folder,

```
HTTP_PORT=9090 HYP_REST_ENDPOINT=http://127.0.0.1:7050 node exp-server.js
```

9090 is default http port the http server listens for requests specified by environment variable 9090. http://127.0.0.1:7050 is the default REST end point for hyperledger REST requests. The REST requests currently used are /chain, /network/peers and /chain/blocks/:blockNum.
