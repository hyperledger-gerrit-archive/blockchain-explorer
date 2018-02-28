// import React, { Component } from 'react';
// import compose from 'recompose/compose';
// import { connect } from 'react-redux';
// import { withStyles } from 'material-ui/styles';
// import Card, { CardActions, CardContent } from 'material-ui/Card';
// import Button from 'material-ui/Button';
// import Tooltip from 'material-ui/Tooltip';
// import Typography from 'material-ui/Typography';
// import PropTypes from 'prop-types';
// import TransactionView from "../View/TransactionView";
// import ChaincodeView from "../View/ChaincodeView";
// import BlockView from "../View/BlockView";
// import PeerView from "../View/PeerView";
// import ChannelView from "../View/ChannelView";
// import Peers from '../Lists/Peers';
// import { getHeaderCount as getCountHeaderCreator } from '../../store/actions/header/action-creators';

// const styles = theme => ({
//   card: { minWidth: 250, height: 100, },
//   media: { height: 30, },
//   title: {
//     marginBottom: 16, fontSize: 16, color: theme.palette.text.secondary,
//     position: 'absolute', right: 10, top: 10
//   },
//   pos: {
//     marginBottom: 5,
//     color: theme.palette.text.secondary,
//     position: 'absolute',
//     right: 10,
//     top: 60,
//     fontSize: 18,
//   },

// });

// class CountHeader extends Component {
//   constructor(props) {
//     super(props);
//     this.state = { activeView: 'ChaincodeView' }
//     this.state = {
//       countHeader: { countHeader: this.props.getCountHeader() }
//       //json structure  {chaincodeCount: 0, txCount: 0, latestBlock: 0, peerCount: 0 }
//     };

//     this.handleClickChaincodeView = this.handleClickChaincodeView.bind(this);
//     this.handleClickTransactionView = this.handleClickTransactionView.bind(this);
//     this.handleClickBlockView = this.handleClickBlockView.bind(this);
//     this.handleClickChannelView = this.handleClickChannelView.bind(this);
//     this.handleClickPeerView = this.handleClickPeerView.bind(this);
//   }

//   componentWillMount() {

//   }

//   componentWillReceiveProps(nextProps) {
//     if (JSON.stringify(nextProps.countHeader) !== JSON.stringify(this.props.countHeader)) {
//       console.log('nextProps.countHeader !== this.props.countHeader')
//       this.setState({ countHeader: nextProps.countHeader });
//     }
//   }


//   componentDidMount() {
//     //TODO isolate interval
//     setInterval(() => {
//       this.props.getCountHeader();
//     }, 3000);

//   }

//   componentDidUpdate(prevProps, prevState) {
//   }


//   handleClickChaincodeView() {
//     //TODO add constants for activeView
//     this.setState({ activeView: 'ChaincodeView' });
//   }
//   handleClickTransactionView() {
//     this.setState({ activeView: 'TransactionView' });
//   }
//   handleClickBlockView() {
//     this.setState({ activeView: 'BlockView' });
//   }
//   handleClickChannelView() {
//     this.setState({ activeView: 'ChannelView' });
//   }
//   handleClickPeerView() {
//     this.setState({ activeView: 'PeerView' });
//   }


//   render() {
//     const { classes } = this.props;
//     const { countHeader } = this.props.countHeader;

//     let currentView = null;
//     /* could be routed */
//     switch (this.state.activeView) {
//       case 'ChaincodeView':
//         currentView = <ChaincodeView />;
//         break;
//       case 'TransactionView':
//         currentView = <TransactionView />;
//         break;
//       case 'BlockView':
//         currentView = <BlockView />;
//         break;
//       case 'ChannelView':
//         currentView = <ChannelView />;
//         break;
//       case 'PeerView':
//         currentView = <Peers peerList={this.props.peerList}/>;
//         break;
//       default:
//         currentView = <PeerView />;
//         break;
//     }

//     return (
//       <div>
//         <div style={{ position: 'absolute', top: 100, left: 1090, zIndex: 1000 }}>
//           <Card className={classes.card}>
//             <CardContent>
//               <Typography className={classes.title}>CHANNEL</Typography>
//               <Typography className={classes.pos}>{countHeader.channelCount}</Typography>
//             </CardContent>
//             <CardActions>
//               <Tooltip id="tooltip-top" title="View Channel" placement="top">
//                 <Button color="primary" onClick={this.handleClickChannelView}>
//                   More
//           </Button>
//               </Tooltip>
//             </CardActions>
//           </Card>
//         </div>
//         <div style={{ position: 'absolute', top: 100, left: 830, zIndex: 1000 }}>
//           <Card className={classes.card}>
//             <CardContent>
//               <Typography className={classes.title}>CHAINCODE</Typography>
//               <Typography className={classes.pos}>{countHeader.chaincodeCount}
//               </Typography>
//             </CardContent>
//             <CardActions>
//               <Tooltip id="tooltip-top" title="View Chaincode" placement="top">
//                 <Button color="primary" onClick={this.handleClickChaincodeView}>
//                   More
//           </Button>
//               </Tooltip>
//             </CardActions>
//           </Card>
//         </div>
//         <div style={{ position: 'absolute', top: 100, left: 570, zIndex: 1000 }}>
//           <Card className={classes.card}>
//             <CardContent>
//               <Typography className={classes.title}>TX</Typography>
//               <Typography className={classes.pos}>{countHeader.txCount} </Typography>
//             </CardContent>
//             <CardActions>
//               <Tooltip id="tooltip-top" title="View Transactions" placement="top">
//                 <Button color="primary" onClick={this.handleClickTransactionView}>
//                   More
//           </Button>
//               </Tooltip>
//             </CardActions>
//           </Card>
//         </div>
//         <div style={{ position: 'absolute', top: 100, left: 310, zIndex: 1000 }}>
//           <Card className={classes.card}>
//             <CardContent>
//               <Typography className={classes.title}>BLOCK</Typography>
//               <Typography className={classes.pos}> {countHeader.latestBlock}</Typography>
//             </CardContent>
//             <CardActions>
//               <Tooltip id="tooltip-top" title="View Block" placement="top">
//                 <Button color="primary" onClick={this.handleClickBlockView}>
//                   More
//           </Button>
//               </Tooltip>
//             </CardActions>
//           </Card>
//         </div>
//         <div style={{ position: 'absolute', top: 100, left: 50, zIndex: 1000 }}>
//           <Card className={classes.card}>
//             <CardContent>
//               <Typography className={classes.title}>PEER</Typography>
//               <Typography className={classes.pos}>{countHeader.peerCount}</Typography>
//             </CardContent>
//             <CardActions>
//               <Tooltip id="tooltip-top" title="View Peer" placement="top">
//                 <Button color="primary" onClick={this.handleClickPeerView}>
//                   More
//           </Button>
//               </Tooltip>
//             </CardActions>
//           </Card>
//         </div>

//         <div style={{ position: 'absolute', top: 210, left: 30, zIndex: 1000 }}>
//           {currentView}
//         </div>
//       </div>
//     );
//   }
// }

// const mapDispatchToProps = (dispatch) => ({
//   getCountHeader: () => dispatch(getCountHeaderCreator())
// });


// const mapStateToProps = state => ({
//   countHeader: state.countHeader,
//   peerList : state.peerList.peerList
// });

// CountHeader.propTypes = {
//   classes: PropTypes.object.isRequired,
//   getCountHeader: PropTypes.func.isRequired,
// };

// export default compose(
//   withStyles(styles, { name: 'CountHeader' }),
//   connect(mapStateToProps, mapDispatchToProps),
// )(CountHeader);
