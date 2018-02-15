import { createAction } from 'redux-actions'
import * as actionTypes from '../action-types'
import { post } from '../../../services/request.js';
export const getBlockList = () => dispatch => {
    post('/peerlist')
        .then(resp => {
            dispatch(createAction(actionTypes.PEER_LIST_POST)(resp))
        }).catch((error) => {
            console.error(error);
        })
}

