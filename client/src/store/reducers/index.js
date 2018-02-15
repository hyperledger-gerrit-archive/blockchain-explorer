import { combineReducers } from 'redux'
import peerList from './peerList.js'
import channelList from './channelList.js'
import countHeader from './countHeader.js'

export default combineReducers({
    peerList,
    channelList,
    countHeader
})
