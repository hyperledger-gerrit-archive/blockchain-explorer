/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import moment from 'moment-timezone';
import actions from './actions';
import { get } from '../../../services/request';

const blockList = channel => dispatch =>
  get(`/api/blockAndTxList/${channel}/0`)
    .then(resp => {
      dispatch(actions.getBlockList(resp));
    })
    .catch(error => {
      console.error(error);
    });

const chaincodeList = channel => dispatch =>
  get(`/api/chaincode/${channel}`)
    .then(resp => {
      dispatch(actions.getChaincodeList(resp));
    })
    .catch(error => {
      console.error(error);
    });

// table channel
const channels = () => dispatch =>
  get('/api/channels/info')
    .then(resp => {
      dispatch(actions.getChannels(resp));
    })
    .catch(error => {
      console.error(error);
    });

const peerList = channel => dispatch =>
  get(`/api/peers/${channel}`)
    .then(resp => {
      dispatch(actions.getPeerList(resp));
    })
    .catch(error => {
      console.error(error);
    });

const transaction = (channel, transactionId) => dispatch =>
  get(`/api/transaction/${channel}/${transactionId}`)
    .then(resp => {
      dispatch(actions.getTransaction(resp));
    })
    .catch(error => {
      console.error(error);
    });

const transactionList = channel => dispatch =>
  get(`/api/txList/${channel}/0/0/`)
    .then(resp => {
      dispatch(actions.getTransactionList(resp));
    })
    .catch(error => {
      console.error(error);
    });

export default {
  blockList,
  chaincodeList,
  channels,
  peerList,
  transaction,
  transactionList
};
