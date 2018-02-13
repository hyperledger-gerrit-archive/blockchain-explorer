import React from "react";
import { mount, shallow } from "enzyme";
import Adapter from 'enzyme-adapter-react-16';
import configureStore from 'redux-mock-store';
import Layout from "../index";
import renderer from 'react-test-renderer';

const middlewares = [];
const mockStore = configureStore(middlewares);
const initialState = {};

describe('Testing Header component', () => {
    let wrapper;
    beforeEach(() => {
        wrapper = shallow(
        <Layout />,
            {context:{store:mockStore(initialState)}},
        );
    })
    expect(wrapper).toMatchSnapshot();
    it('wrapper length > 0 ', () => {
        expect(wrapper.length).toEqual(1);
    });
});