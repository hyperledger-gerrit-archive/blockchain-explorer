import { createAction } from 'redux-actions'
import * as actionTypes from '../action-types'
//import peerList from '../../reducers/peerList'
import countsHeader from '../../reducers/countsHeader'

/*
export const getPeerList = () => dispatch => {
    dispatch(createAction(actionTypes.PEER_LIST)(peerList.getPeerList()));
}
*/
const getCountHeader = () => dispatch => {
    dispatch(createAction(actionTypes.COUNT_HEADER)(countsHeader.fetchHeadCounts()));
}

export default getCountHeader 








  