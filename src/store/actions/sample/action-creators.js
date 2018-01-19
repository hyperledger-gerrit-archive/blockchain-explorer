import { createAction } from 'redux-actions'
import * as actionTypes from './action-types'

export const getName = () => dispatch => {
    dispatch(createAction(actionTypes.NAME_GET)('Team'))
}
