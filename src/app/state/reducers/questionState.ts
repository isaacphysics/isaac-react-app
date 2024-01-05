import { Action, AppQuestionDTO, isValidatedChoice } from "../../../IsaacAppTypes";
import { ACTION_TYPE, NOT_FOUND } from "../../services";
import { BEST_ATTEMPT_HIDDEN, IsaacQuestionPageDTO } from "../../../IsaacApiTypes";

export const question = (question: AppQuestionDTO, action: Action) => {
  switch (action.type) {
    case ACTION_TYPE.QUESTION_SET_CURRENT_ATTEMPT:
      if (isValidatedChoice(action.attempt)) {
        return {
          ...question,
          currentAttempt: action.attempt.choice,
          canSubmit: action.attempt.frontEndValidation,
          validationResponse: undefined,
        };
      } else {
        return { ...question, currentAttempt: action.attempt, canSubmit: true, validationResponse: undefined };
      }
    case ACTION_TYPE.QUESTION_ATTEMPT_REQUEST:
      return { ...question, canSubmit: false };
    case ACTION_TYPE.QUESTION_ATTEMPT_RESPONSE_SUCCESS:
      return !question.bestAttempt || !question.bestAttempt.correct
        ? { ...question, validationResponse: action.response, bestAttempt: action.response }
        : { ...question, validationResponse: action.response };
    case ACTION_TYPE.QUESTION_ATTEMPT_RESPONSE_FAILURE:
      return { ...question, locked: action.lock, canSubmit: true };
    case ACTION_TYPE.QUESTION_UNLOCK:
      return { ...question, locked: undefined };
    default:
      return question;
  }
};

type QuestionsState = { questions: AppQuestionDTO[]; pageCompleted: boolean } | null;
function augmentQuestions(questions: AppQuestionDTO[]): QuestionsState {
  return {
    questions,
    pageCompleted: questions.every((q) => q.validationResponse && q.validationResponse.correct),
  };
}
export const questions = (qs: QuestionsState = null, action: Action) => {
  switch (action.type) {
    case ACTION_TYPE.QUESTION_REGISTRATION: {
      const currentQuestions = qs !== null ? [...qs.questions] : [];
      const newQuestions = action.questions.map((q) => {
        const bestAttempt = q.bestAttempt;
        return bestAttempt
          ? {
              ...q,
              validationResponse: bestAttempt,
              currentAttempt: bestAttempt.answer,
              accordionClientId: action.accordionClientId,
            }
          : { ...q, accordionClientId: action.accordionClientId };
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
      return qs && augmentQuestions(qs.questions.map((q) => (q.id === action.questionId ? question(q, action) : q)));
    }
    // If we receive user preferences, then check for the "hide question attempts" preference. If the preference is
    // there then we clear all attempt info from stored questions that have a best attempt, since the current attempt
    // could have been filled with the best attempt (see the case for `ACTION_TYPE.QUESTION_REGISTRATION` above)
    // This reducer case mainly occurs on page refresh/load, where the question attempt data is returned *before
    // the user preferences*, which means the `hidePreviousQuestionAttempt` middleware doesn't work as intended.
    case ACTION_TYPE.USER_PREFERENCES_RESPONSE_SUCCESS:
      if (qs && action.userPreferences.DISPLAY_SETTING?.HIDE_QUESTION_ATTEMPTS) {
        return {
          ...qs,
          questions: qs.questions.map((q) =>
            q.bestAttempt
              ? {
                  ...q,
                  bestAttempt: BEST_ATTEMPT_HIDDEN,
                  currentAttempt: undefined,
                  validationResponse: undefined,
                }
              : q,
          ),
        };
      }
      return qs;
    default: {
      return qs;
    }
  }
};

type RandomQuestionsState = IsaacQuestionPageDTO[] | null;
export const randomQuestions = (randomQuestions: RandomQuestionsState = null, action: Action) => {
  switch (action.type) {
    case ACTION_TYPE.QUESTION_RANDOM_QUESTIONS_RESPONSE_FAILURE: {
      return NOT_FOUND;
    }
    case ACTION_TYPE.QUESTION_RANDOM_QUESTIONS_RESPONSE_SUCCESS: {
      return action.randomQuestions;
    }
    default: {
      return randomQuestions;
    }
  }
};
