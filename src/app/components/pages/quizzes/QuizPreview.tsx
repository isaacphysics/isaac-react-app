import React, {useCallback, useMemo} from "react";
import {openActiveModal, useAppDispatch, useGetQuizPreviewQuery} from "../../../state";
import {Link, useParams} from "react-router-dom";
import {getThemeFromTags, isDefined, isTeacherOrAbove, tags, useQuizQuestions, useQuizSections} from "../../../services";
import {FullQuizInfo, myQuizzesCrumbs, QuizContentsComponent, QuizPagination, QuizProps} from "../../elements/quiz/QuizContentsComponent";
import {IsaacQuizDTO, QuizAttemptDTO, RegisteredUserDTO} from "../../../../IsaacApiTypes";
import {Spacer} from "../../elements/Spacer";
import {Button, Container} from "reactstrap";
import {ShowLoadingQuery} from "../../handlers/ShowLoadingQuery";
import {buildErrorComponent} from "../../elements/quiz/buildErrorComponent";
import { QuizSidebarLayout } from "../../elements/quiz/QuizSidebarLayout";
import { skipToken } from "@reduxjs/toolkit/query";
import { SetQuizzesModal } from "../../elements/modals/SetQuizzesModal";

const QuizFooter = (props: QuizProps & FullQuizInfo) => {
    const {user, page, quiz, quizContents: {pageLink}} = props;
    const dispatch = useAppDispatch();
    return <QuizSidebarLayout>
        {isDefined(page)
            ? <QuizPagination {...props} finalLabel="Back to Contents" />
            : <>
                <div className="d-flex w-100 align-items-center mt-2 gap-2">
                    {isTeacherOrAbove(user) && <Button color="primary" onClick={() => dispatch(openActiveModal(SetQuizzesModal({quiz})))}>Set test</Button>}
                    <Spacer/>
                    <Button color="secondary" tag={Link} to={pageLink(1)}>{"View questions"}</Button>
                </div>
            </>}
    </QuizSidebarLayout>;
};

const pageHelp = <span>
    Preview the questions on this test.
</span>;

const Error = buildErrorComponent("Test Preview", "Error loading test preview", myQuizzesCrumbs);

export const QuizPreview = ({user}: {user: RegisteredUserDTO}) => {

    const {page, quizId} = useParams();
    const quizPreviewQuery = useGetQuizPreviewQuery(isDefined(quizId) ? quizId : skipToken);
    const {data: quiz} = quizPreviewQuery;

    const pageNumber = isDefined(page) ? parseInt(page, 10) : undefined;

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

    const subProps: QuizProps = {
        user,
        pageHelp,
        page: pageNumber,
        quiz: attempt?.quiz as IsaacQuizDTO,
        quizContents: {
            questions, 
            sections,
            pageLink,
        },
        attempt: attempt as QuizAttemptDTO,
    };

    return <Container data-testid="quiz-preview" className="mb-7" data-bs-theme={getThemeFromTags(quiz?.tags)}>
        <ShowLoadingQuery query={quizPreviewQuery} ifError={Error}>
            <QuizContentsComponent preview {...subProps} />
            <QuizFooter {...subProps} />
        </ShowLoadingQuery>
    </Container>;
};
