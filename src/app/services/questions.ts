import React, {ContextType, lazy} from "react";
import {AppQuestionDTO, InlineContext, IsaacQuestionProps, ValidatedChoice} from "../../IsaacAppTypes";
import {ChoiceDTO, ContentDTO, ContentSummaryDTO, GameboardDTO} from "../../IsaacApiTypes";
import {DOCUMENT_TYPE, REVERSE_GREEK_LETTERS_MAP_PYTHON, REVERSE_GREEK_LETTERS_MAP_LATEX, persistence, KEY, trackEvent, isLoggedIn, isNotPartiallyLoggedIn, wasTodayUTC} from './';
import {attemptQuestion, saveGameboard, selectors, setCurrentAttempt, useAppDispatch, useAppSelector} from "../state";
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
const IsaacCoordinateQuestion = lazy(() => import("../components/content/IsaacCoordinateQuestion"));
const IsaacInlineRegion = lazy(() => import("../components/content/IsaacInlineRegion"));

export const HUMAN_QUESTION_TYPES: {[key: string]: string} = {
    "isaacMultiChoiceQuestion": "Multiple choice",
    "isaacItemQuestion": "Item",
    "isaacReorderQuestion": "Reorder",
    "isaacParsonsQuestion": "Parsons",
    "isaacNumericQuestion": "Numeric",
    "isaacSymbolicQuestion": "Symbolic",
    "isaacSymbolicChemistryQuestion": "Chemistry",
    "isaacStringMatchQuestion": "String match",
    "isaacFreeTextQuestion": "Free text",
    "isaacLLMFreeTextQuestion": "LLM-marked free text",
    "isaacSymbolicLogicQuestion": "Boolean logic",
    "isaacGraphSketcherQuestion": "Graph Sketcher",
    "isaacClozeQuestion": "Cloze drag and drop",
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
    "isaacCoordinateQuestion": IsaacCoordinateQuestion,
    "isaacInlineRegion": IsaacInlineRegion, // This exists in the question types list to wrap the inline questions into a single answerable component
    "default": IsaacMultiChoiceQuestion
};

export const RESTRICTED_QUESTION_TYPES = ["isaacLLMFreeTextQuestion"];

export function isQuestion(doc: ContentDTO) {
    return doc.type ? doc.type in QUESTION_TYPES : false;
}

export const HUMAN_QUESTION_TAGS = new Map([
    ["phys_book_step_up", "Step up to GCSE Physics"],
    ["phys_book_gcse", "Mastering Essential GCSE Physics"],
    ["physics_skills_14", "Mastering Essential Pre-University Physics (2nd Edition)"],
    ["physics_skills_19", "Mastering Essential Pre-University Physics (3rd Edition)"],
    ["physics_linking_concepts", "Linking Concepts in Pre-University Physics"],
    ["maths_book_gcse", "Using Essential GCSE Mathematics"],
    ["maths_book", "Pre-University Mathematics for Sciences"],
    ["chemistry_16", "Mastering Essential Pre-University Physical Chemistry"]
]);

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

// Inequality specific functions

export function sanitiseInequalityState(state: any) {
    const saneState = JSON.parse(JSON.stringify(state));
    if (saneState.result?.tex) {
        saneState.result.tex = saneState.result.tex.split('').map((l: string) => REVERSE_GREEK_LETTERS_MAP_LATEX[l] ? '\\' + REVERSE_GREEK_LETTERS_MAP_LATEX[l] : l).join('');
    }
    if (saneState.result?.python) {
        saneState.result.python = saneState.result.python.split('').map((l: string) => REVERSE_GREEK_LETTERS_MAP_PYTHON[l] || l).join('');
    }
    if (saneState.result?.uniqueSymbols) {
        saneState.result.uniqueSymbols = saneState.result.uniqueSymbols.split('').map((l: string) => REVERSE_GREEK_LETTERS_MAP_PYTHON[l] || l).join('');
    }
    if (saneState.symbols) {
        for (const symbol of saneState.symbols) {
            if (symbol.expression.latex) {
                symbol.expression.latex = symbol.expression.latex.split('').map((l: string) => REVERSE_GREEK_LETTERS_MAP_LATEX[l] ? '\\' + REVERSE_GREEK_LETTERS_MAP_LATEX[l] : l).join('');
            }
            if (symbol.expression.python) {
                symbol.expression.python = symbol.expression.python.split('').map((l: string) => REVERSE_GREEK_LETTERS_MAP_PYTHON[l] || l).join('');
            }
        }
    }
    return saneState;
}

