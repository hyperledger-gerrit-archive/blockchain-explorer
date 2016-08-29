//"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'HyperlegerExplorer';

// Port where we'll run the websocket server
var webSocketsServerPort = process.env.HTTP_PORT || 9090;

var express = require('express');
var app = express();
app.use(express.static(__dirname+'/resources'));
app.use(express.static(__dirname+'/resources/bower_components/angular'));
app.use(express.static(__dirname+'/resources/bower_components/angular-animate'));
app.use(express.static(__dirname+'/resources'));
app.use(express.static(__dirname+'/node_modules/socket.io/node_modules/socket.io-client'));

var peerIntf = require('hyperledgerpeerintf');



//var dots = require("dot").process({ path: "./views"});
require("dot").process({
	templateSettings : {
	  evaluate:    /\(\(([\s\S]+?)\)\)/g,
	  interpolate: /\(\(=([\s\S]+?)\)\)/g,
	  encode:      /\(\(!([\s\S]+?)\)\)/g,
	  use:         /\(\(#([\s\S]+?)\)\)/g,
	  define:      /\(\(##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\)\)/g,
	  conditional: /\(\(\?(\?)?\s*([\s\S]*?)\s*\)\)/g,
	  iterate:     /\(\(~\s*(?:\)\)|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\)\))/g,
	  varname: 'it',
	  strip: true,
	  append: true,
	  selfcontained: false
	}
	,global: "_page.render"
	, destination: __dirname + "/render/"
	, path: (__dirname + "/templates")
});

var render = require('./render');

//Hyperledger UI
var ledgerData = { "chain" : { "height" : 0} , "peers" : {} , "blocks" : []};
app.get("/", function(req, res) {
    
	try { 
		var ledgerDataStr = JSON.stringify(ledgerData);
		res.send(render.HyperlegerExplorer({'ledgerData' : ledgerDataStr }));
	} catch(e) {
		console.log(" Error retrieving initial hyperledger info "+e);
		return res.send(render.HyperlegerExplorer(0));
	}
	
	
});

var locked = false;
var getLedgerInfo = function(callBk) {
	if(locked) {
		console.log('Waiting to retrieve ledger data ...');
		setTimeout(function(){ getLedgerInfo(callBk);}, 1000);
		return;
	}
	try {
		var currHeight = ledgerData.chain.height;
		peerIntf.chain(
			function(obj) {
				ledgerData.chain = obj;
				peerIntf.peers(
					function(obj) {
						ledgerData.peers = obj;
						console.log('height : '+ledgerData.chain.height);
						var blockFunc = function(obj) {
							ledgerData.blocks.push(obj);
							currHeight = ledgerData.blocks.length;
							console.log(currHeight);
							if(currHeight == ledgerData.chain.height) {
								callBk(ledgerData);
								locked = false;
							} else
								peerIntf.block((currHeight++),blockFunc);
						}
						if(currHeight != ledgerData.chain.height)
							peerIntf.block(currHeight,blockFunc);
						
					}
				)
			}
		);
	} catch(e) {
		console.log(e);
		locked = false;
		throw e;
	}
}

//initial load
getLedgerInfo( function () {
	try {
		console.log('Ledger data retrieved.');
		//start listener and Web sockets for updates
		var server = require('http').createServer(app);
		var io = require('socket.io')(server);
		setInterval( 
			function() {
				var prevPeers = ledgerData.peers;
				var prevHeight = ledgerData.chain.height;
				var newData = {};
				getLedgerInfo( function() {
					if(JSON.stringify(prevPeers) != JSON.stringify(ledgerData.peers))
						newData.peers = ledgerData.peers;
					if(prevHeight != ledgerData.chain.height) {
						newData.chain = ledgerData.chain;
						newBlocks = new Array();
						for(var i = prevHeight; i < ledgerData.chain.height; i++)
							newBlocks.push(ledgerData.blocks[i]);
						newData.blocks = newBlocks;
					}
					if(newData.peers || newData.blocks)
						io.emit('update',JSON.stringify(newData)); 
				});
			} 
		, 2000);
		server.listen(webSocketsServerPort);
	} catch(e) {
		console.log('Ledger data initialization failed.');
		exit(-1);
	}
});