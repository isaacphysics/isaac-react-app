import {ContentDTO} from "../../../IsaacApiTypes";
import {Action, Concepts, NOT_FOUND_TYPE} from "../../../IsaacAppTypes";
import {ACTION_TYPE, NOT_FOUND} from "../../services/constants";
import tags from "../../services/tags";
import {routerPageChange} from "../index";

type DocState = ContentDTO | NOT_FOUND_TYPE | null;
export const doc = (doc: DocState = null, action: Action) => {
    if (routerPageChange.match(action)) {
        return null;
    }
    switch (action.type) {
        case ACTION_TYPE.DOCUMENT_REQUEST:
            return null;
        case ACTION_TYPE.DOCUMENT_RESPONSE_SUCCESS:
            return {...tags.augmentDocWithSubject(action.doc)};
        case ACTION_TYPE.DOCUMENT_RESPONSE_FAILURE:
            return NOT_FOUND;
        default:
            return doc;
    }
};

type FragmentsState = {[name: string]: (ContentDTO | NOT_FOUND_TYPE)} | null;
export const fragments = (fragments: FragmentsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.FRAGMENT_RESPONSE_SUCCESS:
            return {...fragments, [action.id]: action.doc};
        case ACTION_TYPE.FRAGMENT_RESPONSE_FAILURE:
            return {...fragments, [action.id]: NOT_FOUND};
        default:
            return fragments;
    }
};

export type ConceptsState = Concepts | null;
export const concepts = (concepts: ConceptsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.CONCEPTS_RESPONSE_SUCCESS:
            return action.concepts;
        default:
            return concepts;
    }
};
