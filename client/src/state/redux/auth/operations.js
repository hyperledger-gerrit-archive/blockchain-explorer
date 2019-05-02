/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { post, get } from '../../../services/request';

import {
  login as loginAction,
  logout as logoutAction,
  network as networkAction,
  register as registerAction,
  error as errorAction
} from './actions';

import actions from '../charts/actions';

import Auth from '../../Auth';

const login = ({ user, password }, network) => dispatch =>
  post('/auth/login', { user, password, network })
    .then(resp => {
      Auth.authenticateUser(resp.token);
      dispatch(errorAction(null));
      dispatch(loginAction({ user, ...resp }));
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.error(error);
      dispatch(errorAction(error));
    });

const logout = () => dispatch =>
  post('/auth/logout', {})
    .then(() => {
      Auth.deauthenticateUser();
      dispatch(logoutAction());
    })
    .catch(error => {
      // TODO: keeping till api service implemented
      // eslint-disable-next-line no-console
      console.error(error);
      dispatch(logoutAction());
    });

const network = () => dispatch =>
  get('/auth/networklist', {})
    .then(({ networkList }) => {
      const networks = networkList.map(network => network[0]);
      dispatch(networkAction({ networks }));
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.error(error);
      dispatch(actions.getErroMessage(error));
    });

const register = user => dispatch =>
  post('/api/register', { ...user })
    .then(resp => {
      if (resp.status === 500) {
        dispatch(
          actions.getErroMessage(
            '500 Internal Server Error: The server has encountered an internal error and unable to complete your request'
          )
        );
      } else if (resp.status === 400) {
        return resp.message;
      } else {
        dispatch(registerAction({ ...user, ...resp }));
        return 'Registered Successfully';
      }
    })
    .catch(error => {
      console.error(error);
      dispatch(errorAction(error));
    });

export default {
  login,
  logout,
  network,
  register
};
