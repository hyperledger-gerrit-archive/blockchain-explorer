import { createAction } from 'redux-actions'
import * as actionTypes from '../action-types'
import { post } from '../../../services/request.js';
export const getChannelList = () => dispatch => {
    post('/api/channels')
        .then(resp => {
            dispatch(createAction(actionTypes.CHANNEL_LIST)(resp))
        }).catch((error) => {
            console.error(error);
        })
}

