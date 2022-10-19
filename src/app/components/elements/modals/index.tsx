import {EditorMode} from "./inequality/constants";
import {FetchBaseQueryError} from "@reduxjs/toolkit/dist/query/fetchBaseQuery";
import {SerializedError} from "@reduxjs/toolkit";
import {UserBookingModalProps} from "./UserBookingModal";

// This is a list of modals that have proper support for being opened from anywhere using `openActiveModal`, along
// with the extra data you can pass to the modal to customise it. The extra data MUST BE SERIALISABLE!
export type ModalTypeRegistry = {
    "download-link": {link: string};
    "isaac-books": {};
    "eqn-editor-help": {editorMode: EditorMode};
    "login-or-sign-up": {};
    "book-chapter": {chapterTitle: string; chapterId: string; chapterSubject: string};
    "user-context-reconfirmation": {};
    "required-account-information": {};
    "user-booking-modal": UserBookingModalProps;
    "gameboard-created-modal": {gameboardId: string | undefined, error: FetchBaseQueryError | SerializedError | undefined, resetBuilder: () => void};
};
export type ModalId = keyof ModalTypeRegistry;
