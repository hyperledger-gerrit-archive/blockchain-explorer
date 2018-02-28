import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Avatar from 'material-ui/Avatar';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';

class HeaderView extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      isOpen: false

    }
    this.toggle = this.toggle.bind(this);

  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  componentDidMount() {
    // this.props.actions.loadTrades();
  }
  componentWillReceiveProps(nextProps) {
    // console.log(nextProps.trades);
    // this.setState({loading:false});
  }
  render() {
    return (
      <div>
        <Navbar color="faded" light expand="md">
          <NavbarBrand href="/"> HYPERLEDGER EXPLORER</NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Nav className="ml-auto" navbar>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                CHANNEL
                </DropdownToggle>
              <DropdownMenu >
                <DropdownItem>
                  {this.props.channelList.channels[0].channel_id}
                  </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
        </Navbar>
      </div>
    );
  }

}
function mapStateToProps(state, ownProps) {
  return {
    channelList: state.channelList.channelList,
    channel: state.channel.channel
  }
}
// function mapDispatchToProps(dispatch){
//   return {actions: bindActionCreators({...partActions,...secActions}, dispatch)}
// }
export default connect(mapStateToProps/*,mapDispatchToProps*/)(HeaderView);
