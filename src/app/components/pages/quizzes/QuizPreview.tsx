import React, {useCallback, useMemo} from "react";
import {getRTKQueryErrorMessage, useGetQuizPreviewQuery} from "../../../state";
import {Link, useParams} from "react-router-dom";
import {isDefined, tags, useQuizQuestions, useQuizSections} from "../../../services";
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
import {ShowLoadingQuery} from "../../handlers/ShowLoadingQuery";
import {FetchBaseQueryError} from "@reduxjs/toolkit/dist/query/fetchBaseQuery";
import {SerializedError} from "@reduxjs/toolkit";

const QuizFooter = ({page, pageLink, ...rest}: QuizAttemptProps) =>
    <div className="d-flex border-top pt-2 my-2 align-items-center">
        {isDefined(page)
            ? <QuizPagination {...rest} page={page} pageLink={pageLink} finalLabel="Back to Contents" />
            : <>
                <Spacer/>
                <Button color="secondary" tag={Link} replace to={pageLink(1)}>{"View questions"}</Button>
            </>}
    </div>;

const pageHelp = <span>
    Preview the questions on this test.
</span>;

export const QuizPreview = ({user}: {user: RegisteredUserDTO}) => {

    const {page, quizId} = useParams<{quizId: string; page?: string;}>();
    const quizPreviewQuery = useGetQuizPreviewQuery(quizId);
    const {data: quiz} = quizPreviewQuery;

    const pageNumber = isDefined(page) ? parseInt(page, 10) : null;

    const attempt = useMemo(() =>
        quiz
            ? {
                quiz: tags.augmentDocWithSubject(quiz),
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

    const buildErrorComponent = (error: FetchBaseQueryError | SerializedError | undefined) => <>
        <TitleAndBreadcrumb currentPageTitle="Test Preview" intermediateCrumbs={myQuizzesCrumbs} />
        <Alert color="danger">
            <h4 className="alert-heading">Error loading test preview</h4>
            <p>{getRTKQueryErrorMessage(error).message}</p>
        </Alert>
    </>;

    return <Container className={`mb-5 ${attempt?.quiz?.subjectId}`}>
        <ShowLoadingQuery query={quizPreviewQuery} ifError={buildErrorComponent}>
            <QuizAttemptComponent preview {...subProps} />
            <QuizFooter {...subProps} />
        </ShowLoadingQuery>
    </Container>;
};
