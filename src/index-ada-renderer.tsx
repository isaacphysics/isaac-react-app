import "regenerator-runtime/runtime";
import './scss/cs/isaac.scss';
import { initI18n } from "./i18n";

// Load translations before importing the renderer (see index-ada.tsx)
void initI18n()
    .then(() => import("./app/startRenderer"))
    .then(({ startRenderer }) => startRenderer());
