/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import types from './types';

/* Reducers for Dashboard Charts */
const authReducer = (state = { name: '' }, action) => {
  switch (action.type) {
    case types.LOGIN: {
      return {
        ...state,
        ...action.payload
      };
    }
    case types.LOGOUT: {
      return {
        ...state,
        name: ''
      };
    }
    default: {
      return state;
    }
  }
};

export default authReducer;
