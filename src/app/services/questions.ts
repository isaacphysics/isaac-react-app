import React, {ContextType, lazy} from "react";
import {AppQuestionDTO, InlineContext, IsaacQuestionProps, PageContextState, ValidatedChoice} from "../../IsaacAppTypes";
import {ChoiceDTO, CompletionState, ContentDTO, ContentSummaryDTO, GameboardDTO} from "../../IsaacApiTypes";
import {DOCUMENT_TYPE, persistence, KEY, trackEvent, wasTodayUTC, PHY_NAV_SUBJECTS, isSingleStageContext, isFullyDefinedContext} from './';
import {attemptQuestion, selectors, setCurrentAttempt, useAppDispatch, useAppSelector} from "../state";
import {Immutable} from "immer";
const IsaacMultiChoiceQuestion = lazy(() => import("../components/content/IsaacMultiChoiceQuestion"));
const IsaacItemQuestion = lazy(() => import("../components/content/IsaacItemQuestion"));
const IsaacReorderQuestion = lazy(() => import("../components/content/IsaacReorderQuestion"));
const IsaacParsonsQuestion = lazy(() => import("../components/content/IsaacParsonsQuestion"));
const IsaacNumericQuestion = lazy(() => import("../components/content/IsaacNumericQuestion"));
const IsaacStringMatchQuestion = lazy(() => import("../components/content/IsaacStringMatchQuestion"));
const IsaacRegexMatchQuestion = lazy(() => import("../components/content/IsaacRegexMatchQuestion"));
const IsaacFreeTextQuestion = lazy(() => import("../components/content/IsaacFreeTextQuestion"));
const IsaacLLMFreeTextQuestion = lazy(() => import("../components/content/IsaacLLMFreeTextQuestion"));
const IsaacSymbolicLogicQuestion = lazy(() => import("../components/content/IsaacSymbolicLogicQuestion"));
const IsaacSymbolicQuestion = lazy(() => import("../components/content/IsaacSymbolicQuestion"));
const IsaacSymbolicChemistryQuestion = lazy(() => import("../components/content/IsaacSymbolicChemistryQuestion"));
const IsaacGraphSketcherQuestion = lazy(() => import("../components/content/IsaacGraphSketcherQuestion"));
const IsaacClozeQuestion = lazy(() => import("../components/content/IsaacClozeQuestion"));
const IsaacDragAndDropQuestion = lazy(() => import("../components/content/IsaacDragAndDropQuestion"));
const IsaacCoordinateQuestion = lazy(() => import("../components/content/IsaacCoordinateQuestion"));
const IsaacInlineRegion = lazy(() => import("../components/content/IsaacInlineRegion"));

export const HUMAN_QUESTION_TYPES: {[key: string]: string} = {
    "isaacMultiChoiceQuestion": "Multiple choice",
    "isaacItemQuestion": "Item",
    "isaacReorderQuestion": "Reorder",
    "isaacParsonsQuestion": "Parsons",
    "isaacNumericQuestion": "Numeric",
    "isaacSymbolicQuestion": "Algebraic",
    "isaacSymbolicChemistryQuestion": "Symbolic chemistry",
    "isaacStringMatchQuestion": "Text entry",
    "isaacRegexMatchQuestion": "Regex match",
    "isaacFreeTextQuestion": "Free text",
    "isaacLLMFreeTextQuestion": "LLM-marked free text",
    "isaacSymbolicLogicQuestion": "Boolean logic",
    "isaacGraphSketcherQuestion": "Graph sketcher",
    "isaacClozeQuestion": "Drag and drop",
    "isaacCoordinateQuestion": "Coordinate",
    "default": "Multiple choice"
};

export const QUESTION_TYPES: {[key: string]: React.LazyExoticComponent<({doc, questionId, readonly}: IsaacQuestionProps<any>) => JSX.Element>} = {
    "isaacMultiChoiceQuestion": IsaacMultiChoiceQuestion,
    "isaacItemQuestion": IsaacItemQuestion,
    "isaacReorderQuestion": IsaacReorderQuestion,
    "isaacParsonsQuestion": IsaacParsonsQuestion,
    "isaacNumericQuestion": IsaacNumericQuestion,
    "isaacSymbolicQuestion": IsaacSymbolicQuestion,
    "isaacSymbolicChemistryQuestion": IsaacSymbolicChemistryQuestion,
    "isaacStringMatchQuestion": IsaacStringMatchQuestion,
    "isaacRegexMatchQuestion": IsaacRegexMatchQuestion,
    "isaacFreeTextQuestion": IsaacFreeTextQuestion,
    "isaacLLMFreeTextQuestion": IsaacLLMFreeTextQuestion,
    "isaacSymbolicLogicQuestion": IsaacSymbolicLogicQuestion,
    "isaacGraphSketcherQuestion": IsaacGraphSketcherQuestion,
    "isaacClozeQuestion": IsaacClozeQuestion,
    "isaacDndQuestion": IsaacDragAndDropQuestion,
    "isaacCoordinateQuestion": IsaacCoordinateQuestion,
    "isaacInlineRegion": IsaacInlineRegion, // This exists in the question types list to wrap the inline questions into a single answerable component
    "default": IsaacMultiChoiceQuestion
};

export const RESTRICTED_QUESTION_TYPES = ["isaacLLMFreeTextQuestion"];

