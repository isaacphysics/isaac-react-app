import React, { useEffect, useState } from "react";
import {
    useGetAttemptedFreelyByMeQuery,
    useGetQuizAssignmentsAssignedToMeQuery
} from "../../../state";
import {Link, RouteComponentProps, useHistory, withRouter} from "react-router-dom";
import * as RS from "reactstrap";

import {ShowLoading} from "../../handlers/ShowLoading";
import {QuizAssignmentDTO, QuizAttemptDTO, RegisteredUserDTO} from "../../../../IsaacApiTypes";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {formatDate} from "../../elements/DateString";
import {AppQuizAssignment} from "../../../../IsaacAppTypes";
import {
    extractTeacherName,
    isAttempt,
    isFound,
    isTutorOrAbove,
    partitionCompleteAndIncompleteQuizzes,
    siteSpecific
} from "../../../services";
import {Spacer} from "../../elements/Spacer";
import {Tabs} from "../../elements/Tabs";
import {PageFragment} from "../../elements/PageFragment";
import { CardGrid } from "../../elements/CardGrid";
import partition from "lodash/partition";

export interface QuizzesPageProps extends RouteComponentProps {
    user: RegisteredUserDTO;
}

type Quiz = AppQuizAssignment | QuizAttemptDTO;

interface QuizAssignmentProps {
    item: Quiz;
}

enum Status {
    Unstarted, Started, Complete
}

const todaysDate = new Date(new Date().setHours(0, 0, 0, 0));

function QuizItem({item}: QuizAssignmentProps) {
    const assignment = isAttempt(item) ? null : item;
    const attempt = isAttempt(item) ? item : assignment?.attempt;
    const status: Status = !attempt ? Status.Unstarted : !attempt.completedDate ? Status.Started : Status.Complete;
    const assignmentStartDate = assignment?.scheduledStartDate ?? assignment?.creationDate;
    const overdue = (status !== Status.Complete && assignment?.dueDate) ? (todaysDate > assignment.dueDate) : false;

    return <div className="p-2">
        <RS.Card className="card-neat my-quizzes-card">
            <RS.CardBody className="d-flex flex-column">
                <h4 className="border-bottom pb-3 mb-3">{item.quizSummary?.title || item.quizId }</h4>

                {assignment
                    ? assignment.dueDate && <p>Due date: <strong>{formatDate(assignment.dueDate)}</strong></p>
                    : attempt && siteSpecific(
                        <p>Freely {status === Status.Started ? "attempting" : "attempted"}</p>,
                        <p>{status === Status.Started ? "Attempting" : "Attempted"} independently</p>
                    )
                }
                {assignment && <p>
                    Set: {formatDate(assignmentStartDate)}
                    {assignment.assignerSummary && <> by {extractTeacherName(assignment.assignerSummary)}</>}
                </p>}
                {attempt && <p>
                    {status === Status.Complete ?
                        `Completed: ${formatDate(attempt.completedDate)}`
                        : `Started: ${formatDate(attempt.startDate)}`
                    }
                </p>}

                <Spacer/>

                <div className="text-center mt-4">
                    {assignment ? <>
                        {status === Status.Unstarted && !overdue && <RS.Button tag={Link} to={`/test/assignment/${assignment.id}`}>
                            {siteSpecific("Start Test", "Start test")}
                        </RS.Button>}
                        {status === Status.Started && !overdue && <RS.Button tag={Link} to={`/test/assignment/${assignment.id}`}>
                            {siteSpecific("Continue Test", "Continue test")}
                        </RS.Button>}
                        {overdue && <RS.Button tag={Link} to={`/test/assignment/${assignment.id}`} disabled={true}>
                            {siteSpecific("Overdue", "Overdue")}
                        </RS.Button>}
                        {status === Status.Complete && (
                            <RS.Button tag={Link} to={`/test/attempt/${assignment.attempt?.id}/feedback`} disabled={assignment.quizFeedbackMode === "NONE"}>
                                {assignment.quizFeedbackMode === "NONE" ? siteSpecific("No Feedback", "No feedback") : siteSpecific("View Feedback", "View feedback")}
                            </RS.Button>
                        )}
                    </> : attempt && <>
                        {status === Status.Started && <RS.Button tag={Link} to={`/test/attempt/${attempt.quizId}`}>
                            {siteSpecific("Continue Test", "Continue test")}
                        </RS.Button>}
                        {status === Status.Complete && (
                            <RS.Button tag={Link} to={`/test/attempt/${attempt.id}/feedback`}disabled={attempt.quizAssignment?.quizFeedbackMode === "NONE"}>
                                {attempt.quizAssignment?.quizFeedbackMode === "NONE" ? siteSpecific("No Feedback", "No feedback") : siteSpecific("View Feedback", "View feedback")}
                            </RS.Button>
                        )}
                    </>}
                </div>
            </RS.CardBody>
        </RS.Card>
    </div>;
}

interface AssignmentGridProps {
    quizzes: Quiz[];
    empty: string;
}

function QuizGrid({quizzes, empty}: AssignmentGridProps) {
    return <>
        {quizzes.length === 0 && <p>{empty}</p>}
        {quizzes.length > 0 && <CardGrid>
            {quizzes.map(item => <QuizItem key={(isAttempt(item) ? 'at' : 'as') + item.id} item={item}/>)}
        </CardGrid>}
    </>;
}

