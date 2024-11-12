import React, { ReactNode, useCallback, useEffect, useState } from "react";
import {
    useGetAttemptedFreelyByMeQuery,
    useGetQuizAssignmentsAssignedToMeQuery
} from "../../../state";
import {Link, RouteComponentProps, useHistory, withRouter} from "react-router-dom";

import {ShowLoading} from "../../handlers/ShowLoading";
import {RegisteredUserDTO} from "../../../../IsaacApiTypes";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {formatDate} from "../../elements/DateString";
import {QuizzesBoardOrder} from "../../../../IsaacAppTypes";
import {
    convertAssignmentToQuiz,
    convertAttemptToQuiz,
    DisplayableQuiz,
    extractTeacherName,
    isDefined,
    isTutorOrAbove,
    QuizStatus,
    siteSpecific
} from "../../../services";
import {Spacer} from "../../elements/Spacer";
import {Tabs} from "../../elements/Tabs";
import {PageFragment} from "../../elements/PageFragment";
import { CardGrid } from "../../elements/CardGrid";
import { SortItemHeader } from "../../elements/SortableItemHeader";
import { Card, CardBody, Button, Table, Container, Alert } from "reactstrap";
import orderBy from "lodash/orderBy";
import partition from "lodash/partition";
import classNames from "classnames";
import StyledToggle from "../../elements/inputs/StyledToggle";
import { TrLink } from "../../elements/tables/TableLinks";

export interface QuizzesPageProps extends RouteComponentProps {
    user: RegisteredUserDTO;
}

interface QuizAssignmentProps {
    quiz: DisplayableQuiz;
}

function QuizItem({quiz}: QuizAssignmentProps) {
    const assignmentStartDate = quiz.startDate ?? quiz.creationDate;

    return <div className="p-2">
        <Card className="card-neat my-quizzes-card">
            <CardBody className="d-flex flex-column">
                <h4 className="border-bottom pb-3 mb-3">{quiz.title || quiz.id }</h4>

                {quiz.isAssigned
                    ? quiz.dueDate && <p>Due date: <strong>{formatDate(quiz.dueDate)}</strong></p>
                    : quiz.attempt && siteSpecific(
                        <p>Freely {quiz.status === QuizStatus.Started ? "attempting" : "attempted"}</p>,
                        <p>{quiz.status === QuizStatus.Started ? "Attempting" : "Attempted"} independently</p>
                    )
                }
                {quiz.isAssigned && <p>
                    Set: {formatDate(assignmentStartDate)}
                    {quiz.assignerSummary && <> by {extractTeacherName(quiz.assignerSummary)}</>}
                </p>}
                {quiz.attempt && <p>
                    {quiz.status === QuizStatus.Complete ?
                        `Completed: ${formatDate(quiz.attempt.completedDate)}`
                        : `Started: ${formatDate(quiz.attempt.startDate)}`
                    }
                </p>}

                <Spacer/>

                <div className="text-center mt-4">
                    {quiz.isAssigned ? <>
                        {quiz.status === QuizStatus.NotStarted && <Button tag={Link} to={`/test/assignment/${quiz.id}`}>
                            {siteSpecific("Start Test", "Start test")}
                        </Button>}
                        {quiz.status === QuizStatus.Started && <Button tag={Link} to={`/test/assignment/${quiz.id}`}>
                            {siteSpecific("Continue Test", "Continue test")}
                        </Button>}
                        {quiz.status === QuizStatus.Overdue && <Button tag={Link} to={`/test/assignment/${quiz.id}`} disabled={true}>
                            {siteSpecific("Overdue", "Overdue")}
                        </Button>}
                        {quiz.status === QuizStatus.Complete && (
                            <Button tag={Link} to={`/test/attempt/${quiz.attempt?.id}/feedback`} disabled={quiz.quizFeedbackMode === "NONE"}>
                                {quiz.quizFeedbackMode === "NONE" ? siteSpecific("No Feedback", "No feedback") : siteSpecific("View Feedback", "View feedback")}
                            </Button>
                        )}
                    </> : quiz.attempt && <>
                        {quiz.status === QuizStatus.Started && <Button tag={Link} to={`/test/attempt/${quiz.attempt.id}`}>
                            {siteSpecific("Continue Test", "Continue test")}
                        </Button>}
                        {quiz.status === QuizStatus.Complete && (
                            <Button tag={Link} to={`/test/attempt/${quiz.attempt.id}/feedback`}disabled={quiz.quizFeedbackMode === "NONE"}>
                                {quiz.quizFeedbackMode === "NONE" ? siteSpecific("No Feedback", "No feedback") : siteSpecific("View Feedback", "View feedback")}
                            </Button>
                        )}
                    </>}
                </div>
            </CardBody>
        </Card>
    </div>;
}

