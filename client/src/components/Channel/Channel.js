import React, { Component } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

// Dummy channel data set, the /channellist API integration should take place here once it is avaialble
const channelList = (new Array(10)).fill().map((v,i) => ({ value: `channel${i+1}`, label: `Channel ${i+1}` }));

class Channel extends Component {

  constructor(props) {
    super(props);
  }
  componentWillMount() {
    this.setState({ selectedOption: channelList[0] });
  }
  state = {
    selectedOption: '',
  }
  handleChange = (selectedOption) => {
    this.setState({ selectedOption: selectedOption });
  }

  render() {
    return (
      <div className='channel-dropdown'>
        <Select
          placeholder='Select Channel...'
          required='true'
          name="form-field-name"
          value={this.state.selectedOption}
          onChange={this.handleChange}
          options={channelList} />
      </div>
    );
  }
}
export default Channel;
