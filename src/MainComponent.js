import React, { Component } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import { getName as getNameActionCreator } from './store/actions/sample/action-creators'


class MainComponent extends Component {
    componentWillMount() {
        this.props.getName()
    }
    render() {
        const { name } = this.props
        return(
            <h1>welcome {name}</h1>
        )
    }
}

MainComponent.propTypes= {
    name: PropTypes.sting,
    getName: PropTypes.func,
}

const mapStateToProps = state => ({
    name: state.sampleDetails.name,
})

const mapDispatchToProps = (dispatch) => ({
    getName: () => dispatch(getNameActionCreator()),
})

export default connect(mapStateToProps, mapDispatchToProps)(MainComponent)