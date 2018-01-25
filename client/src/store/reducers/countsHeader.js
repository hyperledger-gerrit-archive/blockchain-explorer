import { handleActions } from 'redux-actions'
import { Record } from 'immutable'
//import { concat } from 'lodash'
import * as actionTypes from '../actions/action-types'

const InitialState = new Record({
    fetching: false,
    loaded: false,
    headCounts: {},
    errors: {}


})

const countsHeader = handleActions({
    [actionTypes.COUNT_HEADER]: (state, action) => state
        .set('loaded', true)
        .set('countsheader', fetchHeadCounts(state, action.payload)),
}, new InitialState())

const fetchHeadCounts = (state, payload) => {
    //TODO proxy is not working in dev mode, use for now hardcoded url
    fetch('/api/status/get', /*{'mode': 'no-cors'}*/)
        .then(response => {
            console.log(response.json);
            return response.json;
        })
        .then(data => {
            console.log("counters:", data);
            state.set('headCounts', data);
        });
}


export default countsHeader