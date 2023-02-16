import "core-js/stable";
import "regenerator-runtime/runtime";
import './scss/cs/isaac.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from "react-redux";
import {store} from "./app/state";
import {IsaacApp} from './app/components/navigation/IsaacApp';
import {printAsciiArtLogoToConsoleCS, highlightJsService} from "./app/services";
import {Helmet} from "react-helmet";

printAsciiArtLogoToConsoleCS();
highlightJsService.registerLanguages();

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
                <meta name="description" content="Join Ada Computer Science, the free, online computer science programme for students and teachers. Learn with our computer science resources and questions." />
                <meta property="og:title" content="Ada Computer Science" />
                <meta property="og:description" content="Join Ada Computer Science, the free, online computer science programme for students and teachers. Learn with our computer science resources and questions." />
            </Helmet>
            <IsaacApp />
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);
