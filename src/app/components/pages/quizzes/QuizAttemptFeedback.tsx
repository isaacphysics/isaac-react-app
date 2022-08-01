import React, {useCallback, useEffect} from "react";
import {useAppDispatch} from "../../../state/store";
import * as RS from "reactstrap";
import {Link, useParams} from "react-router-dom";
import {ShowLoading} from "../../handlers/ShowLoading";
import {
    clearQuizAttempt, clearStudentQuizAttempt,
    loadQuizAttemptFeedback,
    loadStudentQuizAttemptFeedback
} from "../../../state/actions/quizzes";
import {isDefined} from "../../../services/miscUtils";
import {useCurrentQuizAttempt} from "../../../services/quiz";
import {
    myQuizzesCrumbs,
    QuizAttemptComponent,
    QuizAttemptProps,
    QuizPagination
} from "../../elements/quiz/QuizAttemptComponent";
import {QuizAttemptDTO} from "../../../../IsaacApiTypes";
import {Spacer} from "../../elements/Spacer";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";

const pageLink = (attempt: QuizAttemptDTO, page?: number, studentId?: string, assignmentId?: string) => {
    if (isDefined(studentId) && isDefined(assignmentId) && page !== undefined) {
        return `/test/attempt/feedback/${assignmentId}/${studentId}/${page}`;
    } else if (isDefined(studentId) && isDefined(assignmentId)) {
        return `/test/attempt/feedback/${assignmentId}/${studentId}`;
    } else if (isDefined(page)) {
        return `/test/attempt/${attempt.id}/feedback/${page}`;
    } else {
        return `/test/attempt/${attempt.id}/feedback`;
    }
};

import {Container, Alert, Button} from "reactstrap";

function QuizFooter(props: QuizAttemptProps) {
    const {page, pageLink, studentUser} = props;

    let controls;
    let prequel = null;
    if (page === null) {
        prequel = <p className="mt-3">Click on a section title or click &lsquo;Next&rsquo; to look at {studentId && quizAssignmentId ? "their" : "your"} detailed feedback.</p>
        controls = <>
            <Spacer/>
            <RS.Button tag={Link} replace to={pageLink(attempt, 1, studentId, quizAssignmentId)}>Next</RS.Button>
        </>;
    } else {
        controls = <QuizPagination {...props} page={page} finalLabel="Back to Overview" />;
    }

    return <>
        {prequel}
        <div className="d-flex border-top pt-2 my-2 align-items-center">
            {controls}
        </div>
    </>;
}

// TODO: Make this more specific to feedback mode.
const pageHelp = <span>
    See the feedback for this test attempt.
</span>;

export const QuizAttemptFeedback = () => {
    const {quizAttemptId, page, studentId, quizAssignmentId} = useParams<{quizAttemptId?: string; page?: string; studentId?: string; quizAssignmentId?: string;}>();
    const {attempt, studentUser, questions, sections, error} = useCurrentQuizAttempt(numericStudentId);

    const dispatch = useAppDispatch();

    useEffect(() => {
        isDefined(quizAttemptId) && dispatch(loadQuizAttemptFeedback(parseInt(quizAttemptId, 10)));

        if (isDefined(studentId) && isDefined(quizAssignmentId)) {
            dispatch(loadStudentQuizAttemptFeedback(parseInt(quizAssignmentId, 10), parseInt(studentId, 10)));
        }

        return () => {
            dispatch(clearQuizAttempt());
            if (isDefined(studentId)) {
                dispatch(clearStudentQuizAttempt());
            }
        };
    }, [dispatch, quizAttemptId, quizAssignmentId, studentId]);

    const pageNumber = isDefined(page) ? parseInt(page, 10) : null;


    const subProps: QuizAttemptProps = {attempt: attempt as QuizAttemptDTO, page: pageNumber,
        questions, sections, pageLink, pageHelp, studentUser};

    return <Container className="mb-5">
        <ShowLoading until={attempt || error}>
            {isDefined(attempt) && <>
                <QuizAttemptComponent {...subProps} />
                {attempt.feedbackMode === 'DETAILED_FEEDBACK' && <QuizFooter {...subProps} />}
            </>}
            {isDefined(error) && <>
                <TitleAndBreadcrumb currentPageTitle="Test Feedback" intermediateCrumbs={myQuizzesCrumbs} />
                <Alert color="danger">
                    <h4 className="alert-heading">Error loading your feedback!</h4>
                    <p>{error}</p>
                </Alert>
            </>}
        </ShowLoading>
    </Container>;
};
