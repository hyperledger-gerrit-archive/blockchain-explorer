
import React from 'react';
import ReactDOM from 'react-dom';
import './static/css/reset.css';
import './static/css/style.css';
import App from './components/App/App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
