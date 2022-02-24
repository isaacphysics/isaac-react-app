import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Link, withRouter} from "react-router-dom";
import * as RS from "reactstrap";

import {ShowLoading} from "../../handlers/ShowLoading";
import {QuizAttemptDTO, QuizSummaryDTO, RegisteredUserDTO} from "../../../../IsaacApiTypes";
import {selectors} from "../../../state/selectors";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {loadQuizAssignedToMe, loadQuizzes, loadQuizzesAttemptedFreelyByMe} from "../../../state/actions/quizzes";
import {formatDate} from "../../elements/DateString";
import {AppQuizAssignment} from "../../../../IsaacAppTypes";
import {extractTeacherName} from "../../../services/user";
import {isFound} from "../../../services/miscUtils";
import {Spacer} from "../../elements/Spacer";
import {SITE, SITE_SUBJECT} from "../../../services/siteConstants";
import {Tabs} from "../../elements/Tabs";
import {isAttempt, partitionCompleteAndIncompleteQuizzes} from "../../../services/quiz";

interface MyQuizzesPageProps {
    user: RegisteredUserDTO;
    location: {hash: string};
}

type Quiz = AppQuizAssignment | QuizAttemptDTO;

interface QuizAssignmentProps {
    item: Quiz;
}

enum Status {
    Unstarted, Started, Complete
}

