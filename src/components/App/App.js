import React, { Component } from 'react';
import Header from '../Header/Header';
import Main from '../Main';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { createMuiTheme } from 'material-ui/styles';
import indigo from 'material-ui/colors/indigo';
import lightBlue from 'material-ui/colors/lightBlue';
import red from 'material-ui/colors/red';

const muiTheme = createMuiTheme({
  palette: {
    contrastThreshold: 3,
    tonalOffset: 0.2,
    primary: indigo,
    secondary: lightBlue,
    error: {
      main: red[500],
    },
  },
});


class App extends Component {
  render() {
    return (
      <MuiThemeProvider theme={muiTheme} >
      <div>
			<Header />
      <Main />      
			</div>
      </MuiThemeProvider>
    );
  }
}

export default App;
