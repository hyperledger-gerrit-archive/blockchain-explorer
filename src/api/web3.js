//import React, { Component } from 'react';
import Web3 from 'web3';
//const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

var web3 = isAvailable();

 function isAvailable() {
   console.log("isAvailable checking");
     if (typeof web3 !== 'undefined') {
         web3 = new Web3(web3.currentProvider);
     } else {
         // set the provider you want from Web3.providers
         web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
     }
     return web3;
 };


export default {
  getBlockByNumber(blockNumber) {
    console.log("hello jeeva");
  web3.eth.getBlock(blockNumber, function(error, result){
    if(!error)
        console.log(result)
    else
        console.error(error);
  })}
}
  