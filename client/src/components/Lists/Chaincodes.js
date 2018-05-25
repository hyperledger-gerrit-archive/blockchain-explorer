/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { Container, Row, Col, Button } from "reactstrap";
import ReactTable from "react-table";
import "react-table/react-table.css";
import matchSorter from "match-sorter";
import Dialog from "material-ui/Dialog";
import { withStyles } from "material-ui/styles";

import ChaincodeForm from "../Forms/ChaincodeForm";
const styles = theme => ({
  button: {
    "background-color": "#afeeee",
    "font-size": "16px",
    color: "black",
    padding: "7px 35px",
    margin: "14px 0px",
    display: "block",
    border: "none",
    "box-shadow": "0px 9px 10px  rgba(0,0,0,0.05)"
  }
});

class Chaincodes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      chaincodeCount: this.props.countHeader.chaincodeCount,
      dialogOpen: false
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ chaincodeCount: this.props.countHeader.chaincodeCount });
    dialogOpen: false;
  }

  componentDidMount() {
    setInterval(() => {
      this.props.getChaincodes(this.props.channel.currentChannel);
    }, 60000);
  }
  handleDialogOpen = tid => {
    this.setState({ dialogOpen: true });
  };
  handleDialogClose = () => {
    this.setState({ dialogOpen: false });
  };

  reactTableSetup = () => {
    return [
      {
        Header: "Chaincode Name",
        accessor: "chaincodename",
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ["chaincodename"] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      },
      {
        Header: "Channel Name",
        accessor: "channelName",
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ["channelName"] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      },
      {
        Header: "Path",
        accessor: "path",
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ["path"] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      },
      {
        Header: "Transaction Count",
        accessor: "txCount",
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ["txCount"] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      },
      {
        Header: "Version",
        accessor: "version",
        filterMethod: (filter, rows) =>
          matchSorter(
            rows,
            filter.value,
            { keys: ["version"] },
            { threshold: matchSorter.rankings.SIMPLEMATCH }
          ),
        filterAll: true
      }
    ];
  };

  render() {
    const { classes } = this.props;
    return (
      <div className="blockPage">
        <Container>
          <Button
            className={classes.button}
            onClick={() => this.handleDialogOpen()}
          >
            Add Chaincode
          </Button>
          <Row>
            <Col>
              <div className="scrollTable">
                <ReactTable
                  data={this.props.chaincodes}
                  columns={this.reactTableSetup()}
                  defaultPageSize={5}
                  className="-striped -highlight"
                  filterable
                  minRows={0}
                />
              </div>
            </Col>
          </Row>
        </Container>
        <Dialog
          open={this.state.dialogOpen}
          onClose={this.handleDialogClose}
          fullWidth={true}
          maxWidth={"md"}
        >
          <ChaincodeForm />
        </Dialog>
      </div>
    );
  }
}

export default withStyles(styles)(Chaincodes);
