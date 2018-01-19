import React from 'react';
import ReactDOM from 'react-dom';
import APP from './App';

it('renders without crashing', () => {
  const div = document.createElement('header');
  ReactDOM.render(<App />, div);
});
