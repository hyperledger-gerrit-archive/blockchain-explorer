import React, { Component } from 'react';

class Header extends Component {
  render() {
    return (
		<section>
			<header>
				<nav className="tower-navigation">
					<div className="tower-logo-container">
						<img src={process.env.PUBLIC_URL + '/favicon.ico'} alt='logoimage'/>
						<a tabindex='0' className="tower-logo"> - FABRIC EXPLORER </a>
					</div>
					<a tabindex='0' className="tower-logo-hidden">Tower Control</a>
					<div className="dropdown settings">
						<a tabindex='0' className="dropdown-toggle" data-toggle="dropdown">
							Select Channel
							<b className="caret"></b>
						</a>
						<ul id="selectchannel" className="dropdown-menu" role="menu" >
						</ul>
					</div>
				</nav>
			</header>
    </section>
    );
  }
}

export default Header;
