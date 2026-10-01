import "regenerator-runtime/runtime";
import './scss/cs/isaac.scss';
import React from 'react';
import { createRoot } from "react-dom/client";
import { initI18n } from "./i18n";

// Load translations before importing the renderer: some modules translate text when they are first imported.
void initI18n().then(async () => {
    const { highlightJsService } = await import("./app/services/highlightJs");
    const { EditorRenderer } = await import("./app/components/elements/EditorRenderer");
    void highlightJsService.registerLanguages();
    createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <EditorRenderer />
        </React.StrictMode>,
    );
});
