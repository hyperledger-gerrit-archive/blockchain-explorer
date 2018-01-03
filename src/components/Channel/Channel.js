import React, { Component } from 'react';
import CountHeader from '../CountHeader/CountHeader';
var groundStyle = {
  height: '250px'
}
class Channel extends Component {
  render() {
    return (
      <main>
	  	<section>
			<div className="tower-body-wrapper">
				<div className="container-fluid">
					<header className="tower-page-title" id="channel-name">
						<span>Channel</span>
					</header>

          <CountHeader/>

					<div className="row" id="grounds">
						<div className="widget-sizer col-lg-1 col-md-1 col-xs-12" style={groundStyle}></div>
					</div>

				</div>
			</div>
		</section>
	</main>
  
    );
  }
}
export default Channel;
