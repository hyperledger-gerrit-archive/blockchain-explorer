/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { connect } from 'react-redux';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import BlocksView from './View/BlocksView';
import NetworkView from './View/NetworkView';
import TransactionsView from './View/TransactionsView';
import ChaincodeView from './View/ChaincodeView';
import DashboardView from './View/DashboardView';
import ChannelsView from './View/ChannelsView';
import {
  getBlockList,
  getChaincodeList,
  getChannelList,
  getChannel,
  getChannels,
  getDashStats,
  getNotification,
  getPeerList,
  getTransaction,
  getTransactionList,
  getTxByOrg,
  getPeerStatus
<<<<<<< HEAD   (4c27ce BE-359 Merge and Connect)
} from '../store/selectors/selectors';

import chartsOperations from '../state/redux/charts/operations'
import tablesOperations from '../state/redux/tables/operations'

const {
  blockPerHour,
  blockPerMin,
  transactionPerHour,
  transactionPerMin,
  transactionByOrg,
  notification,
  dashStats,
  channel,
  channelList,
  changeChannel,
  peerStatus
} = chartsOperations

const {
  blockList,
  chaincodeList,
  channels,
  peerList,
  transaction,
  transactionList
} = tablesOperations

=======
} from "../store/selectors/selectors";
import { blockList } from "../store/actions/block/action-creators";
import { chaincodes } from "../store/actions/chaincodes/action-creators";
import { countHeader } from "../store/actions/header/action-creators";
import { channelsData } from "../store/actions/channels/action-creators";
import { latestBlock } from "../store/actions/latestBlock/action-creators";
import { transactionInfo } from "../store/actions/transaction/action-creators";
import { transactionList } from "../store/actions/transactions/action-creators";
import { txByOrg } from "../store/actions/charts/action-creators";
import { removeTransactionInfo } from "../store/actions/removeTransactionInfo/action-creators";
>>>>>>> BRANCH (807842 BE-355 Added Dark theme for modals)

export const Main = (props) => {
  const blocksViewProps = {
    blockList: props.blockList,
    channel: props.channel,
    transaction: props.transaction,
<<<<<<< HEAD   (4c27ce BE-359 Merge and Connect)
    getTransaction: props.getTransaction
  }
=======
    getTransactionInfo: props.getTransactionInfo,
    removeTransactionInfo: props.removeTransactionInfo
  };
>>>>>>> BRANCH (807842 BE-355 Added Dark theme for modals)

  const chaincodeViewProps = {
    channel: props.channel,
    chaincodeList: props.chaincodeList
  }

  const channelsViewProps = {
    channels: props.channels,
    getChannels: props.getChannels
  }

  const dashboardViewProps = {
    dashStats: props.dashStats,
    channel: props.channel,
    transactionByOrg: props.transactionByOrg,
    blockList: props.blockList,
    peerStatus : props.peerStatus,
    getChannels: props.getChannels
  }

  const networkViewProps = {
    peerList: props.peerList
  }

  const transactionsViewProps = {
    channel: props.channel,
    transaction: props.transaction,
    transactionList: props.transactionList,
<<<<<<< HEAD   (4c27ce BE-359 Merge and Connect)
    getTransaction: props.getTransaction,
=======
    getTransactionInfo: props.getTransactionInfo,
    removeTransactionInfo: props.removeTransactionInfo,
>>>>>>> BRANCH (807842 BE-355 Added Dark theme for modals)
    getTransactionList: props.getTransactionList
  }

  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path="/" render={() => <DashboardView {...dashboardViewProps} />} />
          <Route path="/blocks" render={() => <BlocksView {...blocksViewProps} />} />
          <Route path="/chaincodes" render={() => <ChaincodeView {...chaincodeViewProps} />} />
          <Route path="/channels" render={() => <ChannelsView {...channelsViewProps} />} />
          <Route path="/network" render={() => <NetworkView  {...networkViewProps} />} />
          <Route path="/transactions" render={() => <TransactionsView {...transactionsViewProps} />} />
        </Switch>
      </div>
    </Router>
  );
};

<<<<<<< HEAD   (4c27ce BE-359 Merge and Connect)
export default connect((state) => ({
  blockList: getBlockList(state),
  chaincodeList: getChaincodeList(state),
  channel: getChannel(state),
  channelList: getChannelList(state),
  channels: getChannels(state),
  dashStats: getDashStats(state),
  notification: getNotification(state),
  peerList: getPeerList(state),
  peerStatus: getPeerStatus(state),
  transaction: getTransaction(state),
  transactionList: getTransactionList(state),
  transactionByOrg: getTxByOrg(state)
}), {
=======
export default connect(
  state => ({
    block: getBlock(state),
    blockList: getBlockList(state),
    chaincodes: getChaincodes(state),
    channel: getChannel(state),
    channelList: getChannelList(state),
    countHeader: getCountHeader(state),
    notification: getNotification(state),
    peerList: getPeerList(state),
    peerStatus: getPeerStatus(state),
    transaction: getTransaction(state),
    transactionList: getTransactionList(state),
    channels: getChannels(state),
    txByOrg: getTxByOrg(state),
    removeTransactionInfo: removeTransactionInfo(state)
  }),
  {
>>>>>>> BRANCH (807842 BE-355 Added Dark theme for modals)
    getBlockList: blockList,
    getChaincodeList: chaincodeList,
    getDashStats: dashStats,
    // getLatestBlock: latestBlock,
    getTransaction: transaction,
    getTransactionList: transactionList,
<<<<<<< HEAD   (4c27ce BE-359 Merge and Connect)
    getChannels: channels,
    getTransactionByOrg: transactionByOrg,
    getPeerStatus: peerStatus
  })(Main);
=======
    getChannels: channelsData,
    removeTransactionInfo: removeTransactionInfo,
    getTxByOrg: txByOrg
  }
)(Main);
>>>>>>> BRANCH (807842 BE-355 Added Dark theme for modals)
