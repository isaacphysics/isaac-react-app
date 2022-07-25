import {useEffect} from "react";
import {useAppDispatch} from "../../../state/store";

import {QuizAttemptDTO} from "../../../../IsaacApiTypes";
import {logQuizSectionView} from "../../../state/actions/quizzes";

export function useSectionViewLogging(attempt: QuizAttemptDTO | null, pageNumber: number | null) {
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (attempt && pageNumber !== null) {
            dispatch(logQuizSectionView(attempt.id as number, pageNumber));
        }
    }, [dispatch, attempt, pageNumber]);
}
