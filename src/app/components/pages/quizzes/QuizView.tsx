import React from "react";
import {useGetQuizRubricQuery} from "../../../state";
import {useParams} from "react-router-dom";
import {tags} from "../../../services";
import {QuizAttemptComponent, rubricCrumbs} from "../../elements/quiz/QuizAttemptComponent";
import {Container} from "reactstrap";
import {ShowLoadingQuery} from "../../handlers/ShowLoadingQuery";
import type { RegisteredUserDTO } from "../../../../IsaacApiTypes";
import { buildErrorComponent } from "../../elements/quiz/builErrorComponent";

const pageLink = () => '';

const pageHelp = <span> View information about this test. </span>;

const Error = buildErrorComponent("Unknown Test", "There was an error loading that test.", rubricCrumbs);

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
        </ShowLoadingQuery>
    </Container>;
};
