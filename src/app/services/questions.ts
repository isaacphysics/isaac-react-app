import {IsaacMultiChoiceQuestion} from "../components/content/IsaacMultiChoiceQuestion";
import {IsaacItemQuestion} from "../components/content/IsaacItemQuestion";
import {IsaacParsonsQuestion} from "../components/content/IsaacParsonsQuestion";
import {IsaacNumericQuestion} from "../components/content/IsaacNumericQuestion";
import {IsaacStringMatchQuestion} from "../components/content/IsaacStringMatchQuestion";
import {IsaacFreeTextQuestion} from "../components/content/IsaacFreeTextQuestion";
import {IsaacSymbolicLogicQuestion} from "../components/content/IsaacSymbolicLogicQuestion";
import {IsaacSymbolicQuestion} from "../components/content/IsaacSymbolicQuestion";
import {IsaacSymbolicChemistryQuestion} from "../components/content/IsaacSymbolicChemistryQuestion";
import {IsaacGraphSketcherQuestion} from "../components/content/IsaacGraphSketcherQuestion";

// @ts-ignore as TypeScript is struggling to infer common type for questions
export const QUESTION_TYPES = new Map([
    ["isaacMultiChoiceQuestion", IsaacMultiChoiceQuestion],
    ["isaacItemQuestion", IsaacItemQuestion],
    ["isaacParsonsQuestion", IsaacParsonsQuestion],
    ["isaacNumericQuestion", IsaacNumericQuestion],
    ["isaacSymbolicQuestion", IsaacSymbolicQuestion],
    ["isaacSymbolicChemistryQuestion", IsaacSymbolicChemistryQuestion],
    ["isaacStringMatchQuestion", IsaacStringMatchQuestion],
    ["isaacFreeTextQuestion", IsaacFreeTextQuestion],
    ["isaacSymbolicLogicQuestion", IsaacSymbolicLogicQuestion],
    ["isaacGraphSketcherQuestion", IsaacGraphSketcherQuestion],
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
    ["default", "Multiple choice"]
]);

export const parsePseudoSymbolicAvailableSymbols = (availableSymbols?: string[]) => {
    if (!availableSymbols) return;
    let theseSymbols = availableSymbols.slice(0).map(s => s.trim());
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
