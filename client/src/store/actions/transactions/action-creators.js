import { createAction } from 'redux-actions'
import * as actionTypes from '../action-types'
import { post } from '../../../services/request.js';
export const geTransactionList = () => dispatch => {
    post('/connecttosocket')
        .then(resp => {
            dispatch(createAction(actionTypes.TX_LIST)(resp))
        }).catch((error) => {
            console.error(error);
        })
}

