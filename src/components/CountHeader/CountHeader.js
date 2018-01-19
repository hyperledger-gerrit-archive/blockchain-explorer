import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import Button from 'material-ui/Button';
import Tooltip from 'material-ui/Tooltip';
import Typography from 'material-ui/Typography';
import PropTypes from 'prop-types';
import TransactionsView from "../View/TransactionsView";
import ChaincodeView from "../View/ChaincodeView";
import BlocksChart from "../Charts/BlocksChart";
import TransactionsChart from '../Charts/TransactionsChart';
//import query from '../../app/query';

const styles = theme => ({
  card: {
    minWidth: 290,
    height: 100,

  },
  media: {
    height: 30,
  },
  title: {
    marginBottom: 16,
    fontSize: 16,
    color: theme.palette.text.secondary,
    position: 'absolute',
    right: 10,
    top: 10
  },
  pos: {
    marginBottom: 5,
    color: theme.palette.text.secondary,
    position: 'absolute',
    right: 10,
    top: 60,
    fontSize: 18,

  },

});


class CountHeader extends Component {
  constructor(props) {
    super(props);
    this.state = { isChaincodeView: true };
    this.state = { isTransactionView: false };
    this.handleClickChaincodeView = this.handleClickChaincodeView.bind(this);
    this.handleClickTransactionView = this.handleClickTransactionView.bind(this);
  }



  handleClickChaincodeView() {
    this.setState({ isTransactionView: false });
    this.setState({ isChaincodeView: true });
    // this.setState({ isChaincodeView: !this.state.isChaincodeView });
  }

  handleClickTransactionView() {
    this.setState({ isChaincodeView: false });
    this.setState({ isTransactionView: true });
    // this.setState({ isTransactionView: !this.state.isTransactionView });
  }



  render() {
    const { classes } = this.props;
    //console.log(this.props);

    let currentView = null;
    if (this.state.isChaincodeView) {
      currentView = <ChaincodeView />;
    } else if (this.state.isTransactionView) {
      currentView = <TransactionsView />;
    }

    return (
      <div>
        <div style={{ position: 'absolute', top: 100, right: 50, zIndex: 1000 }}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.title}>CHAINCODE</Typography>
              <Typography className={classes.pos}>{11} </Typography>
            </CardContent>
            <CardActions>
              <Tooltip id="tooltip-top" title="View Chaincode" placement="top">
                <Button dense color="primary" onClick={this.handleClickChaincodeView}>
                  More
          </Button>
              </Tooltip>
            </CardActions>
          </Card>
        </div>
        <div style={{ position: 'absolute', top: 100, right: 350, zIndex: 1000 }}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.title}>TX</Typography>
              <Typography className={classes.pos}>{5} </Typography>
            </CardContent>
            <CardActions>
              <Tooltip id="tooltip-top" title="View Transactions" placement="top">
                <Button dense color="primary" onClick={this.handleClickTransactionView}>
                  More
          </Button>
              </Tooltip>
            </CardActions>
          </Card>
        </div>
        <div style={{ position: 'absolute', top: 100, right: 650, zIndex: 1000 }}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.title}>BLOCK</Typography>
              <Typography className={classes.pos}>{5} </Typography>
            </CardContent>
          </Card>
        </div>
        <div style={{ position: 'absolute', top: 100, right: 950, zIndex: 1000 }}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.title}>PEER</Typography>
              <Typography className={classes.pos}>{1}</Typography>
            </CardContent>
          </Card>
        </div>
        <div style={{ position: 'absolute', top: 230, left: 30 , zIndex: 1000 }}>
          {currentView}
        </div>
        <div>
          <BlocksChart />
        </div>
        <div>
          <TransactionsChart />
        </div>
      </div>
    );
  }
}
CountHeader.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CountHeader);

