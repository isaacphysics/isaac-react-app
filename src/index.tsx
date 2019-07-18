import "core-js/stable";
import './scss/isaac.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from "react-redux";
import {store} from "./app/state/store";
import IsaacApp from './app/components/navigation/IsaacApp';

let rootElement = document.getElementById('root');

if (rootElement) {

    // Cannot add this class to the root element without JavaScript because
    // it messes up the page formatting for the <noscript> case!
    rootElement.classList.add("min-vh-100");

    ReactDOM.render(
        <React.StrictMode>
            <Provider store={store}>
                <IsaacApp />
            </Provider>
        </React.StrictMode>,
        rootElement
    );
}
