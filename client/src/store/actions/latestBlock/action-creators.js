import { createAction } from 'redux-actions'
import * as actionTypes from '../action-types'
import { post } from '../../../services/request.js';
export const getLatestBlock = () => dispatch => {
    post('/api/status/get')
        .then(resp => {
            dispatch(createAction(actionTypes.LATEST_BLOCK)(resp.latestBlock))
        }).catch((error) => {
            console.error(error);
        })
}

