/*
 Copyright ONECHAIN 2017 All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
var helper = require('../helper.js')
var logger = helper.getLogger('channeleventhublistener');
var fabricClientProxy = require('../FabricClientProxy.js')
var config = require('../../config.json')
var co = require('co')
var blockScanner = require('../service/blockscanner.js')
var networkConfig = config["network-config"];
var org = Object.keys(networkConfig)[0];

function syncChannelEventHubBlock() {
	var channel_event_hub = fabricClientProxy.getChannelEventHub(org);
	console.log("syncEvent-block--" + channel_event_hub)
	var client = fabricClientProxy.getClientForOrg(org)
	channel_event_hub.connect(true);

	channel_event_hub.registerBlockEvent(
		(block) => {
			console.log('Successfully received the block event' + block);
			if (block.data != undefined) {
				//full block	
				co(blockScanner.saveBlockRange, block).then(() => {
					console.log("success block in Event")
				}).catch(err => {
					console.log(err.stack);
					logger.error(err)
				})
			} else {
				//filtered block
				console.log('The block number' + block.number);
				console.log('The filtered_tx' + block.filtered_tx);
				console.log('The block event channel_id' + block.channel_id);
			}
		},
		(error) => {
			console.log('Failed to receive the block event ::' + error);
		}
	);
}
exports.syncChannelEventHubBlock = syncChannelEventHubBlock
