import "regenerator-runtime/runtime";
import './scss/cs/isaac.scss';
import { initI18n } from "./i18n";

// Load translations before importing the app: some modules translate text when they are first imported.
void initI18n()
    .then(() => import("./app/startApp"))
    .then(({ startApp }) => startApp());
