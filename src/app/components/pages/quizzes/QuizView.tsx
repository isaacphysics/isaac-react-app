import React from "react";
import {useGetQuizRubricQuery} from "../../../state";
import {Link, useParams} from "react-router-dom";
import {isTeacherOrAbove, siteSpecific, tags} from "../../../services";
import {QuizContentsComponent, rubricCrumbs} from "../../elements/quiz/QuizContentsComponent";
import {Button, Col, Container, Row} from "reactstrap";
import {ShowLoadingQuery} from "../../handlers/ShowLoadingQuery";
import type { RegisteredUserDTO } from "../../../../IsaacApiTypes";
import { buildErrorComponent } from "../../elements/quiz/buildErrorComponent";
import { Spacer } from "../../elements/Spacer";

const pageHelp = <span>
    View information about a test without adding it to {siteSpecific('"My Tests"', '"My tests"')}. This page does not show any questions.
</span>;

const Error = buildErrorComponent("Unknown Test", "There was an error loading that test.", rubricCrumbs);

const FooterButton = ({link, label}: {link: string, label: string}) => <Col className="d-flex">
    <Button className="flex-fill d-flex text-nowrap align-items-center justify-content-center mb-3" color="secondary" tag={Link} to={link}>
        {label}
    </Button>
</Col>; 

const QuizFooter = ({quizId, user}: {quizId: string, user: RegisteredUserDTO}) =>
    <div className="d-flex border-top pt-2 my-2 align-items-center">
        <Spacer />
        <Row>
            {isTeacherOrAbove(user) && <FooterButton link={`/test/preview/${quizId}`} label="Preview" />}
            <FooterButton link={`/test/attempt/${quizId}`} label="Take Test" />
        </Row>
    </div>;

export const QuizView = ({user}: {user: RegisteredUserDTO}) => {
    const {quizId} = useParams<{quizId: string}>();
    const quizRubricQuery = useGetQuizRubricQuery(quizId);
    const view = {
        quiz: quizRubricQuery.data && tags.augmentDocWithSubject(quizRubricQuery.data),
        quizId: quizRubricQuery.data?.id,
    };

    return <Container className={`mb-5 ${view?.quiz?.subjectId}`}>
        <ShowLoadingQuery query={quizRubricQuery} ifError={Error}>
            <QuizContentsComponent view={view} pageHelp={pageHelp} user={user} />
            <QuizFooter quizId={quizId} user={user} />
        </ShowLoadingQuery>
    </Container>;
};
