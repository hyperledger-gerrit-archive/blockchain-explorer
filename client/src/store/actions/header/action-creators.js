import { createAction } from 'redux-actions';
import * as actionTypes from '../action-types';
import { post } from '../../../services/request.js';

export const getHeaderCount = () => dispatch => {
    post('/api/status/get')
        .then(resp => {
            dispatch(createAction(actionTypes.COUNT_HEADER_POST)(resp))
        }).catch((error) => {
            console.error(error);
        })
}