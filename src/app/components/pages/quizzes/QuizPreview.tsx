import React, {useCallback, useEffect, useMemo} from "react";
import {useAppDispatch, useAppSelector} from "../../../state/store";
import * as RS from "reactstrap";

import {Link, useParams, withRouter} from "react-router-dom";
import {ShowLoading} from "../../handlers/ShowLoading";
import {loadQuizPreview} from "../../../state/actions/quizzes";
import {isDefined} from "../../../services/miscUtils";
import {useQuizQuestions, useQuizSections} from "../../../services/quiz";
import {myQuizzesCrumbs, QuizAttemptComponent, QuizAttemptProps, QuizPagination} from "../../elements/quiz/QuizAttemptComponent";
import {QuizAttemptDTO} from "../../../../IsaacApiTypes";
import {Spacer} from "../../elements/Spacer";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {selectors} from "../../../state/selectors";

const pageLink = (quizAttempt: QuizAttemptDTO, page?: number) => {
    const url = `/test/preview/${quizAttempt.quizId}`;
    if (page !== undefined) {
        return `${url}/page/${page}`;
    } else {
        return url;
    }
};


function QuizFooter(props: QuizAttemptProps) {
    const {attempt, page, pageLink} = props;

    let controls;
    if (page === null) {
        controls = <>
            <Spacer/>
            <RS.Button color="primary" tag={Link} replace to={pageLink(attempt, 1)}>{"View questions"}</RS.Button>
        </>;
    } else {
        controls = <QuizPagination {...props} page={page} finalLabel="Back to Contents" />;
    }

    return <>
        <div className="d-flex border-top pt-2 my-2 align-items-center">
            {controls}
        </div>
    </>;
}

const pageHelp = <span>
    Preview the questions on this test.
</span>;

export const QuizPreview = () => {
    const {quiz, error} = useAppSelector(selectors.quizzes.preview);
    const {page, quizId} = useParams<{quizId: string; page?: string;}>();

    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(loadQuizPreview(quizId));
    }, [dispatch, quizId]);

    const pageNumber = isDefined(page) ? parseInt(page, 10) : null;

    const attempt = useMemo<QuizAttemptDTO | undefined>(() =>
        quiz
            ? {
                quiz,
                quizId: quiz.id,
            }
            : undefined
    , [quiz]);

    const questions = useQuizQuestions(attempt);
    const sections = useQuizSections(attempt);

    const subProps: QuizAttemptProps = {attempt: attempt as QuizAttemptDTO, page: pageNumber, questions, sections, pageLink, pageHelp};

    return <RS.Container className="mb-5">
        <ShowLoading until={attempt || error}>
            {attempt && <>
                <QuizAttemptComponent preview {...subProps} />
                <QuizFooter {...subProps} />
            </>}
            {error && <>
                <TitleAndBreadcrumb currentPageTitle="Test Preview" intermediateCrumbs={myQuizzesCrumbs} />
                <RS.Alert color="danger">
                    <h4 className="alert-heading">Error loading test preview</h4>
                    <p>{error}</p>
                </RS.Alert>
            </>}
        </ShowLoading>
    </RS.Container>;
};
