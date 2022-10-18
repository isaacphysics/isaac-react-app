import {EditorMode} from "./inequality/constants";

export type ModalTypeRegistry = {
    "download-link": {link: string},
    "isaac-books": {},
    "eqn-editor-help": {editorMode: EditorMode},
    "login-or-sign-up": {}
};
export type ModalId = keyof ModalTypeRegistry;
