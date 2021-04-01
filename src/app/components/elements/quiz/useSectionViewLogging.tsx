import {useEffect} from "react";
import {useDispatch} from "react-redux";

import {QuizAttemptDTO} from "../../../../IsaacApiTypes";
import {logQuizSectionView} from "../../../state/actions/quizzes";

export function useSectionViewLogging(attempt: QuizAttemptDTO | null, pageNumber: number | null) {
    const dispatch = useDispatch();
    useEffect(() => {
        if (attempt && pageNumber !== null) {
            dispatch(logQuizSectionView(attempt.id as number, pageNumber));
        }
    }, [dispatch, attempt, pageNumber]);
}
