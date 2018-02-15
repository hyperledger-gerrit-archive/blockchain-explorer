import { handleActions } from 'redux-actions'
import { Record } from 'immutable'
import * as actionTypes from '../actions/action-types'

const InitialState = new Record({
    loaded: false,
    blockList: [],
    errors: {},

})

const blockList = handleActions({
    [actionTypes.BLOCK_LIST_POST]: (state = InitialState(), action) => state
        .set('blockList', action.payload)
        .set('loaded', true)
        .set('errors', action.error)

}, new InitialState());


export default blockList