const MyQuizzesPageComponent = ({user}: QuizzesPageProps) => {

    const {data: quizAssignments} = useGetQuizAssignmentsAssignedToMeQuery();
    const {data: freeAttempts} = useGetAttemptedFreelyByMeQuery();

    const pageHelp = <span>
        Use this page to see tests you need to take and your test results.
        <br />
        You can also take some tests freely whenever you want to test your knowledge.
    </span>;

    function sortCurrentQuizzes(a : QuizAssignmentDTO, b : QuizAssignmentDTO) {
        // Compare by due date (or lack of due date) if possible
        if (a.dueDate && b.dueDate) {
            if (a.dueDate < b.dueDate) {
                return -1;
            }
            if (a.dueDate > b.dueDate) {
                return 1;
            }
        }
        else if (a.dueDate) {
            return -1;
        }
        else if (b.dueDate) {
            return 1;
        }
        // Otherwise compare by set date
        if (a.creationDate && b.creationDate) {
            if (a.creationDate < b.creationDate) {
                return -1;
            }
            if (a.creationDate > b.creationDate) {
                return 1;
            }
        }
        return 0;
    }

    function sortCompletedQuizzes(a : QuizAssignmentDTO, b : QuizAssignmentDTO) {
        // Compare by completion date; if incomplete (i.e. overdue), use due date instead
        const aDate = a.attempt?.completedDate ?? a.dueDate ?? 0;
        const bDate = b.attempt?.completedDate ?? b.dueDate ?? 0;
        if (aDate < bDate) {
            return -1;
        }
        if (aDate > bDate) {
            return 1;
        }
        return 0;
    }

    const [completedQuizzes, incompleteQuizzes] = quizAssignments ? partitionCompleteAndIncompleteQuizzes(quizAssignments) : [[], []];
    const [overdueQuizzes, currentQuizzes] = partition(incompleteQuizzes, a => a.dueDate ? todaysDate > a.dueDate : false);
    const sortedCurrentQuizzes = [...currentQuizzes].sort(sortCurrentQuizzes);
    
    const [completedFreeAttempts, currentFreeAttempts] = partitionCompleteAndIncompleteQuizzes(freeAttempts ?? []);
    const sortedCurrentFreeAttempts = [...currentFreeAttempts].sort(sortCurrentQuizzes);

    const completedOrOverdueQuizzes = [
        ...isFound(overdueQuizzes) ? overdueQuizzes : [],
        ...isFound(completedQuizzes) ? completedQuizzes : [],
        ...isFound(completedFreeAttempts) ? completedFreeAttempts : []
    ];
    const sortedCompletedOrOverdueQuizzes = [...completedOrOverdueQuizzes].sort(sortCompletedQuizzes);

    const tabAnchors = ["#in-progress", "#completed", "#practice"];

    const anchorMap = tabAnchors.reduce((acc, anchor, index) => 
        ({...acc, [anchor]: index + 1}), {} as Record<string, number>
    );

    const history = useHistory();
    const [tabOverride, setTabOverride] = useState<number | undefined>(anchorMap[location.hash as keyof typeof anchorMap]);

    useEffect(() => {
        if (location.hash && anchorMap[location.hash as keyof typeof anchorMap]) {
            setTabOverride(anchorMap[location.hash as keyof typeof anchorMap]);
        }
    }, [anchorMap]);

    return <RS.Container>
        <TitleAndBreadcrumb currentPageTitle={siteSpecific("My Tests", "My tests")} help={pageHelp} />
        <PageFragment fragmentId={`tests_help_${isTutorOrAbove(user) ? "teacher" : "student"}`} ifNotFound={<div className={"mt-5"}/>} />
        <Tabs className="mb-5 mt-4" tabContentClass="mt-4" activeTabOverride={tabOverride} onActiveTabChange={(index) => {
            history.replace({...history.location, hash: tabAnchors[index - 1]});
        }}>
            {{
                [siteSpecific("In Progress Tests", "Tests in progress")]:
                    <ShowLoading
                        until={quizAssignments}
                        ifNotFound={<RS.Alert color="warning">Your test assignments failed to load, please try refreshing the page.</RS.Alert>}
                    >
                        <QuizGrid quizzes={sortedCurrentQuizzes} empty="You don&apos;t have any incomplete or assigned tests."/>
                    </ShowLoading>,

                [siteSpecific("Past Tests", "Past tests")]:
                    <ShowLoading
                        until={quizAssignments}
                        ifNotFound={<RS.Alert color="warning">Your test assignments failed to load, please try refreshing the page.</RS.Alert>}
                    >
                        <QuizGrid quizzes={sortedCompletedOrOverdueQuizzes} empty="You don't have any completed or overdue tests."/>
                    </ShowLoading>,

                [siteSpecific("Practice Tests", "Practice tests")]:
                <>
                    <h3>{siteSpecific("In Progress", "In progress")}</h3>
                    <div className="mb-5">
                        <QuizGrid quizzes={sortedCurrentFreeAttempts} empty="You don't have any practice tests in progress."/>
                    </div>
                </>
            }}
        </Tabs>
    </RS.Container>;
};

export const MyQuizzes = withRouter(MyQuizzesPageComponent);
