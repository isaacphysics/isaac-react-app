import {Action, Concepts} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services";

export type ConceptsState = Concepts | null;
export const concepts = (concepts: ConceptsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.CONCEPTS_RESPONSE_SUCCESS:
            return action.concepts;
        default:
            return concepts;
    }
};
