/**
 *    SPDX-License-Identifier: Apache-2.0
 */
import { login as loginAction, logout as logoutAction } from './actions';
import { post } from '../../../services/request';

const login = user => dispatch =>
  post('/api/login', user)
    .then(resp => {
      dispatch(loginAction({ name: user.name, ...resp }));
    })
    .catch(error => {
      // TODO: keeping till api service implemented
      // eslint-disable-next-line no-console
      console.error(error);
      dispatch(loginAction({ name: user.name }));
    });

const logout = () => dispatch =>
  post('/api/logout', {})
    .then(() => {
      dispatch(logoutAction());
    })
    .catch(error => {
      // TODO: keeping till api service implemented
      // eslint-disable-next-line no-console
      console.error(error);
      dispatch(logoutAction());
    });

export default {
  login,
  logout
};
