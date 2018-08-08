var syncconfig = require('./explorerconfig.json');
var helper = require('./common/helper.js');
var ExplorerError = require('./common/ExplorerError');
var logger = helper.getLogger('Synchronizer');
var SyncBuilder = require('./sync/SyncBuilder')
var PersistenceFactory = require('./persistence/PersistenceFactory');
var ExplorerSender = require('./sync/sender/ExplorerSender');

var explorer_const = require('./common/helper.js').explorer.const;

var syncScanner;

class Synchronizer {
  constructor(args) {
    this.args = args;
    this.persistence;
    this.platform;
  }

  async  initialize() {

    if (!syncconfig[explorer_const.PERSISTENCE]) {
      throw new ExplorerError('Missing persistence type parameter [persistence] in explorerconfig.json');
    }
    if (!syncconfig[syncconfig[explorer_const.PERSISTENCE]]) {
      throw new ExplorerError('Missing database configuration parameter [' + syncconfig[explorer_const.PERSISTENCE] + '] in explorerconfig.json');
    }

    let pltfrm;
    if (syncconfig && syncconfig.sync && syncconfig.sync.platform) {
      pltfrm = syncconfig.sync.platform;
    } else {
      throw new ExplorerError('Platform type is not found in syncconfig or argument');
    }

    if (!this.args || this.args.length == 0) {
      throw new ExplorerError('Missing network_name and client_name , Please run as > sync.js network_name client_name');
    }


    this.persistence = await PersistenceFactory.create(syncconfig[explorer_const.PERSISTENCE], syncconfig[syncconfig[explorer_const.PERSISTENCE]]);

    let sender = new ExplorerSender(syncconfig.sync);
    sender.initialize();

    this.platform = await SyncBuilder.build(pltfrm, this.persistence, sender);

    this.platform.setPersistenceService();

    this.platform.setSynchBlocksTime(syncconfig.sync.synchBlocksTime);

    await this.platform.initialize(this.args);

  }

  close() {
    if (this.persistence) {
      this.persistence.closeconnection();
    }
    if (this.platform) {
      this.platform.destroy();
    }
  }
}

module.exports = Synchronizer;





