import React, { Component } from 'react';
import BlocksChart from "../Charts/BlocksChart";
import TransactionsChart from '../Charts/TransactionsChart';
import CountHeader from '../CountHeader/CountHeader';
import Channel from '../Channel/Channel';

class Layout extends Component {
    constructor(props) {
        super(props);
        this.state = { page: 'index.js', description: 'Main layout' };
    }
    render() {
        return (
            <div>
                <div>
                    <CountHeader />
                    <Channel />
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

export default Layout;