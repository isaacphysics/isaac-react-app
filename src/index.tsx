import 'react-app-polyfill/ie9';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from "react-redux";
import {storeFactory} from "./app/state/store";
import IsaacApp from './app/components/IsaacApp';

const store = storeFactory({});
ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <IsaacApp />
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);
