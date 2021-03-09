import {ContentDTO, QuestionDTO} from "../../IsaacApiTypes";
import {isDefined} from "./miscUtils";
import {isQuestion} from "./questions";

export function extractQuestions(doc: ContentDTO | undefined) {
    const qs: QuestionDTO[] = [];

    function walk(doc: ContentDTO) {
        if (isDefined(doc)) {
            if (isQuestion(doc)) {
                qs.push(doc as QuestionDTO);
            } else {
                if (doc.children) {
                    doc.children.forEach((c) => walk(c));
                }
            }
        }
    }

    if (doc) {
        walk(doc);
    }
    return qs;
}
