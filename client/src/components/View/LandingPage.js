/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import Slider from 'react-slick';
import { connect } from 'react-redux';
import Logo from '../../static/images/Explorer_Logo.svg';
import { getDashStats, getChannel, getChannelList } from '../../store/selectors/selectors';
import chartsOperations from '../../state/redux/charts/operations'
import tablesOperations from '../../state/redux/tables/operations'
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
  transactionInfo,
  transactionList
} = tablesOperations



export class LandingPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settings: {
        dots: false,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 2000,
        pauseOnHover: false,
        accessibility: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1
      },
      logoStyle: {
        width: '520px',
        height: '100px'
      }
    }
  }

 async componentDidMount() {
  console.log("###load data start:");
  await this.props.getChannel();
  console.log(this.props.channel);
  var currentChannel = this.props.channel.currentChannel;
  await Promise.all([
    this.props.getBlockList(currentChannel),
    this.props.getBlocksPerHour(currentChannel),
    this.props.getBlocksPerHour(currentChannel),
    this.props.getChaincodeList(currentChannel),
    this.props.getChannelList(currentChannel),
    this.props.getChannels(),
    this.props.getDashStats(currentChannel),
    this.props.getPeerList(currentChannel),
    this.props.getPeerStatus(currentChannel),
    this.props.getTransactionByOrg(currentChannel),
    this.props.getTransactionList(currentChannel),
    this.props.getTransactionPerHour(currentChannel),
    this.props.getTransactionPerMin(currentChannel)

  ])
  this.props.updateLoadStatus();
  // this.setState({loading: false});
  console.log("load data end %%%%:");
   console.log('landing ####')
  /*  await this.props.getChannels()
    // if (nextProps.channel.currentChannel !== this.props.channel.currentChannel) {
   await this.props.getBlockList(this.props.channel.currentChannel, 0);
   await this.props.getBlocksPerHour(this.props.channel.currentChannel);
   await this.props.getBlocksPerMin(this.props.channel.currentChannel);
   await this.props.getChaincodeList(this.props.channel.currentChannel);
   await this.props.getChannels();
   await this.props.getChannelList();
   await this.props.getDashStats(this.props.channel.currentChannel);
   await this.props.getPeerList(this.props.channel.currentChannel);
   await this.props.getPeerStatus(this.props.channel.currentChannel);
   await this.props.getTransactionList(this.props.channel.currentChannel, 0);
   await this.props.getTransactionByOrg(this.props.channel.currentChannel);
   await this.props.getTransactionPerHour(this.props.channel.currentChannel);
   await this.props.getTransactionPerMin(this.props.channel.currentChannel);
 */
    // console.log(this.props.channelList);
    // }
  }

  componentWillReceiveProps(nextProps) {

  }

 render() {
    return (
      <div className="landingBackground">
        <div className="landing" >
          <img src={Logo} style={this.state.logoStyle} alt="Hyperledger Logo" />
          <Slider {...this.state.settings}>
            <div><h3>ACCESSING THE NETWORK</h3></div>
            <div><h3>CONNECTING TO CHANNEL</h3></div>
            <div><h3>LOADING BLOCKS</h3></div>
          </Slider>
        </div>
      </div>
    );
  }
}

export default connect((state) => ({
  channel: getChannel(state),
  channelList: getChannelList(state),
  dashStats: getDashStats(state)
}), {
    getBlockList: blockList,
    getBlocksPerHour: blockPerHour,
    getBlocksPerMin: blockPerMin,
    getChaincodeList: chaincodeList,
    getChannelList: channelList,
    getChannel: channel,
    getChannels: channels,
    getDashStats: dashStats,
    getPeerList: peerList,
    getPeerStatus: peerStatus,
    getTransactionByOrg: transactionByOrg,
    getTransactionList: transactionList,
    getTransactionPerHour: transactionPerHour,
    getTransactionPerMin: transactionPerMin,
  })(LandingPage)
