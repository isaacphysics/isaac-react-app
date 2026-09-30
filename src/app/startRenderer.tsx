// Mounts the content editor preview renderer, after initI18n() (see src/index-*-renderer.tsx).
import React from "react";
import { createRoot } from "react-dom/client";
import { highlightJsService } from "./services/highlightJs";
import { EditorRenderer } from "./components/elements/EditorRenderer";

export function startRenderer(): void {
    void highlightJsService.registerLanguages();
    createRoot(document.getElementById("root")!).render(
        <React.StrictMode>
            <EditorRenderer />
        </React.StrictMode>,
    );
}
