import React, {useEffect} from "react";
import {useAppDispatch} from "../../../state/store";
import {withRouter} from "react-router-dom";
import * as RS from "reactstrap";

import {ShowLoading} from "../../handlers/ShowLoading";
import {clearQuizAttempt, loadFreeQuizAttempt} from "../../../state/actions/quizzes";
import {isDefined} from "../../../services/miscUtils";
import {useCurrentQuizAttempt} from "../../../services/quiz";
import {myQuizzesCrumbs, QuizAttemptComponent, QuizAttemptProps} from "../../elements/quiz/QuizAttemptComponent";
import {QuizAttemptDTO} from "../../../../IsaacApiTypes";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {QuizAttemptFooter} from "../../elements/quiz/QuizAttemptFooter";
import {useSectionViewLogging} from "../../elements/quiz/useSectionViewLogging";

interface QuizDoFreeAttemptProps {
    match: {params: {quizId: string, page: string}}
}

const pageLink = (attempt: QuizAttemptDTO, page?: number) => {
    if (page !== undefined) {
        return `/test/attempt/${attempt.quizId}/page/${page}`;
    } else {
        return `/test/attempt/${attempt.quizId}`;
    }
};


const pageHelp = <span>
    Answer the questions on each section of the test, then mark the test as complete to see your feedback.
</span>;

const QuizDoFreeAttemptComponent = ({match: {params: {quizId, page}}}: QuizDoFreeAttemptProps) => {
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

    const assignedQuizError = error?.toString().includes("You are currently set this test");

    const subProps: QuizAttemptProps = {attempt: attempt as QuizAttemptDTO, page: pageNumber, questions, sections, pageLink, pageHelp};

    return <RS.Container className="mb-5">
        <ShowLoading until={attempt || error}>
            {attempt && <>
                <QuizAttemptComponent {...subProps} />
                <QuizAttemptFooter {...subProps} />
            </>}
            {error && <>
                <TitleAndBreadcrumb currentPageTitle="Test" intermediateCrumbs={myQuizzesCrumbs} />
                <RS.Alert color={assignedQuizError ? "warning" : "danger"} className="mt-4">
                    <h4 className="alert-heading">{assignedQuizError ? "You have been set this test" : "Error loading test!"}</h4>
                    {!assignedQuizError && <p>{error}</p>}
                    {assignedQuizError && <>
                        <p>Your teacher has set this test to you.  You may not practise it in advance.<br/>
                            If you are ready to take the test, click on it in your <a href={"/tests"} target="_self" rel="noopener noreferrer">assigned tests</a> page.
                        </p>
                    </>}
                </RS.Alert>
            </>}
        </ShowLoading>
    </RS.Container>;
};

export const QuizDoFreeAttempt = withRouter(QuizDoFreeAttemptComponent);
