import React from "react";
import {useGetQuizRubricQuery} from "../../../state";
import {Link, useParams} from "react-router-dom";
import {getThemeFromTags, isDefined, tags} from "../../../services";
import {QuizContentsComponent, viewQuizzesCrumbs} from "../../elements/quiz/QuizContentsComponent";
import {Button, Container} from "reactstrap";
import {ShowLoadingQuery} from "../../handlers/ShowLoadingQuery";
import type { RegisteredUserDTO } from "../../../../IsaacApiTypes";
import { buildErrorComponent } from "../../elements/quiz/buildErrorComponent";
import { Spacer } from "../../elements/Spacer";
import { QuizSidebarLayout } from "../../elements/quiz/QuizSidebarLayout";
import { skipToken } from "@reduxjs/toolkit/query";

const pageHelp = <span>
    View information about a test without adding it to {'"My tests"'}. This page does not show any questions.
</span>;

const Error = buildErrorComponent("Unknown Test", "There was an error loading that test.", viewQuizzesCrumbs);

const QuizFooter = ({quizId}: {quizId: string}) => {
    return <QuizSidebarLayout>
        <Spacer />
        <div className="d-flex w-100 align-items-center mt-2 gap-2">
            <Spacer />
            <Button tag={Link} to={`/test/attempt/${quizId}`}>Take Test</Button>
        </div>
    </QuizSidebarLayout>;
};

export const QuizView = ({user}: {user: RegisteredUserDTO}) => {
    const {quizId} = useParams();
    const quizRubricQuery = useGetQuizRubricQuery(isDefined(quizId) ? quizId : skipToken);
    const view = {
        quiz: quizRubricQuery.data && tags.augmentDocWithSubject(quizRubricQuery.data),
        quizId: quizRubricQuery.data?.id,
    };

    return <Container data-testid="quiz-view" className="mb-7" data-bs-theme={getThemeFromTags(view.quiz?.tags)}>
        <ShowLoadingQuery query={quizRubricQuery} ifError={Error} thenRender={(quizSummary => <>
            <QuizContentsComponent user={user} pageHelp={pageHelp} quiz={quizSummary} />
            <QuizFooter quizId={quizId as string} />
        </>)} />
    </Container>;
};
