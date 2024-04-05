import {ContentSummaryDTO} from "../../../IsaacApiTypes";
import {Action} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services";

type QuestionSearchResultState = ContentSummaryDTO[] | null;
export const questionSearchResult = (questionSearchResult: QuestionSearchResultState = null, action: Action) => {
    switch(action.type) {
        case ACTION_TYPE.QUESTION_SEARCH_RESPONSE_SUCCESS: {
            return action.questions.map((question) => {
                return {...question, url: question.url && question.url.replace("/isaac-api/api/pages","")};
            });
        }
        case ACTION_TYPE.QUESTION_SEARCH_RESPONSE_FAILURE: {
            return null;
        }
        default: {
            return questionSearchResult;
        }
    }
};
