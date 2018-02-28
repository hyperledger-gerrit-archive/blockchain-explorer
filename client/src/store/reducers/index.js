import { combineReducers } from 'redux'
import peerList from './peerList.js'
import channelList from './channelList.js'
import blockList  from './blockList.js'
import transactionList  from './transactionList'
import countHeader from './countHeader.js'
import channel from './channel';
import block from './block';
import transaction from './transaction';
export default combineReducers({
    peerList,
    channelList,
    countHeader,
    blockList,
    channel,
    transactionList,
    block,
    transaction
})