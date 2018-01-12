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
				</nav>
			</header>
    </section>
    );
  }
}

export default Header;
