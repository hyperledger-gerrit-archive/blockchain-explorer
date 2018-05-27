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
var EventEmitter = require('events').EventEmitter;

var blockMetrics = require('../metrics/metrics').blockMetrics
var txMetrics = require('../metrics/metrics').txMetrics

class  BlockListener extends EventEmitter{

        constructor(blockScanner)
        {
            super();
            this.blockScanner = blockScanner;

            this.on('createBlock', function (block) {
                blockMetrics.push(1)
                txMetrics.push(block.data.data.length)

            });

            this.on('syncChaincodes', function () {
                setTimeout(function () {
                    blockScanner.syncChaincodes()
                }, 1000)
            });

            this.on('syncPeerlist', function () {
                setTimeout(function () {
                    blockScanner.syncPeerlist()
                }, 2000)
            });

            this.on('syncChannels', function () {
                setTimeout(function () {
                    blockScanner.syncChannels()
                }, 2000)
            });

            this.on('syncBlock', function () {
                setTimeout(function () {
                    blockScanner.syncBlock()
                }, 2000)
            });

            this.on('syncChannelEventHubBlock', function () {
                setTimeout(function () {
                    blockScanner.syncChannelEventHubBlock();
                }, 2000)
            });
        }
}

module.exports = BlockListener;