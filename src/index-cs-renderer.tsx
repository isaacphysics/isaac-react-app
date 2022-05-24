import "core-js/stable";
import "regenerator-runtime/runtime";
import './scss/cs/isaac.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import * as highlightJsService from "./app/services/highlightJs";
import {EditorRenderer} from "./app/components/elements/EditorRenderer";

highlightJsService.registerLanguages();

ReactDOM.render(
    <React.StrictMode>
        <EditorRenderer />
    </React.StrictMode>,
    document.getElementById('root')
);
