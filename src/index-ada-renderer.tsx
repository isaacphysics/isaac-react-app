import "core-js/stable";
import "regenerator-runtime/runtime";
import './scss/cs/isaac.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import {highlightJsService} from "./app/services";
import {EditorRenderer} from "./app/components/elements/EditorRenderer";

highlightJsService.registerLanguages();

ReactDOM.render(
    <React.StrictMode>
        <EditorRenderer />
    </React.StrictMode>,
    document.getElementById('root')
);
