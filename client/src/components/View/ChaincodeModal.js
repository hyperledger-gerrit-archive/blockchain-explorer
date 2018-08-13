/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import beautify from 'js-beautify';
import FontAwesome from 'react-fontawesome';
import { Card, CardBody, CardTitle } from 'reactstrap';
import { chaincodeType,onCloseType } from '../types';

const styles = () => ({
  container: {
    border: '3px solid #afeeee'
  },
  container1: {
    display: 'flex',
    flexWrap: 'wrap'
  }
});

class ChaincodeModal extends Component {

  handleClose = () => {
    const { onClose } = this.props;
    onClose();
  };

  render() {
    const { chaincode } = this.props;
    const formattedSrc = beautify(chaincode.source, {
      indent_size: 4
    });
    const srcHeader = `${chaincode.chaincodename} ${chaincode.version}`;

    return (
      <div className="sourceCodeDialog">
        <div className="dialog">
          <Card>
            <CardTitle className="dialogTitle">
              <FontAwesome name="file-text" className="cubeIcon" />
              {srcHeader}
              <button
                type="button"
                onClick={this.handleClose}
                className="closeBtn"
              >
                <FontAwesome name="close" />
              </button>
            </CardTitle>
            <CardBody>
              <textarea className="source-code" value={formattedSrc} readOnly />
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }
}

ChaincodeModal.propTypes = {
  chaincode: chaincodeType,
  onClose: onCloseType.isRequired
};

ChaincodeModal.defaultProps = {
  chaincode: null
};

export default withStyles(styles)(ChaincodeModal);
