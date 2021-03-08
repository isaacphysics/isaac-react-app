import "core-js/stable";
import "regenerator-runtime/runtime";
import './scss/cs/isaac.scss';
import hljs from 'highlight.js';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python'
import php from 'highlight.js/lib/languages/php'
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from "react-redux";
import {store} from "./app/state/store";
import {IsaacApp} from './app/components/navigation/IsaacApp';
import {printAsciiArtLogoToConsole} from "./app/services/easterEggs/csLogoAsciiArt";

printAsciiArtLogoToConsole();

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('php', php);

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <IsaacApp />
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);
