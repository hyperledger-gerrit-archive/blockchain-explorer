import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withStyles } from 'material-ui/styles';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import Button from 'material-ui/Button';
import Tooltip from 'material-ui/Tooltip';
import Typography from 'material-ui/Typography';
import PropTypes from 'prop-types';
import TransactionsView from "../View/TransactionsView";
import ChaincodeView from "../View/ChaincodeView";
import { getHeaderCount as getCountHeaderCreator } from '../../store/actions/header/action-creators';

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
 /*   this.state.countHeader = { 
        chaincodeCount: 0, txCount: 0, latestBlock: 0, peerCount: 0
     };
     */
    this.state = { countHeader: this.props.countHeader };
    this.handleClickChaincodeView = this.handleClickChaincodeView.bind(this);
    this.handleClickTransactionView = this.handleClickTransactionView.bind(this);
  }

  componentWillMount() {
    this.props.getCountHeader();    
    console.log('componentWillMount: ', this.state.countHeader);
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.countHeader !== this.props.countHeader) {
      this.setState({countHeader: nextProps.countHeader});
      console.log("countHeader received nextProps value: ", nextProps.countHeader);
    }
  }

  componentDidMount() {
  }

  componentDidUpdate(prevProps, prevState) {
    //TODO 
    // this will run in a loop, need to validate some state
    //Use componentDidUpdate if you want to update state asynchronously when props change!
    // only update  if the data has changed
      console.log('componentDidUpdate() ' + new Date().toLocaleString());
      if (prevState.countHeader !== prevProps.countHeader) {
        this.props.getCountHeader();
        console.log('componentDidUpdate() ' + new Date().toLocaleString());
        console.log('prevProps ', prevProps.countHeader, ' prevState ', prevState.countHeader);
      }
      
  }

  handleClickChaincodeView() {
    this.setState({ isTransactionView: false });
    this.setState({ isChaincodeView: true });
  }

  handleClickTransactionView() {
    this.setState({ isChaincodeView: false });
    this.setState({ isTransactionView: true });
  }


  render() {
    const { classes } = this.props;
    const { countHeader } = this.props.countHeader;
    
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
              <Typography className={classes.pos}>{countHeader.chaincodeCount}
              </Typography>
            </CardContent>
            <CardActions>
              <Tooltip id="tooltip-top" title="View Chaincode" placement="top">
                <Button color="primary" onClick={this.handleClickChaincodeView}>
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
              <Typography className={classes.pos}>{countHeader.txCount} </Typography>
            </CardContent>
            <CardActions>
              <Tooltip id="tooltip-top" title="View Transactions" placement="top">
                <Button color="primary" onClick={this.handleClickTransactionView}>
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
              <Typography className={classes.pos}> {countHeader.latestBlock}</Typography>
            </CardContent>
          </Card>
        </div>
        <div style={{ position: 'absolute', top: 100, left: 50, zIndex: 1000 }}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.title}>PEER</Typography>
              <Typography className={classes.pos}>{countHeader.peerCount}</Typography>
            </CardContent>
          </Card>
        </div>
        <div style={{ position: 'absolute', top: 210, left: 30, zIndex: 1000 }}>
          {currentView}
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  getCountHeader: () => dispatch(getCountHeaderCreator())
});


const mapStateToProps = state => ({
  countHeader: state.countHeader
});

CountHeader.propTypes = {
  classes: PropTypes.object.isRequired,
  getCountHeader: PropTypes.func.isRequired,
};

export default compose(
  withStyles(styles, { name: 'CountHeader' }),
  connect(mapStateToProps, mapDispatchToProps),
)(CountHeader);

