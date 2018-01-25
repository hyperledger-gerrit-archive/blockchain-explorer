import { handleActions } from 'redux-actions'
import { Record } from 'immutable'
//import { concat } from 'lodash'
import * as actionTypes from '../actions/action-types'

const InitialState = new Record({
    fetching: false,
    loaded: false,
    channelList: [],
    error: {},

})


const channelList = handleActions({
    [actionTypes.CHANNEL_LIST]: (state, action) => state
        .set('loaded', true)
        .set('channelList', action.payload),
}, new InitialState())

export default channelList
