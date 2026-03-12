import "regenerator-runtime/runtime";
import './scss/cs/isaac.scss';
import React from 'react';
import {highlightJsService} from "./app/services/highlightJs";
import {EditorRenderer} from "./app/components/elements/EditorRenderer";
import { createRoot } from "react-dom/client";

void highlightJsService.registerLanguages();

const root = createRoot(document.getElementById('root')!);

root.render(
    <React.StrictMode>
        <EditorRenderer />
    </React.StrictMode>
);
