//import React, { Component } from 'react';
import config from '../config';
//import nodeSDK from './nodeSDK'

var apiName = config.get('api');
//import exportedAPI from './${apiName}';



//const exportedAPI = apiName==="web3" ? web3 : nodeSDK

//export default exportedAPI



export default {
    getBlockByNumber(blockNumber) {
         if (apiName === "nodeSDK") {
              console.log("nodeSDK");
         } else {
             console.log("Could not find api");
         }
       // exportedAPI.getBlockByNumber(blockNumber);
    }
}