import {ContentDTO} from "../../../IsaacApiTypes";
import {Action, Concepts, NOT_FOUND_TYPE} from "../../../IsaacAppTypes";
import {ACTION_TYPE, NOT_FOUND} from "../../services/constants";
import tags from "../../services/tags";

type DocState = ContentDTO | NOT_FOUND_TYPE | null;
export const doc = (doc: DocState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.DOCUMENT_REQUEST:
            return null;
        case ACTION_TYPE.DOCUMENT_RESPONSE_SUCCESS:
            return {...tags.augmentDocWithSubject(action.doc)};
        case ACTION_TYPE.ROUTER_PAGE_CHANGE:
            return null;
        case ACTION_TYPE.DOCUMENT_RESPONSE_FAILURE:
            return NOT_FOUND;
        default:
            return doc;
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
