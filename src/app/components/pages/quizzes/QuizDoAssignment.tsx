import React, {useCallback, useEffect} from "react";
import {clearQuizAttempt, loadQuizAssignmentAttempt, useAppDispatch} from "../../../state";
import {useParams} from "react-router-dom";
import {ShowLoading} from "../../handlers/ShowLoading";
import {getThemeFromTags, isDefined, useCurrentQuizAttempt} from "../../../services";
import {myQuizzesCrumbs, QuizContentsComponent, QuizAttemptProps} from "../../elements/quiz/QuizContentsComponent";
import {QuizAttemptDTO, RegisteredUserDTO} from "../../../../IsaacApiTypes";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {QuizAttemptFooter} from "../../elements/quiz/QuizAttemptFooter";
import {useSectionViewLogging} from "../../elements/quiz/useSectionViewLogging";
import {Alert, Container} from "reactstrap";

const pageHelp = <span>
    Answer the questions on each section of the test, then mark the test as complete when you are finished.
</span>;

export const QuizDoAssignment = ({user}: {user: RegisteredUserDTO}) => {
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

    const pageLink = useCallback((page?: number) =>
        `/test/assignment/${quizAssignmentId}` + (isDefined(page) ? `/page/${page}` : "")
    , [quizAssignmentId]);

    const feedbackLink = attempt?.quizAssignment?.quizFeedbackMode !== "NONE" ? `/test/attempt/${attempt?.id}/feedback` : `/tests`;

    // Importantly, these are only used if attempt is defined
    const subProps: QuizAttemptProps & {feedbackLink: string} = {attempt: attempt as QuizAttemptDTO, page: pageNumber, questions, sections, pageLink, pageHelp, user, feedbackLink};

    return <Container className="mb-7" data-bs-theme={getThemeFromTags(attempt?.quiz?.tags)}>
        <ShowLoading until={attempt || error}>
            {attempt && <>
                <QuizContentsComponent {...subProps} />
                <QuizAttemptFooter {...subProps} />
            </>}
            {error && <>
                <TitleAndBreadcrumb currentPageTitle="Test" intermediateCrumbs={myQuizzesCrumbs} icon={{type: "icon", icon: "icon-error"}} />
                <Alert color="danger">
                    <h4 className="alert-heading">Error loading assignment!</h4>
                    <p>{error}</p>
                </Alert>
            </>}
        </ShowLoading>
    </Container>;
};
