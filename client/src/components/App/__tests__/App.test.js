/***
 * The snapshot artifact should be committed alongside code changes, 
 * and reviewed as part of your code review process.
 */

import React from "react";
import { mount, shallow } from "enzyme";
import Adapter from 'enzyme-adapter-react-16';
import configureStore from 'redux-mock-store';
import App from "../App";

const middlewares = []; // you can mock any middlewares here if necessary
const mockStore = configureStore(middlewares);

const initialState = {

};

describe('Testing App', () => {
  let wrapper
  it('renders as expected', () => {
    wrapper = shallow(
      <App />,
      { context: { store: mockStore(initialState) } },
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });


});