function QuizItem({item}: QuizAssignmentProps) {
    const assignment = isAttempt(item) ? null : item;
    const attempt = isAttempt(item) ? item : assignment?.attempt;
    const status: Status = !attempt ? Status.Unstarted : !attempt.completedDate ? Status.Started : Status.Complete;
    return <div className="p-2">
        <RS.Card className="card-neat">
            <RS.CardBody>
                <h4 className="border-bottom pb-3 mb-3">{item.quizSummary?.title || item.quizId }</h4>

                {assignment ?
                    <p>{assignment.dueDate && <>Due date: <strong>{formatDate(assignment.dueDate)}</strong></>}</p> :
                    attempt && <p>Freely {status === Status.Started ? "attempting" : "attempted"}</p>
                }
                {assignment && <p>
                    Set: {formatDate(assignment.creationDate)}
                    {assignment.assignerSummary && <> by {extractTeacherName(assignment.assignerSummary)}</>}
                </p>}
                {attempt && <p>
                    {status === Status.Complete ?
                        `Completed: ${formatDate(attempt.completedDate)}`
                        : `Started: ${formatDate(attempt.startDate)}`
                    }
                </p>}

                <div className="text-center mt-4">
                    {assignment ? <>
                        {status === Status.Unstarted && <RS.Button tag={Link} to={`/test/assignment/${assignment.id}`}>
                            {{[SITE.CS]: "Start test", [SITE.PHY]: "Start Test"}[SITE_SUBJECT]}
                        </RS.Button>}
                        {status === Status.Started && <RS.Button tag={Link} to={`/test/assignment/${assignment.id}`}>
                            {{[SITE.CS]: "Continue test", [SITE.PHY]: "Continue Test"}[SITE_SUBJECT]}
                        </RS.Button>}
                        {status === Status.Complete && (
                            assignment.quizFeedbackMode !== "NONE" ?
                                <RS.Button tag={Link} to={`/test/attempt/${assignment.attempt?.id}/feedback`}>
                                    {{[SITE.CS]: "View feedback", [SITE.PHY]: "View Feedback"}[SITE_SUBJECT]}
                                </RS.Button>
                                :
                                <strong>No feedback available</strong>
                        )}
                    </> : attempt && <>
                        {status === Status.Started && <RS.Button tag={Link} to={`/test/attempt/${attempt.quizId}`}>
                            {{[SITE.CS]: "Continue test", [SITE.PHY]: "Continue Test"}[SITE_SUBJECT]}
                        </RS.Button>}
                        {status === Status.Complete && (
                            attempt.feedbackMode !== "NONE" ?
                                <RS.Button tag={Link} to={`/test/attempt/${attempt.id}/feedback`}>
                                    {{[SITE.CS]: "View feedback", [SITE.PHY]: "View Feedback"}[SITE_SUBJECT]}
                                </RS.Button>
                                :
                                <strong>No feedback available</strong>
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
        {quizzes.length > 0 && <div className="block-grid-xs-1 block-grid-md-2 block-grid-lg-3 my-2">
            {quizzes.map(item => <QuizItem key={(isAttempt(item) ? 'at' : 'as') + item.id} item={item}/>)}
        </div>}
    </>;
}

const MyQuizzesPageComponent = ({user}: MyQuizzesPageProps) => {
    const quizAssignments = useSelector(selectors.quizzes.assignedToMe);
    const freeAttempts = useSelector(selectors.quizzes.attemptedFreelyByMe);
    const quizzes = useSelector(selectors.quizzes.available);

    const dispatch = useDispatch();

    const startIndex = 0;

    useEffect(() => {
        dispatch(loadQuizzes(startIndex));
        dispatch(loadQuizAssignedToMe());
        dispatch(loadQuizzesAttemptedFreelyByMe());
    }, [dispatch, startIndex]);

    const pageHelp = <span>
        Use this page to see tests you need to take and your test results.
        <br />
        You can also take some tests freely whenever you want to test your knowledge.
    </span>;

    const assignmentsAndAttempts = [
        ...isFound(quizAssignments) ? quizAssignments : [],
        ...isFound(freeAttempts) ? freeAttempts : [],
    ];
    const [completedQuizzes, incompleteQuizzes] = partitionCompleteAndIncompleteQuizzes(assignmentsAndAttempts);

    const showQuiz = (quiz: QuizSummaryDTO) => {
        switch (user.role) {
            case "STUDENT":
                return (quiz.hiddenFromRoles && !quiz.hiddenFromRoles?.includes("STUDENT")) || quiz.visibleToStudents
            case "TEACHER":
                return (quiz.hiddenFromRoles && !quiz.hiddenFromRoles?.includes("TEACHER")) ?? true
            default:
                return true
        }
    };

    return <RS.Container>
        <TitleAndBreadcrumb currentPageTitle={{[SITE.CS]: "My tests", [SITE.PHY]: "My Tests"}[SITE_SUBJECT]} help={pageHelp} />

        <Tabs className="mb-5 mt-4" tabContentClass="mt-4">
            {{
                [{[SITE.CS]: "In progress tests", [SITE.PHY]: "In Progress Tests"}[SITE_SUBJECT]]:
                    <ShowLoading
                        until={quizAssignments}
                        ifNotFound={<RS.Alert color="warning">Your test assignments failed to load, please try refreshing the page.</RS.Alert>}
                    >
                        <QuizGrid quizzes={incompleteQuizzes} empty="You don't have any incomplete or assigned tests."/>
                    </ShowLoading>,

                [{[SITE.CS]: "Completed tests", [SITE.PHY]: "Completed Tests"}[SITE_SUBJECT]]:
                    <ShowLoading
                        until={quizAssignments}
                        ifNotFound={<RS.Alert color="warning">Your test assignments failed to load, please try refreshing the page.</RS.Alert>}
                    >
                        <QuizGrid quizzes={completedQuizzes} empty="You haven't completed any tests."/>
                    </ShowLoading>,

                [{[SITE.CS]: "Practice tests", [SITE.PHY]: "Practice Tests"}[SITE_SUBJECT]]:
                    <ShowLoading until={quizzes}>
                        {quizzes && <>
                            {quizzes.length === 0 && <p><em>There are no tests currently available.</em></p>}
                            <RS.ListGroup className="mb-3 quiz-list">
                                {quizzes.filter(showQuiz).map(quiz => <RS.ListGroupItem className="p-0 bg-transparent" key={quiz.id}>
                                    <div className="d-flex flex-grow-1 flex-column flex-sm-row align-items-center p-3">
                                        <span className="mb-2 mb-sm-0">{quiz.title}</span>
                                        {quiz.summary && <div className="small text-muted d-none d-md-block">{quiz.summary}</div>}
                                        <Spacer />
                                        <RS.Button tag={Link} to={{pathname: `/test/attempt/${quiz.id}`}}>
                                            {{[SITE.CS]: "Take test", [SITE.PHY]: "Take Test"}[SITE_SUBJECT]}
                                        </RS.Button>
                                    </div>
                                </RS.ListGroupItem>)}
                            </RS.ListGroup>
                        </>}
                    </ShowLoading>
            }}
        </Tabs>
    </RS.Container>;
};

export const MyQuizzes = withRouter(MyQuizzesPageComponent);
