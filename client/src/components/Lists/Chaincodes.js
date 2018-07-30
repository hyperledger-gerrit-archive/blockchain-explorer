/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import matchSorter from 'match-sorter';
import Dialog from 'material-ui/Dialog';
import Button from "material-ui/Button";
import ChaincodeForm from '../Forms/ChaincodeForm';
import ChaincodeModal from '../View/ChaincodeModal';
import ChaincodeInitForm from '../Forms/ChaincodeInitForm';
import ChaincodeAlert from '../Alert/ChaincodeAlert';

class Chaincodes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      installDialog: false,
      sourceDialog: false,
      chaincode: {},
      initDialog: false,
      respPopup: false,
      installedChaincode: {},
      payload: {},
      reqType: {}
    };
  }

  handleInstallDialogOpen = () => {
    this.setState({ installDialog: true });
  };

  handleInstallDialogClose = () => {
    this.setState({ installDialog: false });
  };

  sourceDialogOpen = chaincode => {
    this.setState({ chaincode: chaincode });
    this.setState({ sourceDialog: true });
  };

  sourceDialogClose = () => {
    this.setState({ sourceDialog: false });
  };

  handleInitDialogClose = () => {
      this.setState({ initDialog: false })
  };

  handleInitDialogOpen = (payload) => {
      this.setState({
        initDialog: true ,
        installedChaincode: payload
      })
  };

  handleChaincodeRequest = (type ,payload) => {
    this.setState({
      payload: payload,
      reqType: type
    });
    type === 'install' ? this.handleInstallDialogClose() : this.handleInitDialogClose() ;
    this.respPopupOpen();
  };

  respPopupOpen = () => {
    this.setState({ respPopup: true });
  }

  respPopupClose = (reqType, success, payload) => {
    this.setState({ respPopup: false });
    if ( 'install' === reqType && success === true) { this.handleInitDialogOpen(payload) }
  };

  reactTableSetup = () => {
    return [
      {
        Header: 'Chaincode Name',
        accessor: 'chaincodename',
        Cell: row => (
          <a className="hash-hide" onClick={() => this.sourceDialogOpen(row.original)} href="#/chaincodes" >{row.value}</a>
        ),
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ['chaincodename'] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      },
      {
        Header: 'Channel Name',
        accessor: 'channelName',
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ['channelName'] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      },
      {
        Header: 'Path',
        accessor: 'path',
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ['path'] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      },
      {
        Header: 'Transaction Count',
        accessor: 'txCount',
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ['txCount'] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      },
      {
        Header: 'Version',
        accessor: 'version',
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ['version'] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      }
    ];
  };

  render() {
    return (
      <div >
        <Button className="button" onClick={() => this.handleInstallDialogOpen()}>
          Add Chaincode
          </Button>
        <ReactTable
          data={this.props.chaincodeList}
          columns={this.reactTableSetup()}
          defaultPageSize={5}
          className="-striped -highlight"
          filterable
          minRows={0}
          showPagination={ this.props.chaincodeList.length < 5  ?  false : true }
        />
        <Dialog
          open={this.state.installDialog}
          onClose={this.handleInstallDialogClose}
          fullWidth={true}
          maxWidth={"md"}
        >
        <ChaincodeForm
            handleDialog={this.handleChaincodeRequest}
            peerList={this.props.peerList}
        />
        </Dialog>
        <Dialog
          open={this.state.sourceDialog}
          onClose={this.sourceDialogClose}
          fullWidth={true}
          maxWidth={"md"}
        >
          <ChaincodeModal chaincode={this.state.chaincode} />
        </Dialog>
        <Dialog
          open={this.state.initDialog}
          onClose={this.handleInitDialogClose}
          fullWidth={true}
          maxWidth={"md"}
        >
            <ChaincodeInitForm
              peerList={this.props.peerList}
              chaincodeInfo={this.state.installedChaincode}
              handleDialog={this.handleChaincodeRequest}
            />
        </Dialog>
        <Dialog
          open={this.state.respPopup}
          onClose={this.respPopupClose}
          >
          <ChaincodeAlert
            payload={this.state.payload}
            reqType={this.state.reqType}
            handleClose={this.respPopupClose}
          />
        </Dialog>
      </div >
    );
  }
}

export default Chaincodes;
