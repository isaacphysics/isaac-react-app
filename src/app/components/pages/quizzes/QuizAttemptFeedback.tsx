import React, {useEffect} from "react";
import {useAppDispatch} from "../../../state/store";
import {Link, withRouter} from "react-router-dom";
import * as RS from "reactstrap";

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


interface QuizAttemptFeedbackProps {
    match: {params: {quizAttemptId?: string, page: string, studentId?: string, quizAssignmentId?: string}}
}

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


function QuizFooter(props: QuizAttemptProps) {
    const {attempt, page, pageLink, studentId, quizAssignmentId} = props;

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

const QuizAttemptFeedbackComponent = ({match: {params: {quizAttemptId, page, studentId, quizAssignmentId}}}: QuizAttemptFeedbackProps) => {
    const {attempt, studentAttempt, studentUser, questions, sections, error, studentError} = useCurrentQuizAttempt();

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

    const attemptToView = isDefined(studentId) ? studentAttempt : attempt;
    const errorToView = isDefined(studentId) ? studentError : error;

    const pageNumber = isDefined(page) ? parseInt(page, 10) : null;

    const subProps: QuizAttemptProps = {attempt: attemptToView as QuizAttemptDTO, page: pageNumber,
        questions, sections, pageLink, pageHelp, studentId, quizAssignmentId, studentUser};

    return <RS.Container className="mb-5">
        <ShowLoading until={attemptToView}>
            {isDefined(attemptToView) && <>
                <QuizAttemptComponent {...subProps} />
                {attemptToView.feedbackMode === 'DETAILED_FEEDBACK' && <QuizFooter {...subProps} />}
            </>}
            {isDefined(errorToView) && <>
                <TitleAndBreadcrumb currentPageTitle="Test Feedback" intermediateCrumbs={myQuizzesCrumbs} />
                <RS.Alert color="danger">
                    <h4 className="alert-heading">Error loading your feedback!</h4>
                    <p>{errorToView}</p>
                </RS.Alert>
            </>}
        </ShowLoading>
    </RS.Container>;
};

export const QuizAttemptFeedback = withRouter(QuizAttemptFeedbackComponent);
