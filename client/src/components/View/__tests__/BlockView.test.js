/***
 * The snapshot artifact should be committed alongside code changes,
 * and reviewed as part of your code review process.
 */
import React from "react";
import { mount, shallow } from "enzyme";
import Adapter from 'enzyme-adapter-react-16';
import configureStore from 'redux-mock-store';
import BlockView from "../BlockView";
import renderer from 'react-test-renderer'

const middlewares = [];
const mockStore = configureStore(middlewares);
const initialState = {};

describe('Testing BlockView component', () => {
    let wrapper;
    beforeEach(() => {
        wrapper = shallow(
            <BlockView />,
            { context: { store: mockStore(initialState) } },
        );
    });
    expect(wrapper).toMatchSnapshot();
    it('wrapper length > 0 ', () => {
        expect(wrapper.length).toEqual(1);
    });
});