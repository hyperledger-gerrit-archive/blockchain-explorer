import React, { Component } from 'react';
import * as actionTypes from '../../store/actions/action-types'

class CountsHeaderWorker extends Component {
    constructor(props) {
        super(props);
        this.state = { actionInvoked: false };
        // this.handleClickAction = this.handleClickAction.bind(this);
    }

    /*
    handleClickAction() {
        this.setState({ actionInvoked: true });

    }

    componentDidMount() {
        this.timerID = setInterval(
            () => this.triggerAction(),
            1000
        );
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    componentDidUpdate() {
        this.timerID = setInterval(
            () => this.triggerAction(),
            1000
        );
    }
    triggerAction() {
        ;

    }
    render() {
        console.log("this.timerID", this.timerID);

        return (
            <span >WORKER</span>
        );

    }
    */

}

export default CountsHeaderWorker