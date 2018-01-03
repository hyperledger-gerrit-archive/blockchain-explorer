import React, { Component } from 'react';
import service from '../../api/service';
//var service = require('../../api/service');

var blockNumber = service.getBlockByNumber(48);

class CountHeader extends Component {
  render() {
    return (
        <div className="row" id="heads-up">
        <div className="col-lg-3 col-xs-6">
            <div className="tower-nugget tower-txt-success">
                <i className="fa fa-share-alt"></i>
                <span className="heading">peer</span>
                <span className="value default" id="default-peers">
                    <span>0</span> {blockNumber}
                </span>
            </div>
        </div>

        <div className="col-lg-3 col-xs-6">
            <div className="tower-nugget">
                <i className="fa fa-cubes"></i>
                <span className="heading">block</span>
                <span className="value default" id="default-blocks">
                    <span>0</span>
                </span>
            </div>
        </div>

        <div className="col-lg-3 col-xs-6">
            <div className="tower-nugget tower-txt-primary">
                <i className="fa fa-exchange"></i>
                <span className="heading">tx</span>
                <span className="value default" id="default-txn">
                    <span>0</span>
                </span>
            </div>
        </div>

        <div className="col-lg-3 col-xs-6">
            <div className="tower-nugget tower-txt-warning">
                <i className="fa fa-address-card-o"></i>
                <span className="heading">chaincode</span>
                <span className="value default" id="default-chaincode">
                    <span>0</span>
                </span>
            </div>
        </div>

    </div>

    );
  }
}
export default CountHeader;


