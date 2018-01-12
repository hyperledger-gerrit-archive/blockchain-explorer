import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App/App';
import registerServiceWorker from './registerServiceWorker';
import './static/css/reset.css';
import './static/css/style.css';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
