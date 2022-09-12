import React, {useCallback, useEffect} from "react";
import {
    clearQuizAttempt,
    clearStudentQuizAttempt,
    loadQuizAttemptFeedback,
    loadStudentQuizAttemptFeedback,
    useAppDispatch
} from "../../../state";
import {Link, useParams} from "react-router-dom";
import {ShowLoading} from "../../handlers/ShowLoading";
import {isDefined, useCurrentQuizAttempt} from "../../../services";
import {
    myQuizzesCrumbs,
    QuizAttemptComponent,
    QuizAttemptProps,
    QuizPagination
} from "../../elements/quiz/QuizAttemptComponent";
import {QuizAttemptDTO} from "../../../../IsaacApiTypes";
import {Spacer} from "../../elements/Spacer";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {Alert, Button, Container} from "reactstrap";

function QuizFooter(props: QuizAttemptProps) {
    const {page, pageLink, studentUser} = props;

    let controls;
    let prequel = null;
    if (page === null) {
        prequel = <p className="mt-3">Click on a section title or click &lsquo;Next&rsquo; to look at {isDefined(studentUser) ? "their" : "your"} detailed feedback.</p>
        controls = <>
            <Spacer/>
            <Button tag={Link} replace to={pageLink(1)}>Next</Button>
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
    const numericStudentId = studentId ? parseInt(studentId, 10) : undefined;
    const {attempt, studentUser, questions, sections, error} = useCurrentQuizAttempt(numericStudentId);

    const dispatch = useAppDispatch();

    useEffect(() => {
        isDefined(quizAttemptId) && dispatch(loadQuizAttemptFeedback(parseInt(quizAttemptId, 10)));

        if (isDefined(numericStudentId) && isDefined(quizAssignmentId)) {
            dispatch(loadStudentQuizAttemptFeedback(parseInt(quizAssignmentId, 10), numericStudentId));
        }

        return () => {
            dispatch(clearQuizAttempt());
            if (isDefined(studentId)) {
                dispatch(clearStudentQuizAttempt());
            }
        };
    }, [dispatch, quizAttemptId, quizAssignmentId, studentId]);

    const pageNumber = isDefined(page) ? parseInt(page, 10) : null;

    const pageLink = useCallback((page?: number) => {
        const pagePath = isDefined(page) ? `/${page}` : "";
        if (isDefined(studentId) && isDefined(quizAssignmentId)) {
            return `/test/attempt/feedback/${quizAssignmentId}/${studentId}` + pagePath;
        } else {
            return `/test/attempt/${quizAttemptId}/feedback` + pagePath;
        }
    }, [quizAttemptId, quizAssignmentId, studentId]);

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
