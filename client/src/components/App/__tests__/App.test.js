import React from "react";
import {
  mount,
  shallow
} from "enzyme";
import Adapter from 'enzyme-adapter-react-16';
import configureStore from 'redux-mock-store';
import App from "../App";

const middlewares = [];
const mockStore = configureStore(middlewares);
const initialState = {};

describe('Testing App', () => {
  let wrapper;
  it('renders as expected', () => {
    wrapper = shallow( <App /> , {
        context: {
          store: mockStore(initialState)
        }
      }, );
    expect(wrapper.dive()).toMatchSnapshot();
  });
});