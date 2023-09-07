import {useEffect} from "react";
import {QuizAttemptDTO} from "../../../../IsaacApiTypes";
import {isDefined} from "../../../services";
import {useLogQuizSectionViewMutation} from "../../../state";

export function useSectionViewLogging(attempt: QuizAttemptDTO | undefined, pageNumber: number | null) {
    const [logQuizSectionView] = useLogQuizSectionViewMutation();
    const attemptId = attempt?.id;
    useEffect(() => {
        if (isDefined(attemptId) && pageNumber !== null) {
            logQuizSectionView({quizAttemptId: attemptId, page: pageNumber});
        }
    }, [attemptId, pageNumber]);
}
