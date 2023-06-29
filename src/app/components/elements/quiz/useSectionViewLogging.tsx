import {useEffect} from "react";
import {QuizAttemptDTO} from "../../../../IsaacApiTypes";
import {isDefined} from "../../../services";
import {useLogQuizSectionViewMutation} from "../../../state";

export function useSectionViewLogging(attempt: QuizAttemptDTO | undefined, pageNumber: number | null) {
    const [logQuizSectionView] = useLogQuizSectionViewMutation();
    useEffect(() => {
        if (attempt && isDefined(attempt.id) && pageNumber !== null) {
            logQuizSectionView({quizAttemptId: attempt.id as number, page: pageNumber});
        }
    }, [attempt, pageNumber]);
}
