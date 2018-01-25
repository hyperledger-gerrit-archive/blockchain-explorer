import { handleActions } from 'redux-actions'
import { Record } from 'immutable'
//import { concat } from 'lodash'
import * as actionTypes from '../actions/action-types'

const InitialState = new Record({
    fetching: false,
    loaded: false,
    peerList: [],
    error: {},

})


const peerList = handleActions({
    [actionTypes.PEER_LIST]: (state, action) => state
        .set('loaded', true)
        .set('peerList', action.payload),
}, new InitialState())



export default peerList
