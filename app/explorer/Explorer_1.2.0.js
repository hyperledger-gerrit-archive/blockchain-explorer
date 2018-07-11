/**
 *    SPDX-License-Identifier: Apache-2.0
 */
var express = require("express");
var bodyParser = require("body-parser");
var PlatformBuilder = require("../platform/PlatformBuilder_1.2.0");
var explorerconfig = require("./explorerconfig.json");
var PersistanceFactory = require("../persistence/PersistanceFactory_1.2.0");

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../../swagger.json');

const PERSISTANCE = 'persistance';
const PLATFORMS = 'platforms';


class Explorer {
    constructor() {
        this.app = express();
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
        this.persistance = {};
        this.platforms = [];
    }

    getApp() {
        return this.app;
    }

    async initialize(broadcaster) {

        console.log('i am here');

        try {
            this.persistance = await PersistanceFactory.create(explorerconfig[PERSISTANCE]);
            for (let pltfrm of explorerconfig[PLATFORMS]) {
                let platform = await PlatformBuilder.build(this.app, pltfrm, this.persistance, broadcaster);
                this.platforms.push(platform);
            }
        }catch(e){
            console.log(e);
            this.close();
            process.exit(1);
        }
    }

    close() {
        this.persistance.closeconnection();
        for (let platform of this.platforms) {
            platform.distroy();
        }
    }
}

module.exports = Explorer;