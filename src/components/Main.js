import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom'
import Channel from './Channel/Channel'

class Main extends Component {
  render() {
    return (
      <Switch>
      <Route exact path='/' component={Channel}/>
     </Switch>
    );
  }
}
export default Main
