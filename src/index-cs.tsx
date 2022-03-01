import "core-js/stable";
import "regenerator-runtime/runtime";
import './scss/cs/isaac.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from "react-redux";
import {store} from "./app/state/store";
import {IsaacApp} from './app/components/navigation/IsaacApp';
import {printAsciiArtLogoToConsole} from "./app/services/easterEggs/csLogoAsciiArt";
import * as highlightJsService from "./app/services/highlightJs";
import {Helmet} from "react-helmet";

printAsciiArtLogoToConsole();
highlightJsService.registerLanguages();

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <Helmet>
                {/* Any meta tags in the HTML marked as data-react-helmet="true" need to be duplicated here
                    or else they will be removed on pages that do not override them. But only specifying the
                    values here will stop most sites seeing them at all!
                 */}
                <meta name="description" content="Isaac Computer Science is a free online learning platform for A level, funded by the Department for Education." />
                <meta property="og:title" content="Isaac Computer Science" />
                <meta property="og:description" content="Isaac Computer Science is a free online learning platform for A level, funded by the Department for Education." />
            </Helmet>
            <IsaacApp />
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);