const pseudoToSymbolDict: {[key: string]: string[]} = {
    // Maths pseudosymbols
    '_trigs': ['cos()', 'sin()', 'tan()'],
    '_1/trigs': ['cosec()', 'sec()', 'cot()'],
    '_inv_trigs': ['arccos()', 'arcsin()', 'arctan()'],
    '_inv_1/trigs': ['arccosec()', 'arcsec()', 'arccot()'],
    '_hyp_trigs': ['cosh()', 'sinh()', 'tanh()', 'cosech()', 'sech()', 'coth()'],
    '_inv_hyp_trigs': ['arccosh()', 'arcsinh()', 'arctanh()', 'arccosech()', 'arcsech()', 'arccoth()'],
    '_logs': ['log()', 'ln()'],
    '_no_alphabet': [],
    // Chemistry pseudosymbols
    '_state_symbols': ['(s)', '(l)', '(g)', '(aq)'],
    '_plus': [],
    '_minus': [],
    '_fraction': [],
    '_right_arrow': [],
    '_equilibrium_arrow': [],
    '_brackets_round': [],
    '_brackets_square': [],
    '_dot': [],
    // Previously adding a pseudosymbol to an empty list would add a comma and so cause this empty string to be in the list of available symbols
    '': [] 
};

export const parsePseudoSymbolicAvailableSymbols = (availableSymbols?: string[]) => {
    if (!availableSymbols) return;

    const theseSymbols = availableSymbols.slice(0).map(s => s.trim());
    let i = 0;
    while (i < theseSymbols.length) {
        const currentSymbol = theseSymbols[i];
        if (currentSymbol in pseudoToSymbolDict) {
            const translatedSymbols = pseudoToSymbolDict[currentSymbol];
            theseSymbols.splice(i, 1, ...translatedSymbols);
            i += translatedSymbols.length;
        } else {
            i += 1;
        }
    }
    return theseSymbols;
};

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

export const submitCurrentAttempt = (questionPart: AppQuestionDTO | undefined, docId: string, questionType: string, currentGameboard: GameboardDTO | undefined, currentUser: any, dispatch: any, inlineContext?: ContextType<typeof InlineContext>) => {
    if (questionPart?.currentAttempt) {
        // Notify Plausible that at least one question attempt has taken place today
        if (persistence.load(KEY.INITIAL_DAILY_QUESTION_ATTEMPT_TIME) == null || !wasTodayUTC(persistence.load(KEY.INITIAL_DAILY_QUESTION_ATTEMPT_TIME))) {
            persistence.save(KEY.INITIAL_DAILY_QUESTION_ATTEMPT_TIME, new Date().toString());
            trackEvent("question_attempted");
        }

        dispatch(attemptQuestion(docId, questionPart?.currentAttempt, questionType, currentGameboard?.id, inlineContext));

        if (isLoggedIn(currentUser) && isNotPartiallyLoggedIn(currentUser) && currentGameboard?.id && !currentGameboard.savedToCurrentUser) {
            dispatch(saveGameboard({
                boardId: currentGameboard.id,
                user: currentUser,
                redirectOnSuccess: false
            }));
        }
    }
};

export const getMostRecentCorrectAttemptDate = (questions: AppQuestionDTO[] | undefined) => {
    return questions?.filter(q => q.bestAttempt?.correct).map(q => q.bestAttempt?.dateAttempted).reduce((prev, current) => {
        if (!prev) return current;
        if (!current) return prev;
        return prev > current ? prev : current;
    }, undefined);
};
