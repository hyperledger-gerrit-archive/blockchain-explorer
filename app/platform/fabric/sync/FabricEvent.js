/*
    SPDX-License-Identifier: Apache-2.0
*/
const helper = require('../../../common/helper');

const logger = helper.getLogger('FabricEvent');

class FabricEvent {
  constructor(client, fabricServices) {
    this.client = client;
    this.fabricServices = fabricServices;
  }

  async initialize() {
    // creating channel event hub
    const channels = this.client.getChannels();
    //console.log('FabricEvent. initialize ', channels);

    for (const [channel_name, channel] of channels.entries()) {
      const eventHub = FabricEvent.channelEventHubs.get(channel_name);

      if (eventHub) {
        logger.debug(
          'initialize() - Channel event hub already exists for [%s]',
          channel_name
        );
        continue;
      }

      this.createChannelEventHub(channel);
      logger.debug(
        'initialize() - Successfully created channel event hub for [%s]',
        channel_name
      );
    }
  }

  createChannelEventHub(channel) {
    // create channel event hub
    const eventHub = channel.newChannelEventHub(this.client.defaultPeer);
    eventHub.registerBlockEvent(
      async block => {
        // skip first block, it is process by peer event hub
        if (!(block.header.number === '0' || block.header.number == 0)) {
          await this.fabricServices.processBlockEvent(this.client, block);
        }
      },
      err => {
        logger.error('Block Event %s', err);
        console.dir(err);
      }
    );
    this.connectChannelEventHub(channel.getName(), eventHub);
    // set channel event hub to map
    FabricEvent.channelEventHubs.set(channel.getName(), eventHub);
  }

  connectChannelEventHub(channel_name, eventHub) {
    const _self = this;
    if (eventHub) {
      eventHub.connect(true);
      setTimeout(
        channel_name => {
          _self.synchChannelBlocks(channel_name);
        },
        5000,
        channel_name
      );
    } else {
      // if channel event hub is not defined then create new channel event hub
      const channel = this.client.hfc_client.getChannel(channel_name);
      this.createChannelEventHub(channel);
      return false;
    }
  }

  isChannelEventHubConnected(channel_name) {
    const eventHub = FabricEvent.channelEventHubs.get(channel_name);
    if (eventHub) {
      return eventHub.isconnected();
    }
    return false;
  }

  disconnectChannelEventHub(channel_name) {
    logger.debug('disconnectChannelEventHub(' + channel_name + ')');

    const eventHub = FabricEvent.channelEventHubs.get(channel_name);
    return eventHub.disconnec();
  }

  disconnectEventHubs() {
    logger.debug('disconnectEventHubs()');

    // disconnect all event hubs
    for (const [
      channel_name,
      eventHub
    ] of FabricEvent.channelEventHubs.entries()) {
      const status = this.isChannelEventHubConnected();
      if (status) {
        this.disconnectChannelEventHub(channel_name);
      }
    }
  }

  // channel event hub used to synch the blocks
  async synchChannelBlocks(channel_name) {
    if (this.isChannelEventHubConnected(channel_name)) {
      const channel = this.client.hfc_client.getChannel(channel_name);
      await this.fabricServices.synchBlocks(this.client, channel);
    }
  }

  // Interval and peer event hub used to synch the blocks
  async synchBlocks() {
    // getting all channels list from client ledger
    const channels = await this.client
      .getHFC_Client()
      .queryChannels(this.client.getDefaultPeer().getName(), true);

    for (const channel of channels.channels) {
      const channel_name = channel.channel_id;
      if (!this.client.getChannels().get(channel_name)) {
        // initialize channel, if it is not exists in the client context
        await this.client.initializeNewChannel(channel_name);
        await this.fabricServices.synchNetworkConfigToDB(this.client);
      }
    }
    for (const channel of channels.channels) {
      const channel_name = channel.channel_id;
      // check channel event is connected
      if (this.isChannelEventHubConnected(channel_name)) {
        // call synch blocks
        const channel = this.client.hfc_client.getChannel(channel_name);
        await this.fabricServices.synchBlocks(this.client, channel);
      } else {
        const eventHub = FabricEvent.channelEventHubs.get(channel_name);
        if (eventHub) {
          // connect channel event hub
          this.connectChannelEventHub(channel_name, eventHub);
        } else {
          const channel = this.client.getChannels().get(channel_name);
          if (channel) {
            // create channel event hub
            this.createChannelEventHub(channel);
          } else {
            // initialize channel, if it is not exists in the client context
            await this.client.initializeNewChannel(this, channel_name);
            await this.fabricServices.synchNetworkConfigToDB(this.client);
          }
        }
      }
    }
  }
}

//static class variable
FabricEvent.channelEventHubs = new Map();

module.exports = FabricEvent;
