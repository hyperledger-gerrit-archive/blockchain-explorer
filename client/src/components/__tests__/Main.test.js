import React from "react";
import {
    mount,
    shallow
} from "enzyme";
import Adapter from 'enzyme-adapter-react-16';
import configureStore from 'redux-mock-store';
import Main from "../Main";
import renderer from 'react-test-renderer';

const middlewares = [];
const mockStore = configureStore(middlewares);
const initialState = {};

describe('Testing Main component', () => {
    let wrapper;
    beforeEach(() => {
        wrapper = shallow( <Main /> , {
            context: {
                store: mockStore(initialState)
            }
        }, );
        expect(wrapper).toMatchSnapshot();
    })
    it('wrapper length > 0 ', () => {
        expect(wrapper.length).toEqual(1);
    });
});