interface AssignmentGridProps {
    quizzes: DisplayableQuiz[];
    emptyMessage: ReactNode;
}

function QuizGrid({quizzes, emptyMessage}: AssignmentGridProps) {
    return <>
        {quizzes.length === 0 && <p>{emptyMessage}</p>}
        {quizzes.length > 0 && <CardGrid>
            {quizzes.map(quiz => <QuizItem key={(quiz.isAssigned ? 'as' : 'at') + quiz.id} quiz={quiz}/>)}
        </CardGrid>}
    </>;
}

// To avoid the chaos of QuizProgressCommon, this and PracticeQuizTable are **separate components**. Despite this repeating some code, please don't try to merge them.
const AssignedQuizTable = ({quizzes, boardOrder, setBoardOrder, emptyMessage}: {quizzes: DisplayableQuiz[], boardOrder: QuizzesBoardOrder, setBoardOrder: (order: QuizzesBoardOrder) => void, emptyMessage: ReactNode}) => {

    return <Table className="my-quizzes-table mb-0" responsive>
        <colgroup>
            <col className={"col-md-5"}/>
            <col className={"col-md-2"}/>
            <col className={"col-md-2"}/>
            <col className={"col-md-2"}/>
            <col className={"col-md-1"}/>
        </colgroup>
        <thead className="card-header">
            <tr>
                <SortItemHeader<QuizzesBoardOrder> defaultOrder={QuizzesBoardOrder.title} reverseOrder={QuizzesBoardOrder["-title"]} currentOrder={boardOrder} setOrder={setBoardOrder} alignment="start">Title</SortItemHeader>
                <SortItemHeader<QuizzesBoardOrder> defaultOrder={QuizzesBoardOrder.setBy} reverseOrder={QuizzesBoardOrder["-setBy"]} currentOrder={boardOrder} setOrder={setBoardOrder} alignment="start">Set by</SortItemHeader>
                <SortItemHeader<QuizzesBoardOrder> defaultOrder={QuizzesBoardOrder.dueDate} reverseOrder={QuizzesBoardOrder["-dueDate"]} currentOrder={boardOrder} setOrder={setBoardOrder} alignment="start">Due Date</SortItemHeader>
                <SortItemHeader<QuizzesBoardOrder> defaultOrder={QuizzesBoardOrder.setDate} reverseOrder={QuizzesBoardOrder["-setDate"]} currentOrder={boardOrder} setOrder={setBoardOrder} alignment="start">Set Date</SortItemHeader>
                <th/> {/* chevrons */}
            </tr>
        </thead>
        <tbody>
            {quizzes.map(quiz => {
                return <TrLink to={quiz.link} key={quiz.id} className={classNames("align-middle", {"completed": quiz.status === QuizStatus.Complete}, {"overdue": quiz.status === QuizStatus.Overdue})}>
                    <td>
                        <div>
                            {quiz.title || quiz.id}<br/>
                            {quiz.status === QuizStatus.Overdue && <span className="small text-muted mt-1">Overdue</span>}
                            {quiz.status === QuizStatus.Started && <span className="small text-muted mt-1">Started</span>}
                            {quiz.status === QuizStatus.NotStarted && <span className="small text-muted mt-1">Not started</span>}
                            {quiz.status === QuizStatus.Complete && <>
                                <span className="small text-muted mt-1">Completed &middot; </span>
                                {quiz.quizFeedbackMode === "NONE" ? <span className="small text-muted mt-1">No feedback available</span> 
                                    : <span className="small text-muted mt-1">Feedback available</span>
                                }
                            </>}
                        </div>
                    </td>
                    <td>{quiz.assignerSummary && extractTeacherName(quiz.assignerSummary)}</td>
                    <td>{quiz.dueDate && formatDate(quiz.dueDate)}</td>
                    <td>{quiz.setDate && formatDate(quiz.setDate)}</td>
                    <td className="text-center"><img className="icon-dropdown-90" src={"/assets/common/icons/chevron_right.svg"} alt="" /></td>
                </TrLink>;
            })}
            {quizzes.length === 0 && <tr>
                <td colSpan={5} className="text-center">{emptyMessage}</td>
            </tr>}
        </tbody>
    </Table>;
};

