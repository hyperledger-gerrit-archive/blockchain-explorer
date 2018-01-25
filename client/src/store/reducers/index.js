import { combineReducers } from 'redux'
import peerList from './peerList.js'
import channelList from './channelList.js'
import countsHeader from './countsHeader.js'

export default combineReducers({
    peerList,
    channelList,
    countsHeader
})
