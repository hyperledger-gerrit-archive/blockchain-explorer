# IBM Blockchain Service Broker - User UI

This is the code for the service broker's user UI aka `bluemix-passenger` or `yeti`.

Contains:
- user dashboard ui
- user sso or basic auth
- open/public apis
- sesssion enforced apis

***

## Stand Alone Mode - Instructions (aka YETI)

```
npm install gulp -g 
npm install
gulp yeti
```

1. Open browser to http://localhost:3003/setup
	1. Click "Walk Me Through Setup"
	1. Fill out the details for your first peer. This step initialize some fields for us.
		1. Click "Next"
	1. Select whether or not you have a CA. You may edit this at a later time.
		1. Click "Next"
	1. Inspect that the information is correct for your CA and each Peer by clicking the tabs.
		1. If you are missing a peer create a new one with the plus button tab.
		1. Click "Next"
	1. Protect this UI by adding basic authentication. Leave it blank if you want it open.
		1. Click "Next"
	1. Verify if the JSON dump looks good.
		1. Make any last minute alterations now.
		1. Click "Do it"
1. You will be redirected to your dashboard
	1. Welcome to your monitor UI!
1. You can get back to setup via http://localhost:3003/setup

***

## IBM Blockchain Service Mode - Instructions (aka IBM-BCS)
this requires the creation of /env/local.json

```
npm install gulp -g 
npm install
gulp local
```

Open browser to locahost:3003

***

# Yeti vs IBM-BCS Mode

| Feature                        | YETI|IBM-BCS|
|--------------------------------|:---:|------:|
| Network tab                    |*modified*|  x  |
| --- reset network button       |  -  |  x  |
| --- start/stop peer buttons    |  -  |  x  |
| --- peer dicosvery count       |  x  |  x  |
| --- peer block height          |  x  |  x  |
| --- peer status                |  x  |  x  |
| --- membership services status |  -  |  x  |
| --- grpc/http copy/paste routes|  x  |  x  |
| --- chaincode table            |  -  |  x  |
| --- chaincode logs             |  -  |  x  |
| Blockchain tab                 |  x  |  x  |
| Demo cc tab                    |  x  |  x  |
| Http apis tab                  |*modified*|  x  |
| --- list of enroll IDs         |  -  |  x  |
| Logs tab                       |  -  |  x  |
| Service Status tab             |  -  |  x  |
| Support tab                    |*modified*|  x  |
| --- support github link        |  -  |  x  |
| Multilingual*                  |  x  |  x  |
| Setup Page                     |  x  |  -  |
