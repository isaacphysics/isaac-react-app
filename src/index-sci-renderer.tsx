import "regenerator-runtime/runtime";
import './scss/phy/isaac.scss';
import React from 'react';
import { createRoot } from 'react-dom/client';
import {highlightJsService} from "./app/services/highlightJs";
import {EditorRenderer} from "./app/components/elements/EditorRenderer";
import "./i18n.ts";

void highlightJsService.registerLanguages();

const root = createRoot(document.getElementById('root')!);

root.render(
    <React.StrictMode>
        <EditorRenderer />
    </React.StrictMode>,
);