const PracticeQuizTable = ({quizzes, boardOrder, setBoardOrder, emptyMessage}: {quizzes: DisplayableQuiz[], boardOrder: QuizzesBoardOrder, setBoardOrder: (order: QuizzesBoardOrder) => void, emptyMessage: ReactNode}) => {
    return <Table className="my-quizzes-table mb-0" responsive>
        <colgroup>
            <col className={"col-md-9"}/>
            <col className={"col-md-2"}/>
            <col className={"col-md-1"}/>
        </colgroup>
        <thead className="card-header">
            <tr>
                <SortItemHeader<QuizzesBoardOrder> defaultOrder={QuizzesBoardOrder.title} reverseOrder={QuizzesBoardOrder["-title"]} currentOrder={boardOrder} setOrder={setBoardOrder} alignment="start">Title</SortItemHeader>
                <SortItemHeader<QuizzesBoardOrder> defaultOrder={QuizzesBoardOrder.startDate} reverseOrder={QuizzesBoardOrder["-startDate"]} currentOrder={boardOrder} setOrder={setBoardOrder} alignment="start">Start Date</SortItemHeader>
                <th/> {/* chevrons */}
            </tr>
        </thead>
        <tbody>
            {quizzes.map(quiz => {
                return <TrLink to={quiz.link} key={quiz.id} tabIndex={0} className={classNames("align-middle", {"completed": quiz.status === QuizStatus.Complete})}>
                    <td>
                        <div className="d-flex flex-column align-items-start">
                            {quiz.title || quiz.id}
                            {quiz.status === QuizStatus.Complete && <span className="small text-muted mt-1">Completed</span>}
                        </div>
                    </td>
                    <td>{formatDate(quiz.startDate)}</td>
                    <td className="text-center"><img className="icon-dropdown-90" src={"/assets/common/icons/chevron_right.svg"} alt="" /></td>
                </TrLink>;
            })}
            {quizzes.length === 0 && <tr>
                <td colSpan={3} className="text-center">{emptyMessage}</td>
            </tr>}
        </tbody>
    </Table>;
};

