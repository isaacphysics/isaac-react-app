import React, {useCallback, useMemo} from "react";
import {useGetQuizPreviewQuery} from "../../../state";
import {Link, useParams} from "react-router-dom";
import {getThemeFromTags, isDefined, tags, useQuizQuestions, useQuizSections} from "../../../services";
import {QuizContentsComponent, QuizAttemptProps, QuizPagination} from "../../elements/quiz/QuizContentsComponent";
import {QuizAttemptDTO, RegisteredUserDTO} from "../../../../IsaacApiTypes";
import {Spacer} from "../../elements/Spacer";
import {Button, Container} from "reactstrap";
import {ShowLoadingQuery} from "../../handlers/ShowLoadingQuery";
import {buildErrorComponent} from "../../elements/quiz/buildErrorComponent";
import { QuizSidebarLayout } from "../../elements/quiz/QuizSidebarLayout";
import { useDynamicValues } from "../../../services/dynamicValues";

const QuizFooter = ({page, pageLink, ...rest}: QuizAttemptProps) =>
    <QuizSidebarLayout>
        {isDefined(page)
            ? <QuizPagination {...rest} page={page} pageLink={pageLink} finalLabel="Back to Contents" />
            : <>
                <Spacer/>
                <Button color="secondary" tag={Link} to={pageLink(1)}>{"View questions"}</Button>
            </>}
    </QuizSidebarLayout>;

const pageHelp = <span>
    Preview the questions on this test.
</span>;

export const QuizPreview = ({user}: {user: RegisteredUserDTO}) => {
    const {page, quizId} = useParams<{quizId: string; page?: string;}>();
    const quizPreviewQuery = useGetQuizPreviewQuery(quizId as string);
    const {data: quiz} = quizPreviewQuery;
    const { CRUMBS } = useDynamicValues();

    const Error = useMemo(() => buildErrorComponent("Test Preview", "Error loading test preview", CRUMBS.MY_TESTS), [CRUMBS]);

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

    return <Container data-testid="quiz-preview" className="mb-7" data-bs-theme={getThemeFromTags(quiz?.tags)}>
        <ShowLoadingQuery query={quizPreviewQuery} ifError={Error}>
            <QuizContentsComponent preview {...subProps} />
            <QuizFooter {...subProps} />
        </ShowLoadingQuery>
    </Container>;
};
