import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {withRouter} from "react-router-dom";
import * as RS from "reactstrap";

import {ShowLoading} from "../../handlers/ShowLoading";
import {QuizAssignmentDTO, RegisteredUserDTO} from "../../../../IsaacApiTypes";
import {selectors} from "../../../state/selectors";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {loadQuizAssignedToMe} from "../../../state/actions/quizzes";
import {formatDate} from "../../elements/DateString";
import {AppQuizAssignment} from "../../../../IsaacAppTypes";
import {extractTeacherName} from "../../../services/user";
import {isDefined} from "../../../services/miscUtils";
import { partition } from 'lodash';
import { Link } from 'react-router-dom';
import {NOT_FOUND} from "../../../services/constants";

interface MyQuizzesPageProps {
    user: RegisteredUserDTO;
    location: {hash: string};
}

interface QuizAssignmentProps {
    assignment: AppQuizAssignment;
}

enum Status {
    Unstarted, Started, Complete
}

function QuizAssignment({assignment}: QuizAssignmentProps) {
    const attempt = assignment.attempt;
    const status: Status = !attempt ? Status.Unstarted : !attempt.completedDate ? Status.Started : Status.Complete;
    return <div className="p-2">
        <RS.Card><RS.CardBody>
            <RS.CardTitle><h4>{assignment.quizSummary?.title || assignment.quizId}</h4></RS.CardTitle>
            <p>
                {assignment.dueDate && <>Due date: <strong>{formatDate(assignment.dueDate)}</strong></>}
            </p>
            {status === Status.Unstarted && <RS.Button tag={Link} to={`/quiz/do_assignment/${assignment.id}`}>Start quiz</RS.Button>}
            {status === Status.Started && <RS.Button tag={Link} to={`/quiz/do_assignment/${assignment.id}`}>Continue quiz</RS.Button>}
            {status === Status.Complete && <RS.Button>View feedback</RS.Button>}
            <p className="mb-1 mt-3">
                Set: {formatDate(assignment.creationDate)} {assignment.assignerSummary && <>by {extractTeacherName(assignment.assignerSummary)}</>}
                {attempt && (status === Status.Complete ?
                    <><br />Completed: {formatDate(attempt.completedDate)}</>
                    : <><br />Started: {formatDate(attempt.startDate)}</>)}
            </p>
        </RS.CardBody>
    </RS.Card></div>;
}

interface AssignmentGridProps {
    quizAssignments: QuizAssignmentDTO[];
    title: string;
    empty: string;
}

function AssignmentGrid({quizAssignments, title, empty}: AssignmentGridProps) {
    return <>
        <h2>{title}</h2>
        {quizAssignments.length === 0 && <p>{empty}</p>}
        {quizAssignments.length > 0 && <div className="block-grid-xs-1 block-grid-md-2 block-grid-lg-3 my-2">
            {quizAssignments.map(assignment => <QuizAssignment key={assignment.id} assignment={assignment}/>)}
        </div>}
    </>;
}

const MyQuizzesPageComponent = ({user}: MyQuizzesPageProps) => {
    const quizAssignments = useSelector(selectors.quizzes.assignedToMe);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(loadQuizAssignedToMe());
    }, [dispatch]);

    const pageHelp = <span>
        Use this page to see quizzes you need to take and your quiz results.
        <br />
        You can also take some quizzes freely whenever you want to test your knowledge.
    </span>;

    const [completedAssignments, incompleteAssignments] = partition(isDefined(quizAssignments) && quizAssignments !== NOT_FOUND ? quizAssignments : [], a => isDefined(a.attempt?.completedDate));

    return <RS.Container>
        <TitleAndBreadcrumb currentPageTitle="My quizzes" help={pageHelp} />
        <ShowLoading until={quizAssignments} ifNotFound={<RS.Alert color="warning">Your quiz assignments failed to load, please try refreshing the page.</RS.Alert>}>
            <AssignmentGrid quizAssignments={incompleteAssignments} title="Quizzes you have been assigned" empty="You don't have any incomplete assigned quizzes." />
            <AssignmentGrid quizAssignments={completedAssignments} title="Quizzes you have completed" empty="You haven't completed any assigned quizzes." />
        </ShowLoading>
    </RS.Container>;
};

export const MyQuizzes = withRouter(MyQuizzesPageComponent);
