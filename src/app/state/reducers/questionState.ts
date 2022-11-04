import {AppQuestionDTO, isValidatedChoice, ValidatedChoice} from "../../../IsaacAppTypes";
import {isDefined} from "../../services";
import {BEST_ATTEMPT_HIDDEN, ChoiceDTO, QuestionDTO} from "../../../IsaacApiTypes";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {isaacApi} from "../slices/api";
import produce, {Immutable} from "immer";

type QuestionsState = {questions: Immutable<AppQuestionDTO[]>; pageCompleted: boolean} | null;
function augmentQuestions(questions: Immutable<AppQuestionDTO[]>): QuestionsState {
    return {
        questions,
        pageCompleted: questions.every(q => q.validationResponse && q.validationResponse.correct)
    };
}

const updateQuestion = (id: string | undefined, update: (prevQuestion: Immutable<AppQuestionDTO>) => Immutable<AppQuestionDTO>) => {
    return (questionState: QuestionsState) => {
        return isDefined(id) && questionState ? augmentQuestions(questionState.questions.map(q => q.id === id ? update(q) : q)) : questionState;
    }
}
export const questionsSlice = createSlice({
    name: "questions",
    initialState: null as QuestionsState,
    reducers: {
        registerQuestions: (qs, action: PayloadAction<{questions: QuestionDTO[]; accordionClientId?: string}>) => {
            const currentQuestions = qs !== null ? [...qs.questions] : [];
            const {questions, accordionClientId} = action.payload;
            const newQuestions = questions.map(q => {
                const bestAttempt = q.bestAttempt;
                return bestAttempt ?
                    {...q, validationResponse: bestAttempt, currentAttempt: bestAttempt.answer, accordionClientId} :
                    {...q, accordionClientId};
            });
            return augmentQuestions([...currentQuestions, ...newQuestions]);
        },
        deregisterQuestions: (qs, action: PayloadAction<string[]>) => {
            const filteredQuestions = qs && qs.questions.filter((q) => q.id && !action.payload.includes(q.id));
            return filteredQuestions && filteredQuestions.length ? augmentQuestions(filteredQuestions) : null;
        },
        setCurrentAttempt: (qs, action: PayloadAction<{questionId: string; attempt: Immutable<ChoiceDTO | ValidatedChoice<ChoiceDTO>>}>) => {
            return updateQuestion(action.payload.questionId, produce(q => {
                if (isValidatedChoice(action.payload.attempt)) {
                    q.currentAttempt = action.payload.attempt.choice as ChoiceDTO; // FIXME remove these casts somehow
                    q.canSubmit = action.payload.attempt.frontEndValidation;
                } else {
                    q.currentAttempt = action.payload.attempt as ChoiceDTO;
                    q.canSubmit = true;
                }
                delete q.validationResponse;
            }))(qs);
        },
        lockQuestion: (qs, action: PayloadAction<{id: string, time: number}>) => {
            return updateQuestion(action.payload.id, produce(q => {
                q.locked = action.payload.time;
            }))(qs);
        },
        unlockQuestion: (qs, action: PayloadAction<string>) => {
            return updateQuestion(action.payload, produce(q => {
                delete q.locked;
            }))(qs);
        },
        markQuestionAsSubmitted: (qs, action: PayloadAction<string>) => {
            return updateQuestion(action.payload, produce(q => {
                q.canSubmit = false;
            }))(qs);
        }
    },
    extraReducers: builder => {
        builder.addMatcher(
            isaacApi.endpoints.attemptQuestion.matchPending,
            (qs, action) => {
                return updateQuestion(action.meta.arg.originalArgs.id, produce(q => {
                    q.canSubmit = false;
                }))(qs);
            }
        ).addMatcher(
            isaacApi.endpoints.attemptQuestion.matchFulfilled,
            (qs, action) => {
                return updateQuestion(action.payload.questionId, produce(q => {
                    if (!q.bestAttempt || !q.bestAttempt.correct) {
                        q.bestAttempt = action.payload;
                    }
                    q.validationResponse = action.payload;
                }))(qs);
            }
        ).addMatcher(
            isaacApi.endpoints.attemptQuestion.matchRejected,
            (qs, action) => {
                return updateQuestion(action.meta.arg.originalArgs.id, produce(q => {
                    q.canSubmit = true;
                }))(qs);
            }
        ).addMatcher(
            // If we receive user preferences, then check for the "hide question attempts" preference. If the preference is
            // there then we clear all attempt info from stored questions that have a best attempt, since the current attempt
            // could have been filled with the best attempt (see the case for `ACTION_TYPE.QUESTION_REGISTRATION` above)
            // This reducer case mainly occurs on page refresh/load, where the question attempt data is returned *before
            // the user preferences*, which means the `hidePreviousQuestionAttempt` middleware doesn't work as intended.
            isaacApi.endpoints.getUserPreferences.matchFulfilled,
            (qs, action) => {
                if (action.payload.DISPLAY_SETTING?.HIDE_QUESTION_ATTEMPTS) {
                    qs?.questions.forEach(q => {
                        if (q.bestAttempt) {
                            q.bestAttempt = BEST_ATTEMPT_HIDDEN;
                            delete q.currentAttempt;
                            delete q.validationResponse;
                        }
                    });
                }
            }
        )
    }
});

export const {registerQuestions, deregisterQuestions, setCurrentAttempt, lockQuestion, unlockQuestion} = questionsSlice.actions;
