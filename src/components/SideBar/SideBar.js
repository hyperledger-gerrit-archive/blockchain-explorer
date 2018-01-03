import React, { Component } from 'react';
import { Link } from 'react-router-dom'

class SideBar extends Component {
  render() {
    return (
		<aside>
		<nav className="tower-sidebar">
			<ul>
				<li id="channel">
					<Link to='/' className="done">
						<i className="fa fa-cubes"><span className="icon-bg"></span></i>
						<span className="tower-sidebar-item">Channel</span>
					</Link>
				</li>				
			</ul>		
		</nav>
	</aside>
    );
  }
}

export default SideBar;
