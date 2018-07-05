/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import compose from 'recompose/compose';
import { withStyles } from 'material-ui/styles';
import PropTypes from 'prop-types';
import Blocks from '../Lists/Blocks';
import Card from 'material-ui/Card';
const styles = theme => ({
  root: {
    flexGrow: 1,
    paddingTop: 42,
    position: 'relative',
  },
  card: {
    height: 250,
    minWidth: 1290,
    margin: 20,
    textAlign: 'left',
    display: 'inline-block',
  },
  title: {
    fontSize: 16,
    color: theme.palette.text.secondary,
    position: 'absolute',
    left: 40,
    top: 60
  },
  content: {
    fontSize: 12,
    color: theme.palette.text.secondary,
    position: 'absolute',
    left: 40,
    top: 70
  }
});

export class BlocksView extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes } = this.props;
    return (
      <div className="view-fullwidth" >
        <div className="view-display">
<<<<<<< HEAD   (4c27ce BE-359 Merge and Connect)
        <Card className="table-card">
          <Blocks
            blockList={this.props.blockList}
            channel={this.props.channel}
            transaction={this.props.transaction}
            getTransaction={this.props.getTransaction} />
       </Card>
=======
          <Card className="table-card">
            <Blocks
              blockList={this.props.blockList}
              channel={this.props.channel}
              transaction={this.props.transaction}
              getTransactionInfo={this.props.getTransactionInfo}
              removeTransactionInfo={this.props.removeTransactionInfo}
            />
          </Card>
>>>>>>> BRANCH (807842 BE-355 Added Dark theme for modals)
        </div>
      </div>
    );
  }
}

BlocksView.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default compose(
  withStyles(styles)
)(BlocksView);
