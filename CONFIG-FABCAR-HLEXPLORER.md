## Configure to Hyperledger Explorer

Before Configure the Explorer blockchain-explorer/app/platform/fabric/config.json

- Modify config.json to define you fabric network connection profile
	``` {
         "network-configs": {
            "fabcar": {
                "name": "fabcar",
                "profile": "./connection-profile/fabcar.json",
                "tlsEnable": true,
                "adminUser": "admin",
                "adminPassword": "adminpw",
                "enableAuthentication": false,
         }
       },
        "license": "Apache-2.0"
     }```

    - "fabcar" is the name of your connection profile, can be changed to any name
	- "name" is a name you want to give to your fabric network, you can change only value of the key "name"
	- "profile" is the location of your connection profile, you can change only value of the key "profile"
    - "enableAuthentication" option true|false will skipe the login page

- Modify connection profile
	- Change "fabric-path" to your fabric network path in file /blockchain-explorer/app/platform/fabric/connection-profile/fabcar.json, or create another file and specify the path to it, as long as it keeps same format.
	- "adminUser" is the the admin user of the network, in this case is fabric CA or an identity user
    - "adminPassword" is the password for the admin user.
	- "enableAuthentication" true|false, is a flag to enable authentication using a login page, false will skip authentication

## Run Hyperledger Explorer

**Code : cd blockchain-explorer/**

**./start.sh (It will have the backend up)**

Launch the Blockchain explorer URL