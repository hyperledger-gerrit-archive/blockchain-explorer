/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import { unwrap } from '@material-ui/core/test-utils';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import Adapter from 'enzyme-adapter-react-16';
import { createMuiTheme } from '@material-ui/core/styles';
import { PageNotFound } from './PageNotFound';

Enzyme.configure({ adapter: new Adapter() });

const ComponentNaked = unwrap(PageNotFound);

describe('<PageNotFound />', () => {
	it('with shallow', () => {
		const wrapper = shallow(<ComponentNaked classes={{}} />);
		console.log('shallow', wrapper.debug());
		expect(wrapper.exists()).toBe(true);
	});

	it('with mount', () => {
		const wrapper = mount(
			<MuiThemeProvider theme={createMuiTheme()}>
				<PageNotFound classes={{}} />
			</MuiThemeProvider>
		);
		expect(wrapper.exists()).toBe(true);
	});

	it('pagenotfound mount with dark', () => {
		const wrapper = mount(
			<MuiThemeProvider theme={createMuiTheme({ palette: { type: 'dark' } })}>
				<PageNotFound classes={{}} />
			</MuiThemeProvider>
		);
		expect(wrapper.exists()).toBe(true);
	});
});
