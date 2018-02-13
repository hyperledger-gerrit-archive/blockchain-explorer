import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import createStore from '../store/index';
import Layout from './Layout/index';

const Main = () =>
  (
    <Provider store={createStore()} >
      <Router>
        <div className="App">
          <Switch>
            <Route exact path='/' component={Layout} />
          </Switch>
        </div>
      </Router>
    </Provider>
  )

export default Main
