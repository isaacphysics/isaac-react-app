import React, {useCallback, useEffect, useMemo} from "react";
import {loadQuizPreview, selectors, useAppDispatch, useAppSelector} from "../../../state";
import {Link, useParams} from "react-router-dom";
import {ShowLoading} from "../../handlers/ShowLoading";
import {isDefined, useQuizQuestions, useQuizSections} from "../../../services";
import {
    myQuizzesCrumbs,
    QuizAttemptComponent,
    QuizAttemptProps,
    QuizPagination
} from "../../elements/quiz/QuizAttemptComponent";
import {QuizAttemptDTO, RegisteredUserDTO} from "../../../../IsaacApiTypes";
import {Spacer} from "../../elements/Spacer";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {Alert, Button, Container} from "reactstrap";

const QuizFooter = ({page, pageLink, ...rest}: QuizAttemptProps) =>
    <div className="d-flex border-top pt-2 my-2 align-items-center">
        {isDefined(page)
            ? <QuizPagination {...rest} page={page} pageLink={pageLink} finalLabel="Back to Contents" />
            : <>
                <Spacer/>
                <Button color="primary" tag={Link} replace to={pageLink(1)}>{"View questions"}</Button>
            </>}
    </div>;

const pageHelp = <span>
    Preview the questions on this test.
</span>;

export const QuizPreview = ({user}: {user: RegisteredUserDTO}) => {
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

    const pageLink = useCallback((page?: number) =>
        `/test/preview/${quizId}` + (isDefined(page) ? `/page/${page}` : "")
    , [quizId]);

    const subProps: QuizAttemptProps = {attempt: attempt as QuizAttemptDTO, page: pageNumber, questions, sections, pageLink, pageHelp, user};

    return <Container className="mb-5">
        <ShowLoading until={attempt || error}>
            {attempt && <>
                <QuizAttemptComponent preview {...subProps} />
                <QuizFooter {...subProps} />
            </>}
            {error && <>
                <TitleAndBreadcrumb currentPageTitle="Test Preview" intermediateCrumbs={myQuizzesCrumbs} />
                <Alert color="danger">
                    <h4 className="alert-heading">Error loading test preview</h4>
                    <p>{error}</p>
                </Alert>
            </>}
        </ShowLoading>
    </Container>;
};
