import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App/App';
import registerServiceWorker from './registerServiceWorker';
import './static/css/reset.css';
import './static/css/font-awesome.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './static/css/epoch.min.css';
import './static/css/vendor/bootstrap-tour.min.css';
import './static/css/style.css';


import { BrowserRouter } from 'react-router-dom'

ReactDOM.render((
  <BrowserRouter>
    <App />
  </BrowserRouter>
), document.getElementById('root'));
registerServiceWorker();
