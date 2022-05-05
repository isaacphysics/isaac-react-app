import {IsaacMultiChoiceQuestion} from "../components/content/IsaacMultiChoiceQuestion";
import {IsaacItemQuestion} from "../components/content/IsaacItemQuestion";
import {IsaacParsonsQuestion} from "../components/content/IsaacParsonsQuestion";
import {IsaacNumericQuestion} from "../components/content/IsaacNumericQuestion";
import {IsaacStringMatchQuestion} from "../components/content/IsaacStringMatchQuestion";
import {IsaacRegexMatchQuestion} from "../components/content/IsaacRegexMatchQuestion";
import {IsaacFreeTextQuestion} from "../components/content/IsaacFreeTextQuestion";
import {IsaacSymbolicLogicQuestion} from "../components/content/IsaacSymbolicLogicQuestion";
import {IsaacSymbolicQuestion} from "../components/content/IsaacSymbolicQuestion";
import {IsaacSymbolicChemistryQuestion} from "../components/content/IsaacSymbolicChemistryQuestion";
import {IsaacGraphSketcherQuestion} from "../components/content/IsaacGraphSketcherQuestion";
import {AppQuestionDTO, ValidatedChoice} from "../../IsaacAppTypes";
import {REVERSE_GREEK_LETTERS_MAP, DOCUMENT_TYPE} from '../services/constants';
import {ChoiceDTO, ContentDTO, ContentSummaryDTO} from "../../IsaacApiTypes";
import {IsaacClozeQuestion} from "../components/content/IsaacClozeQuestion";
import {useDispatch, useSelector} from "react-redux";
import {setCurrentAttempt} from "../state/actions";
import {selectors} from "../state/selectors";

export const QUESTION_TYPES = new Map([
    ["isaacMultiChoiceQuestion", IsaacMultiChoiceQuestion],
    ["isaacItemQuestion", IsaacItemQuestion],
    ["isaacParsonsQuestion", IsaacParsonsQuestion],
    ["isaacNumericQuestion", IsaacNumericQuestion],
    ["isaacSymbolicQuestion", IsaacSymbolicQuestion],
    ["isaacSymbolicChemistryQuestion", IsaacSymbolicChemistryQuestion],
    ["isaacStringMatchQuestion", IsaacStringMatchQuestion],
    ["isaacRegexMatchQuestion", IsaacRegexMatchQuestion],
    ["isaacFreeTextQuestion", IsaacFreeTextQuestion],
    ["isaacSymbolicLogicQuestion", IsaacSymbolicLogicQuestion],
    ["isaacGraphSketcherQuestion", IsaacGraphSketcherQuestion],
    ["isaacClozeQuestion", IsaacClozeQuestion],
    ["default", IsaacMultiChoiceQuestion]
]);

export const HUMAN_QUESTION_TYPES = new Map([
    ["isaacMultiChoiceQuestion", "Multiple choice"],
    ["isaacItemQuestion", "Item"],
    ["isaacParsonsQuestion", "Parsons"],
    ["isaacNumericQuestion", "Numeric"],
    ["isaacSymbolicQuestion", "Symbolic"],
    ["isaacSymbolicChemistryQuestion", "Chemistry"],
    ["isaacStringMatchQuestion", "String match"],
    ["isaacFreeTextQuestion", "Free text"],
    ["isaacSymbolicLogicQuestion", "Boolean logic"],
    ["isaacGraphSketcherQuestion", "Graph Sketcher"],
    ["isaacClozeQuestion", "Cloze drag and drop"],
    ["default", "Multiple choice"]
]);


export function isQuestion(doc: ContentDTO) {
    return QUESTION_TYPES.has(doc.type as string);
}

export const HUMAN_QUESTION_TAGS = new Map([
    ["maths_book", "Pre-University Mathematics for Sciences"],
    ["physics_skills_14", "Mastering Essential Pre-University Physics (2nd Edition)"],
    ["physics_skills_19", "Mastering Essential Pre-University Physics (3rd Edition)"],
    ["phys_book_gcse", "Mastering Essential GCSE Physics"],
    ["chemistry_16", "Mastering Essential Pre-University Physical Chemistry"],
]);

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
}

export function selectQuestionPart(questions?: AppQuestionDTO[], questionPartId?: string) {
    return questions?.filter(question => question.id == questionPartId)[0];
}

export function sanitiseInequalityState(state: any) {
    const saneState = JSON.parse(JSON.stringify(state));
    if (saneState.result?.tex) {
        saneState.result.tex = saneState.result.tex.split('').map((l: string) => REVERSE_GREEK_LETTERS_MAP[l] ? '\\' + REVERSE_GREEK_LETTERS_MAP[l] : l).join('');
    }
    if (saneState.result?.python) {
        saneState.result.python = saneState.result.python.split('').map((l: string) => REVERSE_GREEK_LETTERS_MAP[l] || l).join('');
    }
    if (saneState.result?.uniqueSymbols) {
        saneState.result.uniqueSymbols = saneState.result.uniqueSymbols.split('').map((l: string) => REVERSE_GREEK_LETTERS_MAP[l] || l).join('');
    }
    if (saneState.symbols) {
        for (const symbol of saneState.symbols) {
            if (symbol.expression.latex) {
                symbol.expression.latex = symbol.expression.latex.split('').map((l: string) => REVERSE_GREEK_LETTERS_MAP[l] ? '\\' + REVERSE_GREEK_LETTERS_MAP[l] : l).join('');
            }
            if (symbol.expression.python) {
                symbol.expression.python = symbol.expression.python.split('').map((l: string) => REVERSE_GREEK_LETTERS_MAP[l] || l).join('');
            }
        }
    }
    return saneState;
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
    const dispatch = useDispatch();
    const pageQuestions = useSelector(selectors.questions.getQuestions);
    const questionPart = selectQuestionPart(pageQuestions, questionId);
    return {
        currentAttempt: questionPart?.currentAttempt as (T | undefined),
        dispatchSetCurrentAttempt: (attempt: T | ValidatedChoice<T>) => dispatch(setCurrentAttempt(questionId, attempt)),
        questionPart: questionPart
    };
}
