import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import BlockChart from '../Charts/BlocksChart';
import TransactionChart from '../Charts/TransactionsChart';
import { Alert, Card, Row, Col, CardBody } from 'reactstrap';
import { getHeaderCount as getCountHeaderCreator } from '../../store/actions/header/action-creators';
import { Graph } from 'react-d3-graph';
import FontAwesome from 'react-fontawesome';
class DashboardView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {
                nodes: [
                    { id: 'Peer1' },
                    { id: 'Peer2' },
                    { id: 'Peer3' },
                    { id: 'Peer4' }
                ],
                links: [
                    { source: 'Peer1', target: 'Peer2' },
                    { source: 'Peer1', target: 'Peer3' },
                    { source: 'Peer4', target: 'Peer3' },
                ]
            },
            myConfig: {
                nodeHighlightBehavior: true,
                node: {
                    color: 'gray',
                    size: 200,
                    highlightStrokeColor: 'blue'
                },
                link: {
                    highlightColor: 'lightblue'
                }
            }
        }
    }
    componentDidMount() {
    }
    render() {
        return (
            <div className="dashboard" >
                <div className="dash-stats">
                    <Row>
                        <Card className="count-card dark-card">
                            <CardBody>
                                <h1>{this.props.countHeader.countHeader.latestBlock}</h1>
                                <h4> <FontAwesome name="square-o" /> Blocks</h4>
                            </CardBody>
                        </Card>
                        <Card className="count-card light-card" >
                            <CardBody>
                                <h1>{this.props.countHeader.countHeader.txCount}</h1>
                                <h4><FontAwesome name="list-alt" /> Transactions</h4>
                            </CardBody>
                        </Card>
                        <Card className="count-card dark-card" >
                            <CardBody>
                                <h1>{this.props.countHeader.countHeader.peerCount}</h1>
                                <h4><FontAwesome name="users" />Nodes</h4>
                            </CardBody>
                        </Card>
                        <Card className="count-card light-card" >
                            <CardBody>
                                <h1>TBA</h1>
                                <h4><FontAwesome name="handshake-o" />Smart Contracts</h4>
                            </CardBody>
                        </Card>
                    </Row>
                </div>
                    <BlockChart />
                    <TransactionChart />

            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => ({
    getCountHeader: () => dispatch(getCountHeaderCreator()),
});
const mapStateToProps = state => ({
    countHeader: state.countHeader,
});
export default compose(
    connect(mapStateToProps, mapDispatchToProps),
)(DashboardView);