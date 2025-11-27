import React, {useCallback, useEffect} from "react";
import {clearQuizAttempt, loadFreeQuizAttempt, useAppDispatch} from "../../../state";
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
    Answer the questions on each section of the test, then mark the test as complete to see your feedback.
</span>;

export const QuizDoFreeAttempt = ({user}: {user: RegisteredUserDTO}) => {
    const {page, quizId} = useParams<{quizId: string; page?: string;}>();
    const {attempt, questions, sections, error} = useCurrentQuizAttempt();

    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(loadFreeQuizAttempt(quizId));
        return () => {
            dispatch(clearQuizAttempt());
        };
    }, [dispatch, quizId]);

    const pageNumber = isDefined(page) ? parseInt(page, 10) : null;
    useSectionViewLogging(attempt, pageNumber);

    const assignedQuizError = error?.toString().includes("This test has been assigned to you by a teacher");

    const pageLink = useCallback((page?: number) =>
        `/test/attempt/${quizId}` + (isDefined(page) ? `/page/${page}` : "")
    , [quizId]);

    const feedbackLink = `/test/attempt/${attempt?.id}/feedback`;

    // Importantly, these are only used if attempt is defined
    const subProps: QuizAttemptProps & {feedbackLink: string} = {attempt: attempt as QuizAttemptDTO, page: pageNumber, questions, sections, pageLink, pageHelp, user, feedbackLink};

    return <Container data-testid="quiz-attempt" className="mb-7" data-bs-theme={getThemeFromTags(attempt?.quiz?.tags)}>
        <ShowLoading until={attempt || error}>
            {attempt && <>
                <QuizContentsComponent {...subProps} />
                <QuizAttemptFooter {...subProps} />
            </>}
            {error && <>
                <TitleAndBreadcrumb currentPageTitle="Test" intermediateCrumbs={myQuizzesCrumbs} icon={{type: "icon", icon: "icon-error"}} />
                <Alert color={assignedQuizError ? "warning" : "danger"} className="mt-4">
                    <h4 className="alert-heading">{assignedQuizError ? "You have been set this test" : "Error loading test!"}</h4>
                    {!assignedQuizError && <p data-testid="error-message">{error}</p>}
                    {assignedQuizError && <>
                        <p>Your teacher has set this test to you.  You may not practise it in advance.<br/>
                            If you are ready to take the test, click on it in your <a href={"/tests"} target="_self" rel="noopener noreferrer">assigned tests</a> page.
                        </p>
                    </>}
                </Alert>
            </>}
        </ShowLoading>
    </Container>;
};
