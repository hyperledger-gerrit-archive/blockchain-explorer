/***
 * The snapshot artifact should be committed alongside code changes,
 * and reviewed as part of your code review process.
 */
import React from "react";
import { mount, shallow } from "enzyme";
import Adapter from 'enzyme-adapter-react-16';
import configureStore from 'redux-mock-store';
import Main from "../Main";
import renderer from 'react-test-renderer'

beforeEach(() => {
    jest.resetModules();
});
const middlewares = []; // you can mock any middlewares here if necessary
const mockStore = configureStore(middlewares);

const initialState = {};

describe('Testing Main component', () => {
    let wrapper
    beforeEach(() => {
        wrapper = shallow(
            <Main />,
            { context: { store: mockStore(initialState) } },
        );
        expect(wrapper).toMatchSnapshot();
    })

    it('wrapper length > 0 ', () => {
        expect(wrapper.length).toEqual(1);
    });

});
