import {IsaacMultiChoiceQuestion} from "../components/content/IsaacMultiChoiceQuestion";
import {IsaacItemQuestion} from "../components/content/IsaacItemQuestion";
import {IsaacParsonsQuestion} from "../components/content/IsaacParsonsQuestion";
import {IsaacNumericQuestion} from "../components/content/IsaacNumericQuestion";
import {IsaacStringMatchQuestion} from "../components/content/IsaacStringMatchQuestion";
import {IsaacFreeTextQuestion} from "../components/content/IsaacFreeTextQuestion";
import {IsaacSymbolicLogicQuestion} from "../components/content/IsaacSymbolicLogicQuestion";

// @ts-ignore
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
