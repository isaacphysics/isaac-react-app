import {ContentSummaryDTO, SearchResultsWrapper} from "../../../IsaacApiTypes";
import {Action} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services";

type QuestionSearchResultState = SearchResultsWrapper<ContentSummaryDTO> & {searchId?: string} | null;
export const questionSearchResult = (questionSearchResult: QuestionSearchResultState = null, action: Action) => {
    switch(action.type) {
        case ACTION_TYPE.QUESTION_SEARCH_RESPONSE_SUCCESS: {
            return {...action.questionResults, searchId: action.searchId};
        }
        case ACTION_TYPE.QUESTION_SEARCH_RESPONSE_FAILURE: {
            return null;
        }
        default: {
            return questionSearchResult;
        }
    }
};
