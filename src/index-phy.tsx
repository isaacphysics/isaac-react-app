import "core-js/stable";
import "regenerator-runtime/runtime";
import './scss/phy/isaac.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from "react-redux";
import {store} from "./app/state/store";
import {IsaacApp} from './app/components/navigation/IsaacApp';
import {printAsciiArtLogoToConsole} from "./app/services/easterEggs/phyLogoAsciiArt";
import {Helmet} from "react-helmet";

printAsciiArtLogoToConsole();

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
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
