import {Action, FasttrackConceptsState} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services";

export const fasttrackConcepts = (state: FasttrackConceptsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.FASTTRACK_CONCEPTS_RESPONSE_SUCCESS:
            return action.concepts;
        default:
            return state;
    }
};
