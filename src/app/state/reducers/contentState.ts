import {ContentDTO} from "../../../IsaacApiTypes";
import {Action, Concepts, NOT_FOUND_TYPE} from "../../../IsaacAppTypes";
import {ACTION_TYPE, NOT_FOUND, tags} from "../../services";
import {routerPageChange} from "../index";

export type ConceptsState = Concepts | null;
export const concepts = (concepts: ConceptsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.CONCEPTS_RESPONSE_SUCCESS:
            return action.concepts;
        default:
            return concepts;
    }
};
