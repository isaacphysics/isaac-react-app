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
