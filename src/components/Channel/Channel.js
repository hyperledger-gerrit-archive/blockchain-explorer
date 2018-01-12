import React, { Component } from 'react';
import CountHeader from '../CountHeader/CountHeader';
import MainComponent from '../../MainComponent'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';


class Channel extends Component {
  render() {
    return (
      <main>
	  	<section>
			<div className="tower-body-wrapper">
			<MuiThemeProvider>
			<RaisedButton label="Default" />	
			</MuiThemeProvider>
          <CountHeader/>		
					<MainComponent />		
			</div>
		</section>
	</main>
  
    );
  }
}
export default Channel;
