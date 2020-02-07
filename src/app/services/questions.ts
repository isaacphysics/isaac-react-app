import {IsaacMultiChoiceQuestion} from "../components/content/IsaacMultiChoiceQuestion";
import {IsaacItemQuestion} from "../components/content/IsaacItemQuestion";
import {IsaacParsonsQuestion} from "../components/content/IsaacParsonsQuestion";
import {IsaacNumericQuestion} from "../components/content/IsaacNumericQuestion";
import {IsaacStringMatchQuestion} from "../components/content/IsaacStringMatchQuestion";
import {IsaacFreeTextQuestion} from "../components/content/IsaacFreeTextQuestion";
import {IsaacSymbolicLogicQuestion} from "../components/content/IsaacSymbolicLogicQuestion";

// @ts-ignore as TypeScript is struggling to infer common type for questions
export const QUESTION_TYPES = new Map([
    ["isaacMultiChoiceQuestion", IsaacMultiChoiceQuestion],
    ["isaacItemQuestion", IsaacItemQuestion],
    ["isaacParsonsQuestion", IsaacParsonsQuestion],
    ["isaacNumericQuestion", IsaacNumericQuestion],
    ["isaacStringMatchQuestion", IsaacStringMatchQuestion],
    ["isaacFreeTextQuestion", IsaacFreeTextQuestion],
    ["isaacSymbolicLogicQuestion", IsaacSymbolicLogicQuestion],
    ["default", IsaacMultiChoiceQuestion]
]);

export const HUMAN_QUESTION_TYPES = new Map([
    ["isaacMultiChoiceQuestion", "Multiple choice"],
    ["isaacItemQuestion", "Item"],
    ["isaacParsonsQuestion", "Parsons"],
    ["isaacNumericQuestion", "Numeric"],
    ["isaacStringMatchQuestion", "String match"],
    ["isaacFreeTextQuestion", "Free text"],
    ["isaacSymbolicLogicQuestion", "Symbolic logic"],
    ["default", "Multiple choice"]
]);
