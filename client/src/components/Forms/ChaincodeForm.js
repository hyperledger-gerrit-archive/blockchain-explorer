/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import TextField from "material-ui/TextField";
import MenuItem from "material-ui/Menu/MenuItem"
import { withStyles } from "material-ui/styles";
import { Button } from "reactstrap";

const styles = theme => ({
  container: {
    border: "3px solid #afeeee"
  },
  container1: {
    display: "flex",
    flexWrap: "wrap"
  },

  textField: {
    width: "100%"
  },
  button: {
    "background-color": "#afeeee",
    "font-size": "16px",
    color: "black",
    padding: "14px 70px",
    margin: "auto",
    display: "block",
    border: "none",
    "box-shadow": "0px 9px 10px  rgba(0,0,0,0.05)"
  }
});

class ChaincodeForm extends Component {
  constructor(props) {
      super(props);
      this.state = {
          request: {
              path: '',
              name: '',
              version: '',
              type: '',
              peer: ''
          }
      };
  }
  handleChange = event => {
        this.setState({ request :
            {
                ...this.state.request,
                [ event.target.name ] : event.target.value
            }
        });
    };

  handleSubmit = (event) => {
    event.preventDefault();
    this.props.handleDialog('install' ,this.state.request);
  };

  render() {
    const { classes, peerList } = this.props;
      return (
        // TODO : Replace with liform-react
        <div className={["card", classes.container].join(" ")}>
          <div className="card-header" align="center">
            <h3>Add Chaincode</h3>
          </div>
          <div className="card-body">
            <form className={classes.container1} onSubmit={this.handleSubmit}>
              <TextField
                id="file-path"
                label="File Path"
                name="path"
                onChange={this.handleChange}
                className={classes.textField}
                margin="normal"
              />
              <TextField
                id="targetPeer"
                select
                label="Target Peer"
                name="peer"
                value={this.state.request.peer}
                onChange={this.handleChange}
                className={classes.textField}
                margin="normal"
              >
                { peerList.map( peer => (
                  <MenuItem key={peer.requests} value={peer.server_hostname}>{peer.server_hostname}</MenuItem>
                ))}
              </TextField>
              <TextField
                id="chaincode-name"
                label="Chaincode Name"
                name="name"
                onChange={this.handleChange}
                className={classes.textField}
                margin="normal"
              />
              <TextField
                id="version-number"
                label="Version Number"
                name="version"
                onChange={this.handleChange}
                className={classes.textField}
                margin="normal"
              />
              <TextField
                id="chaincode-type"
                select
                label="Select Chaincode Type"
                className={classes.textField}
                value={this.state.request.type}
                onChange={this.handleChange}
                name="type"
                margin="normal"
              >
                <MenuItem value={"Go"}>Go</MenuItem>
                <MenuItem value={"javascript"}>javascript</MenuItem>
                <MenuItem value={"java"}>Java</MenuItem>
              </TextField>
              <Button className={classes.button}>Submit</Button>
            </form>
          </div>
        </div>
      );
  }
}
export default withStyles(styles)(ChaincodeForm);
