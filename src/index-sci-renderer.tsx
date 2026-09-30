import "regenerator-runtime/runtime";
import './scss/phy/isaac.scss';
import { initI18n } from "./i18n";

// Load translations before importing the renderer (see index-sci.tsx)
void initI18n()
    .then(() => import("./app/startRenderer"))
    .then(({ startRenderer }) => startRenderer());
