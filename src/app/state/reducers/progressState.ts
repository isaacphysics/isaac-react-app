import {Action} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services/constants";
import {AnsweredQuestionsByDate} from "../../../IsaacApiTypes";

type MyAnsweredQuestionsByDateState = AnsweredQuestionsByDate | null;
export const myAnsweredQuestionsByDate = (myAnsweredQuestionsByDateState: MyAnsweredQuestionsByDateState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.MY_QUESTION_ANSWERS_BY_DATE_REQUEST: {
            return null;
        }
        case ACTION_TYPE.MY_QUESTION_ANSWERS_BY_DATE_RESPONSE_SUCCESS: {
            return action.myAnsweredQuestionsByDate;
        }
        default: {
            return myAnsweredQuestionsByDateState;
        }
    }
};

type UserAnsweredQuestionsByDateState = AnsweredQuestionsByDate | null;
export const userAnsweredQuestionsByDate = (userAnsweredQuestionsByDateState: UserAnsweredQuestionsByDateState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.USER_QUESTION_ANSWERS_BY_DATE_REQUEST: {
            return null;
        }
        case ACTION_TYPE.USER_QUESTION_ANSWERS_BY_DATE_RESPONSE_SUCCESS: {
            return action.userAnsweredQuestionsByDate;
        }
        default: {
            return userAnsweredQuestionsByDateState;
        }
    }
};
