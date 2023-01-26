import {useEffect} from "react";
import {logQuizSectionView, useAppDispatch} from "../../../state";
import {QuizAttemptDTO} from "../../../../IsaacApiTypes";
import {isDefined} from "../../../services";

export function useSectionViewLogging(attempt: QuizAttemptDTO | undefined, pageNumber: number | null) {
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (attempt && isDefined(attempt.id) && pageNumber !== null) {
            dispatch(logQuizSectionView(attempt.id as number, pageNumber));
        }
    }, [dispatch, attempt, pageNumber]);
}
