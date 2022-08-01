import React, {useCallback, useEffect} from "react";
import {useAppDispatch} from "../../../state/store";
import * as RS from "reactstrap";
import {useParams} from "react-router-dom";
import {ShowLoading} from "../../handlers/ShowLoading";
import {clearQuizAttempt, loadQuizAssignmentAttempt} from "../../../state/actions/quizzes";
import {isDefined} from "../../../services/miscUtils";
import {useCurrentQuizAttempt} from "../../../services/quiz";
import {myQuizzesCrumbs, QuizAttemptComponent, QuizAttemptProps} from "../../elements/quiz/QuizAttemptComponent";
import {QuizAttemptDTO} from "../../../../IsaacApiTypes";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {QuizAttemptFooter} from "../../elements/quiz/QuizAttemptFooter";
import {useSectionViewLogging} from "../../elements/quiz/useSectionViewLogging";

const pageLink = (attempt: QuizAttemptDTO, page?: number) => {
    if (page !== undefined) {
        return `/test/assignment/${attempt.quizAssignmentId}/page/${page}`;
    } else {
        return `/test/assignment/${attempt.quizAssignmentId}`;
    }
};


const pageHelp = <span>
    Answer the questions on each section of the test, then mark the test as complete when you are finished.
</span>;

export const QuizDoAssignment = () => {
    const dispatch = useAppDispatch();
    const {page, quizAssignmentId} = useParams<{quizAssignmentId: string; page?: string;}>();
    const {attempt, questions, sections, error} = useCurrentQuizAttempt();

    useEffect(() => {
        dispatch(loadQuizAssignmentAttempt(parseInt(quizAssignmentId, 10)));
        return () => {
            dispatch(clearQuizAttempt());
        };
    }, [dispatch, quizAssignmentId]);

    const pageNumber = isDefined(page) ? parseInt(page, 10) : null;
    useSectionViewLogging(attempt, pageNumber);

    const subProps: QuizAttemptProps = {attempt: attempt as QuizAttemptDTO, page: pageNumber, questions, sections, pageLink, pageHelp};

    return <RS.Container className="mb-5">
        <ShowLoading until={attempt || error}>
            {attempt && <>
                <QuizAttemptComponent {...subProps} />
                <QuizAttemptFooter {...subProps} />
            </>}
            {error && <>
                <TitleAndBreadcrumb currentPageTitle="Test" intermediateCrumbs={myQuizzesCrumbs} />
                <RS.Alert color="danger">
                    <h4 className="alert-heading">Error loading assignment!</h4>
                    <p>{error}</p>
                </RS.Alert>
            </>}
        </ShowLoading>
    </RS.Container>;
};
