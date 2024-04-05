import { Action } from "../../../IsaacAppTypes";
import { ACTION_TYPE } from "../../services";

export const totalQuestionSearchResults = (totalQuestionSearchResult: number | null = null, action: Action) => {
    switch(action.type) {
        case ACTION_TYPE.QUESTION_SEARCH_RESPONSE_SUCCESS: {
            return action.totalQuestionSearchResults;
        }
        case ACTION_TYPE.QUESTION_SEARCH_RESPONSE_FAILURE: {
            return null;
        }
        default: {
            return totalQuestionSearchResult;
        }
    }
};
