import {EditorMode} from "./inequality/constants";

export type ModalTypeRegistry = {
    "download-link": {link: string};
    "isaac-books": {};
    "eqn-editor-help": {editorMode: EditorMode};
    "login-or-sign-up": {};
    "book-chapter": {chapterTitle: string; chapterId: string; chapterSubject: string};
    "user-context-reconfirmation": {};
    "required-account-information": {};
};
export type ModalId = keyof ModalTypeRegistry;
