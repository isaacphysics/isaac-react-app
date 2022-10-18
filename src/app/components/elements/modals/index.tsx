import {EditorMode} from "./inequality/constants";
import {FetchBaseQueryError} from "@reduxjs/toolkit/dist/query/fetchBaseQuery";
import {SerializedError} from "@reduxjs/toolkit";

export type ModalTypeRegistry = {
    "download-link": {link: string};
    "isaac-books": {};
    "eqn-editor-help": {editorMode: EditorMode};
    "login-or-sign-up": {};
    "book-chapter": {chapterTitle: string; chapterId: string; chapterSubject: string};
    "user-context-reconfirmation": {};
    "required-account-information": {};
    "gameboard-created-modal": {gameboardId: string | undefined, error: FetchBaseQueryError | SerializedError | undefined, resetBuilder: () => void};
};
export type ModalId = keyof ModalTypeRegistry;
