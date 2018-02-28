
import React from 'react';
import ReactDOM from 'react-dom';
import './static/css/reset.css';
import { Provider } from 'react-redux';
import createStore from './store/index';
import {getPeerList} from './store/actions/peer/action-creators';
import {getBlockList} from './store/actions/block/action-creators';
import {getBlockInfo} from './store/actions/block/action-creators';
import {getChannelList} from './store/actions/chanelList/action-creators';
import './static/css/style.css';
import 'bootstrap/dist/css/bootstrap.css';
import App from './components/App/App';
import registerServiceWorker from './registerServiceWorker';
const store = createStore();
store.dispatch(getChannelList());
store.dispatch(getPeerList());
store.dispatch(getBlockList());
store.dispatch(getBlockInfo(0));

ReactDOM.render(
<Provider store={store} >
    <App />
</Provider>, document.getElementById('root')
);
registerServiceWorker();
