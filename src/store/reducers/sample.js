import { handleActions } from 'redux-actions'
import { Record } from 'immutable'

import * as actionTypes from '../actions/sample/action-types'

const InitialState = new Record({
    name: ''
})

const sampleDetails = handleActions({
    [actionTypes.NAME_GET]: (state, action) =>
        state
            .set('name', action.payload)

}, new InitialState())

export default sampleDetails