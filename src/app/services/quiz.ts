import {useMemo} from "react";
import {useSelector} from "react-redux";

import {isDefined} from "./miscUtils";
import {isQuestion} from "./questions";
import {ContentDTO, IsaacQuizSectionDTO, QuestionDTO} from "../../IsaacApiTypes";
import {selectors} from "../state/selectors";

export function extractQuestions(doc: ContentDTO | undefined): QuestionDTO[] {
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

export function useCurrentQuizAttempt() {
    const attemptState = useSelector(selectors.quizzes.currentQuizAttempt);
    const error = isDefined(attemptState) && 'error' in attemptState ? attemptState.error : null;
    const attempt = isDefined(attemptState) && 'attempt' in attemptState ? attemptState.attempt : null;
    const questions = useMemo(() => {
        return extractQuestions(attempt?.quiz);
    }, [attempt?.quiz]);
    const sections = useMemo(() => {
        const sections: { [id: string]: IsaacQuizSectionDTO } = {};
        attempt?.quiz?.children?.forEach(section => {
            sections[section.id as string] = section as IsaacQuizSectionDTO;
        });
        return sections;
    }, [attempt?.quiz]);
    return {attempt, questions, sections, error};
}
