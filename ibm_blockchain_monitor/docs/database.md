Following is the database structure that will be stored in `networks` database.
It includes network details, peer details & instance details that correspond to this network.

We will have couchdb views to read out *network*, *peer* or *instance* from the document.

```
{
  "_id": "<network_id>",
  "peers": {
    "<network_id>_vp1": {
      "url": "169.1.2.3:32974",
      "companion": {
        "ca": "<ca_cert>",
        "cert": "<cert>",
        "key": "<key>"
      },
      "discovery_host": "169.1.2.3",
      "discovery_port": "32974",
      "api_host": "169.1.2.3",
      "api_port": "32975",
      "type": "peer",
      "network_id": "<network_id>",
      "security": {
        "enabled": true,
        "enrollID": "peer1",
        "enrollSecret": "d132355a94",
        "eca_paddr": "169.1.2.4:32972",
        "tca_paddr": "169.1.2.4:32972",
        "tlsca_paddr": "169.1.2.4:32972"
      }
    },
    "<network_id>_vp2": {
      "url": "169.1.2.5:32976",
      "companion": {
        "ca": "<ca_cert>",
        "cert": "<cert>",
        "key": "<key>"
      },
      "discovery_host": "169.1.2.5",
      "discovery_port": "32976",
      "api_host": "169.1.2.5",
      "api_port": "32977",
      "type": "peer",
      "network_id": "<network_id>",
      "security": {
        "enabled": true,
        "enrollID": "peer2",
        "enrollSecret": "f46a94d441",
        "eca_paddr": "169.1.2.4:32972",
        "tca_paddr": "169.1.2.4:32972",
        "tlsca_paddr": "169.1.2.4:32972"
      }
    }
  },
  "ca": {
    "<network_id>_ca": {
      "url": "169.1.2.4:32973",
      "discovery_host": "169.1.2.4",
      "discovery_port": "32973",
      "api_host": "169.1.2.4",
      "api_port": "32972",
      "type": "ca",
      "network_id": "<network_id>",
      "users": {
        "peer1": "d132355a94",
        "peer2": "f46a94d441",
        "user_type0_dfd62346c0": "8ac1dbb1fb",
        "user_type0_8d733ca99f": "9c85d3f391",
        "user_type1_4c4ef91640": "bbee6902e6",
        "user_type1_c06bfa2c80": "8c393be050",
        "user_type2_7ae92d0c8d": "00c4e0d7e6",
        "user_type2_69b8968f96": "2eb0250b23",
        "user_type3_e685fef7c2": "3b4fe45033",
        "user_type3_c3b1076ba0": "7dc481aeeb",
        "user_type4_bb3688dcdc": "f6122c99cf",
        "user_type4_17eb8a5ce9": "5071ff42b7"
      }
    }
  },
  "instance": {
	"service_id": "ibm-blockchain-4-dev",			//bluemix service id
	"plan_id": "ibm-blockchain-plan-4-dev",			//bluemix instance's plan id
	"organization_guid": "107737b5-408e-4875-b8ab-4b1e98bcfb35",	//bluemix org where instance lives
	"space_guid": "b2af9a58-2d1a-422b-96f1-096c026d4234",			//bluemix space where instance lives
	    "instance_id": "554eaefb-d44e-44cc-b961-a135b57147cc",		//blumix id of instance

	"bindings": [
		{
		"service_id": "ibm-blockchain-4-dev",					//bluemix service id
		"plan_id": "ibm-blockchain-plan-4-dev",					//bluemix instanc's plan id
		"id": "554eaefb-d44e-44cc-b961-a135b57147cc",			//bluemix id of instance
		"creds": {												//credentials for bluemix vcap
			"credentials": {
			"peers": [
				{
					"discovery_host": "169.1.2.3",				//grpc hostname/ip
					"discovery_port": "32974",					//grpc port
					"api_host": "169.1.2.3",					//http api hostname/ip
					"api_port": "32975",						//http api port
					"type": "peer",								
					"network_id": "<network_id>",				//network id
					"id": "<network_id>_vp1",					//peer id
					"api_url": "http://169.1.2.3:32975"			//http api url (includes http or https)
				},
				{
					"discovery_host": "169.1.2.5",
					"discovery_port": "32976",
					"api_host": "169.1.2.5",
					"api_port": "32977",
					"type": "peer",
					"network_id": "e376a3a5-1c24-4710-b2b9-3a7924d1d4ca",
					"id": "e376a3a5-1c24-4710-b2b9-3a7924d1d4ca_vp2",
					"api_url": "http://169.1.2.5:32977"
				}
			],
			"users": [										//enrollIDs
				{
					"username": "user_type0_4e2f0b15b9",
					"secret": "d941b50c0c"
				},
				{
					"username": "user_type0_0fec7c68ae",
					"secret": "6ba72cbde9"
				},
				{
					"username": "user_type1_97ec396abe",
					"secret": "1516bd2f19"
				},
				{
					"username": "user_type1_69401f370a",
					"secret": "c3e506bb75"
				},
				{
					"username": "user_type2_286e7b182e",
					"secret": "0bec41d86a"
				},
				{
					"username": "user_type2_f8aee82ddc",
					"secret": "412c9492ae"
				},
				{
					"username": "user_type3_12dfbbc111",
					"secret": "fea6cdf1a4"
				},
				{
					"username": "user_type3_02a0b6bf95",
					"secret": "46b0118bf5"
				},
				{
					"username": "user_type4_17c069475c",
					"secret": "9b0b59210f"
				},
				{
					"username": "user_type4_0ad9acdc7e",
					"secret": "bfcba6117f"
				}
			]
			}
		}
		}
	],
	"enabled": true,			//no idea
	"account": {				//bluemix passport obj of logged in user when created
		"user": {
		"name": {
			"name": "MIHIR SHAH"
		},
		"email": "mrshah@us.ibm.com",
		"provider": "bluemix",
		"_raw": "{\"user_id\":\"b5d4dfc9-b4bf-4673-a096-0ddc8c0f0bd3\",\"user_name\":\"mrshah@us.ibm.com\",\"given_name\":\"MIHIR\",\"family_name\":\"SHAH\",\"name\":\"MIHIR SHAH\",\"email\":\"mrshah@us.ibm.com\"}",
		"_json": {
			"user_id": "b5d4dfc9-b4bf-4673-a096-0ddc8c0f0bd3",
			"user_name": "mrshah@us.ibm.com",
			"given_name": "MIHIR",
			"family_name": "SHAH",
			"name": "MIHIR SHAH",
			"email": "mrshah@us.ibm.com"
		}
		}
	}	  
  }
  "type": "network",		//identify doc as a network document
  "available": true,		//legacy, do not use 4/1/2016
  "reset_history": {		//object is only present iff network was once reset
	"started_timestamp": 1466440975728	//server timestamp when reset was initiated
	"deleted_timestamp": 1466440975728	//server timestamp when reset successfully deleted old network for a reset. is -1 if error
    "finished_timestamp": 1466440975728	//server timesamp when reset was successfully finished. is -1 if error
  },
  "reset":{					//object is only present iff network is currently being reset
	  "steps": ["deleteNetwork", "createNetwork"]	//steps remaining to peform reset
  }
}
```