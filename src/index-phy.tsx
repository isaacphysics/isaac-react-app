import "core-js/stable";
import "regenerator-runtime/runtime";
import './scss/phy/isaac.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from "react-redux";
import {store} from "./app/state";
import {IsaacApp} from './app/components/navigation/IsaacApp';
import {printAsciiArtLogoToConsole} from "./app/services/easterEggs/phyLogoAsciiArt";
import {Helmet} from "react-helmet";

printAsciiArtLogoToConsole();

// Start MSW to intercept requests that we want to mock responses to - uncomment to enable in browser
if (process.env.NODE_ENV !== 'production') {
    const {worker} = require('./mocks/browser');
    worker.start();
}

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            {/*
                Note: react-helmet's Helmet is the cause of the following StrictMode error for the following components: SideEffect(NullComponent)
                > UNSAFE_componentWillMount in strict mode is not recommended and may indicate bugs in your code. See https://reactjs.org/link/unsafe-component-lifecycles for details.
                We can wait until the library gets updated to not do this.
            */}
            <Helmet>
                {/* Any meta tags in the HTML marked as data-react-helmet="true" need to be duplicated here
                    or else they will be removed on pages that do not override them. But only specifying the
                    values here will stop most sites seeing them at all!
                 */}
                <meta name="description" content="Isaac Physics is a project designed to offer support and activities in physics problem solving to teachers and students from GCSE level through to university." />
                <meta property="og:title" content="Isaac Physics" />
                <meta property="og:description" content="Isaac Physics is a project designed to offer support and activities in physics problem solving to teachers and students from GCSE level through to university." />
            </Helmet>
            <IsaacApp />
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);
