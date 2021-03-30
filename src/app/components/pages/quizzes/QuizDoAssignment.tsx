import React, {useEffect} from "react";
import {useDispatch} from "react-redux";
import {withRouter} from "react-router-dom";
import * as RS from "reactstrap";

import {ShowLoading} from "../../handlers/ShowLoading";
import {clearQuizAttempt, loadQuizAssignmentAttempt} from "../../../state/actions/quizzes";
import {isDefined} from "../../../services/miscUtils";
import {useCurrentQuizAttempt} from "../../../services/quiz";
import {myQuizzesCrumbs, QuizAttemptComponent, QuizAttemptProps} from "../../elements/quiz/QuizAttemptComponent";
import {QuizAttemptDTO} from "../../../../IsaacApiTypes";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {QuizAttemptFooter} from "../../elements/quiz/QuizAttemptFooter";

interface QuizDoAsssignmentProps {
    match: {params: {quizAssignmentId: string, page: string}}
}

const pageLink = (attempt: QuizAttemptDTO, page?: number) => {
    if (page !== undefined) {
        return `/quiz/assignment/${attempt.quizAssignmentId}/page/${page}`;
    } else {
        return `/quiz/assignment/${attempt.quizAssignmentId}`;
    }
};


const pageHelp = <span>
    Answer the questions on each section of the quiz, then mark the quiz as complete when you are finished.
</span>;

const QuizDoAsssignmentComponent = ({match: {params: {quizAssignmentId, page}}}: QuizDoAsssignmentProps) => {
    const {attempt, questions, sections, error} = useCurrentQuizAttempt();

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(loadQuizAssignmentAttempt(parseInt(quizAssignmentId, 10)));

        return () => {
            dispatch(clearQuizAttempt());
        };
    }, [dispatch, quizAssignmentId]);

    const pageNumber = isDefined(page) ? parseInt(page, 10) : null;

    const subProps: QuizAttemptProps = {attempt: attempt as QuizAttemptDTO, page: pageNumber, questions, sections, pageLink, pageHelp};

    return <RS.Container>
        <ShowLoading until={attempt || error}>
            {attempt && <>
                <QuizAttemptComponent {...subProps} />
                <QuizAttemptFooter {...subProps} />
            </>}
            {error && <>
                <TitleAndBreadcrumb currentPageTitle="Quiz" intermediateCrumbs={myQuizzesCrumbs} />
                <RS.Alert color="danger">
                    <h4 className="alert-heading">Error loading assignment!</h4>
                    <p>{error}</p>
                </RS.Alert>
            </>}
        </ShowLoading>
    </RS.Container>;
};

export const QuizDoAsssignment = withRouter(QuizDoAsssignmentComponent);