export const PROGRESS_QUESTION_TYPE_MAP : {[key: string]: string[]} = {
    "isaacStringMatchQuestion": ["isaacStringMatchQuestion", "isaacRegexMatchQuestion", "isaacFreeTextQuestion"],
    "isaacMultiChoiceQuestion": ["isaacMultiChoiceQuestion", "isaacItemQuestion"],
};

export function isQuestion(doc: ContentDTO) {
    return doc.type ? doc.type in QUESTION_TYPES : false;
}

export function selectQuestionPart(questions?: AppQuestionDTO[], questionPartId?: string) {
    return questions?.filter(question => question.id == questionPartId)[0];
}

function fastTrackConceptEnumerator(questionId: string) {
    // Magic, unfortunately
    return "_abcdefghijk".indexOf(questionId.split('_')[2].slice(-1));
}

export function generateQuestionTitle(doc : ContentDTO | ContentSummaryDTO) {
    let title = doc.title as string;

    // FastTrack title renaming
    if (doc.type === DOCUMENT_TYPE.FAST_TRACK_QUESTION && doc.id
        && (doc.tags?.includes('ft_upper') || doc.tags?.includes('ft_lower'))) {
        title += " " + fastTrackConceptEnumerator(doc.id) + (doc.tags.includes('ft_lower') ? "ii" : "i");
    }

    return title;
}

/**
 * Essentially a useState for the current question attempt - used in all question components.
 * @param questionId  id of the question to return the current attempt of
 */
export function useCurrentQuestionAttempt<T extends ChoiceDTO>(questionId: string) {
    const dispatch = useAppDispatch();
    const pageQuestions = useAppSelector(selectors.questions.getQuestions);
    const questionPart = selectQuestionPart(pageQuestions, questionId);
    return {
        currentAttempt: questionPart?.currentAttempt as (Immutable<T> | undefined),
        dispatchSetCurrentAttempt: (attempt: Immutable<T | ValidatedChoice<T>>) => dispatch(setCurrentAttempt(questionId, attempt)),
        questionPart: questionPart
    };
}

export const submitCurrentAttempt = (questionPart: AppQuestionDTO | undefined, docId: string, questionType: string, currentGameboard: GameboardDTO | undefined, currentUser: any, dispatch: any, inlineContext?: ContextType<typeof InlineContext>): Promise<void> => {
    if (questionPart?.currentAttempt) {
        // Notify Plausible that at least one question attempt has taken place today
        if (persistence.load(KEY.INITIAL_DAILY_QUESTION_ATTEMPT_TIME) == null || !wasTodayUTC(persistence.load(KEY.INITIAL_DAILY_QUESTION_ATTEMPT_TIME))) {
            persistence.save(KEY.INITIAL_DAILY_QUESTION_ATTEMPT_TIME, new Date().toString());
            trackEvent("question_attempted");
        }

        const attempt = dispatch(attemptQuestion(docId, questionPart?.currentAttempt, questionType, currentGameboard?.id, inlineContext));

        return attempt;
    }
    return Promise.resolve();
};

export const getMostRecentCorrectAttemptDate = (questions: AppQuestionDTO[] | undefined) => {
    return questions?.filter(q => q.bestAttempt?.correct).map(q => q.bestAttempt?.dateAttempted).reduce((prev, current) => {
        if (!prev) return current;
        if (!current) return prev;
        return prev > current ? prev : current;
    }, undefined);
};

const questionPlaceholdersByContext: {[subject in keyof typeof PHY_NAV_SUBJECTS]: {[stage in typeof PHY_NAV_SUBJECTS[subject][number]]: string}} = {
    "physics": {
        "11_14": "New Planet",
        "gcse": "Momentum of a Whale",
        "a_level": "Man vs. Horse",
        "university": "Light Clock",
    },
    "chemistry": {
        "gcse": "Catalyser",
        "a_level": "Keep Hydrated",
        "university": "Propanal Problem",
    },
    "maths": {
        "gcse": "Density of Air",
        "a_level": "Crossing Paths",
        "university": "Hyperbolic Integrals",
    },
    "biology": {
        "a_level": "Adrenaline",
        "gcse": "Mystery Cell"
    },
};

export const getQuestionPlaceholder = (context: PageContextState): string => {
    if (!isFullyDefinedContext(context) || !isSingleStageContext(context)) return questionPlaceholdersByContext["physics"]["a_level"];
    return questionPlaceholdersByContext[context.subject][context.stage[0] as keyof typeof questionPlaceholdersByContext[typeof context.subject]];
};

export const calculateQuestionSetCompletionState = (questions?: AppQuestionDTO[]) : CompletionState | undefined => {
    if (questions && questions.length > 0) {
        let allCorrect = true;
        let allWrong = true;
        let allValidated = true;
        let anyValidated = false;
        questions.forEach(question => {
            if (question.validationResponse) {
                const correct = question.validationResponse.correct;
                if (correct) {
                    allWrong = false;
                } else {
                    allCorrect = false;
                }
                anyValidated = true;
            } else {
                allValidated = false;
            }
        });
        if (allValidated && allCorrect) return CompletionState.ALL_CORRECT;
        else if (allValidated && allWrong) return CompletionState.ALL_INCORRECT;
        else if (allValidated) return CompletionState.ALL_ATTEMPTED;
        else if (anyValidated) return CompletionState.IN_PROGRESS;
        else return CompletionState.NOT_ATTEMPTED;
    }
};
