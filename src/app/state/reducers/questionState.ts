import {Action, AppQuestionDTO, isValidatedChoice} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services/constants";

export const question = (question: AppQuestionDTO, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.QUESTION_SET_CURRENT_ATTEMPT:
            if (isValidatedChoice(action.attempt)) {
                return {...question, currentAttempt: action.attempt.choice, canSubmit: action.attempt.frontEndValidation, validationResponse: undefined};
            } else {
                return {...question, currentAttempt: action.attempt, canSubmit: true, validationResponse: undefined};
            }
        case ACTION_TYPE.QUESTION_ATTEMPT_REQUEST:
            return {...question, canSubmit: false};
        case ACTION_TYPE.QUESTION_ATTEMPT_RESPONSE_SUCCESS:
            return (!question.bestAttempt || !question.bestAttempt.correct) ?
                {...question, validationResponse: action.response, bestAttempt: action.response} :
                {...question, validationResponse: action.response};
        case ACTION_TYPE.QUESTION_ATTEMPT_RESPONSE_FAILURE:
            return {...question, locked: action.lock, canSubmit: true};
        case ACTION_TYPE.QUESTION_UNLOCK:
            return {...question, locked: undefined};
        default:
            return question;
    }
};

type QuestionsState = {questions: AppQuestionDTO[]; pageCompleted: boolean} | null;
function augmentQuestions(questions: AppQuestionDTO[]): QuestionsState {
    return {
        questions,
        pageCompleted: questions.every(q => q.validationResponse && q.validationResponse.correct)
    }
}
export const questions = (qs: QuestionsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.QUESTION_REGISTRATION: {
            const currentQuestions = qs !== null ? [...qs.questions] : [];
            const newQuestions = action.questions.map(q => {
                const bestAttempt = q.bestAttempt;
                return bestAttempt ?
                    {...q, validationResponse: bestAttempt, currentAttempt: bestAttempt.answer, accordionClientId: action.accordionClientId} :
                    {...q, accordionClientId: action.accordionClientId};
            });
            return augmentQuestions(currentQuestions.concat(newQuestions));
        }
        case ACTION_TYPE.QUESTION_DEREGISTRATION: {
            const filteredQuestions = qs && qs.questions.filter((q) => q.id && !action.questionIds.includes(q.id));
            return filteredQuestions && filteredQuestions.length ? augmentQuestions(filteredQuestions) : null;
        }
        // Delegate processing the question matching action.questionId to the question reducer
        case ACTION_TYPE.QUESTION_SET_CURRENT_ATTEMPT:
        case ACTION_TYPE.QUESTION_ATTEMPT_REQUEST:
        case ACTION_TYPE.QUESTION_UNLOCK:
        case ACTION_TYPE.QUESTION_ATTEMPT_RESPONSE_FAILURE:
        case ACTION_TYPE.QUESTION_ATTEMPT_RESPONSE_SUCCESS: {
            return qs && augmentQuestions(qs.questions.map((q) => q.id === action.questionId ? question(q, action) : q));
        }
        default: {
            return qs;
        }
    }
};

// TODO Move this into questions to make it consistent?
type GraphSpecState = string[] | null;
export const graphSketcherSpec = (p: GraphSpecState = null, action: Action) => {
    switch(action.type) {
        case ACTION_TYPE.GRAPH_SKETCHER_GENERATE_SPECIFICATION_REQUEST:
            return null;
        case ACTION_TYPE.GRAPH_SKETCHER_GENERATE_SPECIFICATION_RESPONSE_SUCCESS:
            return { ...action.specResponse.results };
        case ACTION_TYPE.GRAPH_SKETCHER_GENERATE_SPECIFICATION_RESPONSE_FAILURE:
        default:
            return p;
    }
}
