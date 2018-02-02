import React from 'react';
import ReactDOM from 'react-dom';
import BlocksChart from './BlocksChart';


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<BlocksChart />, div);
 
});
