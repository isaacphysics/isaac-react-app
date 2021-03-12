import React, {Dispatch} from "react";
import {Action} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services/constants";
import {api} from "../../services/api";
import {closeActiveModal, loadGroups, openActiveModal, showErrorToastIfNeeded} from "../actions";
import {ContentSummaryDTO, QuizAssignmentDTO, QuizFeedbackMode} from "../../../IsaacApiTypes";
import {AppDispatch} from "../store";
import {WithLoadedSelector} from "../../components/handlers/ShowLoading";
import {selectors} from "../selectors";
import {QuizSettingModal} from "../../components/elements/modals/QuizSettingModal";

export const loadQuizzes = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUIZZES_REQUEST});
    try {
        const quizzes = await api.quizzes.available();
        dispatch({type: ACTION_TYPE.QUIZZES_RESPONSE_SUCCESS, quizzes: quizzes.data});
    } catch (e) {
        dispatch(showErrorToastIfNeeded("Loading quizzes failed", e));
    }
};

export const setQuiz = (assignment: QuizAssignmentDTO) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUIZ_SET_REQUEST, assignment});
    try {
        const newAssignment = await api.quizzes.createQuizAssignment(assignment);
        dispatch({type: ACTION_TYPE.QUIZ_SET_RESPONSE_SUCCESS, newAssignment: newAssignment.data});
        return newAssignment;
    } catch (e) {
        dispatch(showErrorToastIfNeeded("Quiz setting failed", e));
        throw e;
    }
};

export const showQuizSettingModal = (quiz: ContentSummaryDTO, dueDate?: Date | null, feedbackMode?: QuizFeedbackMode | null) => (dispatch: AppDispatch) => {
    dispatch(openActiveModal({
        closeAction: () => {
            dispatch(closeActiveModal())
        },
        title: "Setting quiz " + (quiz.title ?? quiz.id),
        body: <WithLoadedSelector
            selector={selectors.groups.active}
            loadingThunk={() => dispatch(loadGroups(false))}
            thenRender={groups => <QuizSettingModal quiz={quiz} groups={groups} dueDate={dueDate} feedbackMode={feedbackMode}/>}
        />
    }));
}

export const loadQuizAssignments = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUIZ_ASSIGNMENTS_REQUEST});
    try {
        const assignments = await api.quizzes.assignments();
        dispatch({type: ACTION_TYPE.QUIZ_ASSIGNMENTS_RESPONSE_SUCCESS, assignments: assignments.data});
    } catch (e) {
        dispatch(showErrorToastIfNeeded("Loading quiz assignments failed", e));
    }
};
