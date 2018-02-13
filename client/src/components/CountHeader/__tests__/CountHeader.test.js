import React from "react";
import { mount, shallow } from "enzyme";
import Adapter from 'enzyme-adapter-react-16';
import configureStore from 'redux-mock-store';
import CountHeader from "../CountHeader";

const middlewares = []; // you can mock any middlewares here if necessary
const mockStore = configureStore(middlewares);

const initialState = {
    state: { isChaincodeView: true, isTransactionView: false },
};

describe('Testing CountHeader', () => {
    let wrapper
    it('renders as expected', () => {
        wrapper = shallow(
            <CountHeader />,
            { context: { store: mockStore(initialState) } },
        );
        expect(wrapper.dive()).toMatchSnapshot();
    });
   
});
