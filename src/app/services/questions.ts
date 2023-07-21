import React, {lazy} from "react";
import {AppQuestionDTO, IsaacQuestionProps, ValidatedChoice} from "../../IsaacAppTypes";
import {DOCUMENT_TYPE, REVERSE_GREEK_LETTERS_MAP_PYTHON, REVERSE_GREEK_LETTERS_MAP_LATEX} from './';
import {ChoiceDTO, ContentDTO, ContentSummaryDTO} from "../../IsaacApiTypes";
import {selectors, setCurrentAttempt, useAppDispatch, useAppSelector} from "../state";
import {Immutable} from "immer";
const IsaacMultiChoiceQuestion = lazy(() => import("../components/content/IsaacMultiChoiceQuestion"));
const IsaacItemQuestion = lazy(() => import("../components/content/IsaacItemQuestion"));
const IsaacReorderQuestion = lazy(() => import("../components/content/IsaacReorderQuestion"));
const IsaacParsonsQuestion = lazy(() => import("../components/content/IsaacParsonsQuestion"));
const IsaacNumericQuestion = lazy(() => import("../components/content/IsaacNumericQuestion"));
const IsaacStringMatchQuestion = lazy(() => import("../components/content/IsaacStringMatchQuestion"));
const IsaacRegexMatchQuestion = lazy(() => import("../components/content/IsaacRegexMatchQuestion"));
const IsaacFreeTextQuestion = lazy(() => import("../components/content/IsaacFreeTextQuestion"));
const IsaacSymbolicLogicQuestion = lazy(() => import("../components/content/IsaacSymbolicLogicQuestion"));
const IsaacSymbolicQuestion = lazy(() => import("../components/content/IsaacSymbolicQuestion"));
const IsaacSymbolicChemistryQuestion = lazy(() => import("../components/content/IsaacSymbolicChemistryQuestion"));
const IsaacGraphSketcherQuestion = lazy(() => import("../components/content/IsaacGraphSketcherQuestion"));
const IsaacClozeQuestion = lazy(() => import("../components/content/IsaacClozeQuestion"));
const IsaacCoordinateQuestion = lazy(() => import("../components/content/IsaacCoordinateQuestion"));

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
    "isaacSymbolicLogicQuestion": IsaacSymbolicLogicQuestion,
    "isaacGraphSketcherQuestion": IsaacGraphSketcherQuestion,
    "isaacClozeQuestion": IsaacClozeQuestion,
    "isaacCoordinateQuestion": IsaacCoordinateQuestion,
    "default": IsaacMultiChoiceQuestion
};

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

export const parsePseudoSymbolicAvailableSymbols = (availableSymbols?: string[]) => {
    if (!availableSymbols) return;
    const theseSymbols = availableSymbols.slice(0).map(s => s.trim());
    let i = 0;
    while (i < theseSymbols.length) {
        if (theseSymbols[i] === '_trigs') {
            theseSymbols.splice(i, 1, 'cos()', 'sin()', 'tan()');
            i += 3;
        } else if (theseSymbols[i] === '_1/trigs') {
            theseSymbols.splice(i, 1, 'cosec()', 'sec()', 'cot()');
            i += 3;
        } else if (theseSymbols[i] === '_inv_trigs') {
            theseSymbols.splice(i, 1, 'arccos()', 'arcsin()', 'arctan()');
            i += 3;
        } else if (theseSymbols[i] === '_inv_1/trigs') {
            theseSymbols.splice(i, 1, 'arccosec()', 'arcsec()', 'arccot()');
            i += 3;
        } else if (theseSymbols[i] === '_hyp_trigs') {
            theseSymbols.splice(i, 1, 'cosh()', 'sinh()', 'tanh()', 'cosech()', 'sech()', 'coth()');
            i += 6;
        } else if (theseSymbols[i] === '_inv_hyp_trigs') {
            theseSymbols.splice(i, 1, 'arccosh()', 'arcsinh()', 'arctanh()', 'arccosech()', 'arcsech()', 'arccoth()');
            i += 6;
        } else if (theseSymbols[i] === '_logs') {
            theseSymbols.splice(i, 1, 'log()', 'ln()');
            i += 2;
        } else if (theseSymbols[i] === '_no_alphabet') {
            theseSymbols.splice(i, 1);
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
