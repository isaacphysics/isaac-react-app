import React from "react";
import {useGetQuizRubricQuery} from "../../../state";
import {Link, useParams} from "react-router-dom";
import {tags} from "../../../services";
import {QuizAttemptComponent, rubricCrumbs} from "../../elements/quiz/QuizAttemptComponent";
import {Button, Container} from "reactstrap";
import {ShowLoadingQuery} from "../../handlers/ShowLoadingQuery";
import type { RegisteredUserDTO } from "../../../../IsaacApiTypes";
import { buildErrorComponent } from "../../elements/quiz/builErrorComponent";
import { Spacer } from "../../elements/Spacer";

const pageLink = () => '';

const pageHelp = <span>
    View information about a test without adding it to "My Tests". This page page does not show any questions.
</span>;

const Error = buildErrorComponent("Unknown Test", "There was an error loading that test.", rubricCrumbs);

const QuizFooter = ({quizId}: {quizId: string}) =>
    <div className="d-flex border-top pt-2 my-2 align-items-center">
        <Spacer/>
        <Button color="secondary" tag={Link} replace to={`/test/attempt/${quizId}`}>{"Take Test"}</Button>
    </div>;

export const QuizView = ({user}: {user: RegisteredUserDTO}) => {
    const {quizId} = useParams<{quizId: string}>();
    const quizRubricQuery = useGetQuizRubricQuery(quizId);
    const attempt = {
        quiz: quizRubricQuery.data && tags.augmentDocWithSubject(quizRubricQuery.data),
        quizId: quizRubricQuery.data?.id,
    };

    return <Container className={`mb-5 ${attempt?.quiz?.subjectId}`}>
        <ShowLoadingQuery query={quizRubricQuery} ifError={Error}>
            <QuizAttemptComponent view attempt={attempt} page={null} questions={[]} sections={{}} pageLink={pageLink} pageHelp={pageHelp} user={user} />
            <QuizFooter quizId={quizId} />
        </ShowLoadingQuery>
    </Container>;
};