const MyQuizzesPageComponent = ({user}: QuizzesPageProps) => {

    const {data: quizAssignments} = useGetQuizAssignmentsAssignedToMeQuery();
    const {data: freeAttempts} = useGetAttemptedFreelyByMeQuery();

    const [displayMode, setDisplayMode] = useState<"table" | "cards">("table");
    const [boardOrder, setBoardOrder] = useState<QuizzesBoardOrder>(QuizzesBoardOrder.dueDate);
    const [showCompleted, setShowCompleted] = useState(false);

    const sortQuizzesByOrder = useCallback((quizzes: DisplayableQuiz[]) => {
        // if we're in table mode, sort by the order set by the user via the columns (boardOrder).
        // if we're in cards mode, sort by the default order: due date, then set date, then title.
        return displayMode === "table" ? orderBy(
            quizzes, 
            [boardOrder.valueOf().charAt(0) === "-" ? boardOrder.valueOf().slice(1) : boardOrder, "title"], 
            [boardOrder.valueOf().charAt(0) === "-" ? "desc" : "asc", "asc"]
        ) : orderBy(quizzes, [
            (q) => q.dueDate,
            (q) => q.setDate,
            (q) => q.title ?? ""
        ], ["asc", "asc", "asc"]);
    }, [boardOrder, displayMode]);

    const pageHelp = <span>
        Use this page to see tests you need to take and your test results.
        <br />
        You can also take some tests freely whenever you want to test your knowledge.
    </span>;

    // quizAssignments are quizzes; they have a start date, due date, assignee, etc. They can only be completed once, i.e. have a single attempt inside the object.
    // freeAttempts is a list of attempts at a quiz, i.e. they are not quizzes themselves. We want to display them the same, though, so we must sort this type discrepancy out first.
    const [assignedQuizzes, practiceQuizzes] = [quizAssignments?.map(convertAssignmentToQuiz).filter(isDefined) ?? [], freeAttempts?.map(convertAttemptToQuiz).filter(isDefined) ?? []];

    const [pastAssignedQuizzes, activeAssignedQuizzes] = partition(assignedQuizzes, quiz => quiz.status === QuizStatus.Complete || quiz.status === QuizStatus.Overdue);
    const [pastPracticeQuizzes, activePracticeQuizzes] = partition(practiceQuizzes, quiz => quiz.status === QuizStatus.Complete);

    const sortedAssignedQuizzes = sortQuizzesByOrder([...activeAssignedQuizzes, ...(showCompleted ? pastAssignedQuizzes : [])]);
    const sortedPracticeQuizzes = sortQuizzesByOrder([...activePracticeQuizzes, ...(showCompleted ? pastPracticeQuizzes : [])]);

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

    const displayModeToggle = <div className="d-flex flex-column align-items-center align-self-end w-max-content pb-3 pe-3">
        <span>Display mode</span>
        <StyledToggle
            checked={displayMode === "cards"}
            falseLabel="Table"
            trueLabel="Cards"
            onChange={() => setDisplayMode(d => d === "table" ? "cards" : "table")}
        />
    </div>;

    const pastTestsToggle = <div className="d-flex flex-column align-items-center align-self-end w-max-content pb-3">
        <span>Past tests</span>
        <StyledToggle
            checked={showCompleted}
            falseLabel="Hidden"
            trueLabel="Shown"
            onChange={() => setShowCompleted(c => !c)}
        />
    </div>;

    const emptyAssignedMessage = <span className="text-muted">{showCompleted
        ? "You have not completed any tests."
        : "You have no tests in progress."
    }</span>;

    const emptyPracticeMessage = <span className="text-muted">{showCompleted
        ? "You have not completed any practice tests."
        : "You have no practice tests in progress."
    } Find some <Link to="/practice_tests">here</Link>!</span>;

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={siteSpecific("My Tests", "My tests")} help={pageHelp} />
        <PageFragment fragmentId={`tests_help_${isTutorOrAbove(user) ? "teacher" : "student"}`} ifNotFound={<div className={"mt-5"}/>} />
        <Tabs className="mb-5 mt-4" tabContentClass="mt-4" activeTabOverride={tabOverride} onActiveTabChange={(index) => {
            history.replace({...history.location, hash: tabAnchors[index - 1]});
            setBoardOrder(index === 1 ? QuizzesBoardOrder.dueDate : QuizzesBoardOrder.title);
        }}>
            {{
                [siteSpecific("Assigned Tests", "Assigned tests")]:
                    <ShowLoading 
                        until={quizAssignments}
                        ifNotFound={<Alert color="warning">Your test assignments failed to load, please try refreshing the page.</Alert>}
                    >
                        <div className="d-flex flex-column">
                            <div className="d-flex justify-content-end">
                                {displayModeToggle}
                                {pastTestsToggle}
                            </div>
                            {displayMode === "table" ? <Card>
                                <AssignedQuizTable 
                                    quizzes={sortedAssignedQuizzes} boardOrder={boardOrder} setBoardOrder={setBoardOrder}
                                    emptyMessage={emptyAssignedMessage}
                                />
                            </Card> : <QuizGrid quizzes={sortedAssignedQuizzes} emptyMessage={emptyAssignedMessage}/>}
                        </div>
                    </ShowLoading>,
                [siteSpecific("My Practice Tests", "My practice tests")]:
                    <ShowLoading 
                        until={freeAttempts}
                        ifNotFound={<Alert color="warning">Your practice test attempts failed to load, please try refreshing the page.</Alert>}
                    >
                        <div className="d-flex flex-column">
                            <div className="d-flex justify-content-end">
                                {displayModeToggle}
                                {pastTestsToggle}
                            </div>
                            {displayMode === "table" ? <Card>
                                <PracticeQuizTable 
                                    quizzes={sortedPracticeQuizzes} boardOrder={boardOrder} setBoardOrder={setBoardOrder}
                                    emptyMessage={emptyPracticeMessage}
                                />
                            </Card> : <QuizGrid quizzes={sortedPracticeQuizzes} emptyMessage={emptyPracticeMessage}/>}
                        </div>
                    </ShowLoading>,
            }}
        </Tabs>
    </Container>;
};

export const MyQuizzes = withRouter(MyQuizzesPageComponent);
