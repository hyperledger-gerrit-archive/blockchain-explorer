import React, { Component } from 'react';
import BlocksChart from "../Charts/BlocksChart";
import TransactionsChart from '../Charts/TransactionsChart';
import MenuBar from '../CountHeader/MenuBar';
class Layout extends Component {
    constructor(props) {
        super(props);
        this.state = { page: 'index.js', description: 'Main layout' };
    }
    render() {
        return (
            <div>
                <div>
                    <MenuBar />
                </div>
                {/* <div>
                    <BlocksChart />
                </div>
                <div>
                    <TransactionsChart />
                </div> */}
            </div>
        );
    }
}

export default Layout;

