import {ContentDTO, QuestionDTO} from "../../IsaacApiTypes";
import {isDefined} from "./miscUtils";

export function extractQuestions(doc: ContentDTO | undefined) {
    const qs: QuestionDTO[] = [];

    function walk(doc: ContentDTO) {
        if (isDefined(doc)) {
            switch (doc.type) {
                case "isaacMultiChoiceQuestion":
                case "isaacNumericQuestion":
                case "isaacSymbolicQuestion":
                case "isaacSymbolicChemistryQuestion":
                case "isaacSymbolicLogicQuestion":
                case "isaacGraphSketcherQuestion":
                case "isaacAnvilQuestion":
                case "isaacStringMatchQuestion":
                case "isaacFreeTextQuestion":
                case "isaacItemQuestion":
                case "isaacParsonsQuestion":
                    qs.push(doc as QuestionDTO);
                    break;
                default:
                    if (doc.children) {
                        doc.children.forEach((c) => walk(c));
                    }
                    break;
            }
        }
    }

    if (doc) {
        walk(doc);
    }
    return qs;
}
