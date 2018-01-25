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
//import CountsHeaderWorker from '../Worker/CountsHeaderWorker';
// <CurrentDateTime /> import CurrentDateTime from '../CurrentDateTime'
//import countHeader from '../../store/reducers/countHeader'
//import request from 'superagent';
//import query from '../../app/query';

const styles = theme => ({
  card: { minWidth: 290, height: 100, },
  media: { height: 30, },
  title: {
    marginBottom: 16, fontSize: 16, color: theme.palette.text.secondary,
    position: 'absolute', right: 10, top: 10
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
    this.state = { isChaincodeView: true, isTransactionView: false };
    this.state.counters = { chaincodeCount: 5 }
    this.state.counters = { txCount: 5 }
    this.state.counters = { latestBlock: 5 }
    this.state.counters = { peerCount: 5 }

    this.handleClickChaincodeView = this.handleClickChaincodeView.bind(this);
    this.handleClickTransactionView = this.handleClickTransactionView.bind(this);

  }

  handleClickChaincodeView() {
    this.setState({ isTransactionView: false });
    this.setState({ isChaincodeView: true });
  }

  handleClickTransactionView() {
    this.setState({ isChaincodeView: false });
    this.setState({ isTransactionView: true });
  }

  handleOnLoad(){
    
  }

  render() {
    const { classes } = this.props;

    let currentView = null;
    if (this.state.isChaincodeView) {
      currentView = <ChaincodeView />;
    } else if (this.state.isTransactionView) {
      currentView = <TransactionsView />;
    }

    return (
      <div>
        <div style={{ position: 'absolute', top: 100, left: 975, zIndex: 1000 }}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.title}>CHAINCODE</Typography>
              <Typography className={classes.pos}>{}

              </Typography>
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
        <div style={{ position: 'absolute', top: 100, left: 665, zIndex: 1000 }}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.title}>TX</Typography>
              <Typography className={classes.pos}>{} </Typography>
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
        <div style={{ position: 'absolute', top: 100, left: 355, zIndex: 1000 }}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.title}>BLOCK</Typography>
              <Typography className={classes.pos}> {}</Typography>
            </CardContent>
          </Card>
        </div>
        <div style={{ position: 'absolute', top: 100, left: 50, zIndex: 1000 }}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.title}>PEER</Typography>
              <Typography className={classes.pos}>{}</Typography>
            </CardContent>
          </Card>
        </div>
        <div style={{ position: 'absolute', top: 210, left: 30, zIndex: 1000 }}>
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

