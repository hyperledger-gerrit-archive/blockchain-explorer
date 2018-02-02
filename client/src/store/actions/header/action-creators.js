import { createAction } from 'redux-actions';
import * as actionTypes from '../action-types';
import { get } from '../../../services/request.js';

export const getHeaderCount = () => dispatch => {
    get('/api/status/get')
        .then(resp => {
            dispatch(createAction(actionTypes.COUNT_HEADER_GET)(resp))
        }).catch((error) => {
            console.error(error);
        })
}