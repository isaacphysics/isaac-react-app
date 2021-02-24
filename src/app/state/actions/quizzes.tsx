import {Dispatch} from "react";
import {Action} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services/constants";
import {api} from "../../services/api";
import {showErrorToastIfNeeded} from "../actions";

export const loadQuizzes = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUIZZES_REQUEST});
    try {
        const quizzes = await api.quizzes.available();
        dispatch({type: ACTION_TYPE.QUIZZES_RESPONSE_SUCCESS, quizzes: quizzes.data});
    } catch (e) {
        dispatch(showErrorToastIfNeeded("Loading quizzes failed", e));
    }
};
