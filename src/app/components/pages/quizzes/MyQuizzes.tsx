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
    above,
    convertAssignmentToQuiz,
    convertAttemptToQuiz,
    DisplayableQuiz,
    extractTeacherName,
    isTutorOrAbove,
    QuizStatus,
    selectOnChange,
    siteSpecific,
    useDeviceSize
} from "../../../services";
import {Spacer} from "../../elements/Spacer";
import {Tabs} from "../../elements/Tabs";
import {PageFragment} from "../../elements/PageFragment";
import { CardGrid } from "../../elements/CardGrid";
import { SortItemHeader } from "../../elements/SortableItemHeader";
import { Card, CardBody, Button, Table, Container, Alert, Row, Col, Label, Input } from "reactstrap";
import orderBy from "lodash/orderBy";
import classNames from "classnames";
import StyledToggle from "../../elements/inputs/StyledToggle";
import { TrLink } from "../../elements/tables/TableLinks";
import { StyledDropdown } from "../../elements/inputs/DropdownInput";
import { StyledSelect } from "../../elements/inputs/StyledSelect";
import { CollapsibleContainer } from "../../elements/CollapsibleContainer";
import { FilterCount } from "../../elements/svg/FilterCount";

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
                    <td className="text-center"><img className="icon-dropdown-90" aria-disabled={!quiz.link} src={"/assets/common/icons/chevron_right.svg"} alt="" /></td>
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

interface QuizFiltersProps {
    setShowCompleted: (show: boolean) => void;
    setQuizCreator: (creator: string) => void;
    setQuizTitleFilter: (title: string) => void;
    quizStatuses: QuizStatus[];
    setQuizStatuses: React.Dispatch<React.SetStateAction<QuizStatus[]>>;
    showFilters: boolean;
}

const QuizFilters = ({setShowCompleted, setQuizTitleFilter, setQuizCreator, quizStatuses, setQuizStatuses, showFilters}: QuizFiltersProps) => {
    return <CollapsibleContainer expanded={showFilters}>
        <Row>
            <Col xs={6}>
                <Label className="w-100">
                    <span className={"text-nowrap"}>Filter by quiz title</span>
                    <Input type="text" data-testid="title-filter" onChange={(e) => setQuizTitleFilter(e.target.value)} />
                </Label>
            </Col>
            <Col xs={6}>
                <Label className="w-100">
                    <span className={"text-nowrap"}>Filter by assigner</span>
                    <Input type="text" data-testid="title-filter" onChange={(e) => setQuizCreator(e.target.value)} />
                </Label>
            </Col>
        </Row>
        <Row className="pb-3">
            <Col xs={12}>
                <Label className="w-100">
                    <span className={"text-nowrap"}>Filter by status</span>
                    <StyledSelect 
                        isMulti 
                        value={quizStatuses.map(status => ({value: status, label: status}))} 
                        options={Object.values(QuizStatus).map(status => ({value: status, label: status}))}
                        onChange={(newValues) => {
                            selectOnChange(setQuizStatuses, true)(newValues);
                            setShowCompleted(newValues.map(v => v.value).includes(QuizStatus.Complete) || newValues.map(v => v.value).includes(QuizStatus.Overdue));
                        }}
                        menuPortalTarget={document.body} 
                        styles={{ menuPortal: base => ({ ...base, zIndex: 1000 }) }}
                    />
                </Label>
            </Col>
        </Row>
    </CollapsibleContainer>;
};

const MyQuizzesPageComponent = ({user}: QuizzesPageProps) => {

    const {data: quizAssignments} = useGetQuizAssignmentsAssignedToMeQuery();
    const {data: freeAttempts} = useGetAttemptedFreelyByMeQuery();

    const [displayMode, setDisplayMode] = useState<"table" | "cards">("table");
    const [boardOrder, setBoardOrder] = useState<QuizzesBoardOrder>(QuizzesBoardOrder.dueDate);
    const [showCompleted, setShowCompleted] = useState(false);

    const deviceSize = useDeviceSize();
    
    const [showFilters, setShowFilters] = useState(false);
    const [quizTitleFilter, setQuizTitleFilter] = useState("");
    const [quizCreatorFilter, setQuizCreator] = useState("");
    const [quizStatusFilter, setQuizStatuses] = useState<QuizStatus[]>([QuizStatus.NotStarted, QuizStatus.Started]);

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

    const quizMatchesFilters = (quiz: DisplayableQuiz | undefined) : quiz is DisplayableQuiz => {
        if (!quiz) return false;
        const titleMatches = !quizTitleFilter || (quiz.title?.toLowerCase().includes(quizTitleFilter.toLowerCase()) ?? true);
        const creatorMatches = !quizCreatorFilter || (extractTeacherName(quiz.assignerSummary)?.toLowerCase().includes(quizCreatorFilter.toLowerCase()) ?? true);
        const statusMatches = !quizStatusFilter || (!!quiz.status && quizStatusFilter.includes(quiz.status));
        return titleMatches && creatorMatches && statusMatches;
    };

    // quizAssignments are quizzes; they have a start date, due date, assignee, etc. They can only be completed once, i.e. have a single attempt inside the object.
    // freeAttempts is a list of attempts at a quiz, i.e. they are not quizzes themselves. We want to display them the same, though, so we must sort this type discrepancy out first.
    const [assignedQuizzes, practiceQuizzes] = [quizAssignments?.map(convertAssignmentToQuiz).filter(quizMatchesFilters) ?? [], freeAttempts?.map(convertAttemptToQuiz).filter(quizMatchesFilters) ?? []];

    const sortedAssignedQuizzes = sortQuizzesByOrder(assignedQuizzes);
    const sortedPracticeQuizzes = sortQuizzesByOrder(practiceQuizzes);

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

    // TODO: revert to StyledToggle when the component is more widely used (post-redesign)

    // const displayModeToggle = <div className="d-flex flex-column align-items-center align-self-end w-max-content pb-3 pe-3">
    //     <span>Display mode</span>
    //     <StyledToggle
    //         checked={displayMode === "cards"}
    //         falseLabel="Table"
    //         trueLabel="Cards"
    //         onChange={() => setDisplayMode(d => d === "table" ? "cards" : "table")}
    //     />
    const displayModeToggle = <div className="d-flex flex-column align-items-start pb-3 pe-3 col-8 col-sm-6 col-md-3">
        <span>Display in</span>
        <StyledDropdown value={displayMode} onChange={() => setDisplayMode(d => d === "table" ? "cards" : "table")}>
            <option value="table">Table View</option>
            <option value="cards">Card View</option>
        </StyledDropdown>
    </div>;

    const pastTestsToggle = <div className="d-flex flex-column align-items-center w-max-content pb-3">
        <span>Past tests</span>
        <div className="h-100 align-content-center">
            <StyledToggle
                checked={showCompleted}
                falseLabel="Hidden"
                trueLabel="Shown"
                onChange={() => {
                    const target = !showCompleted;
                    setShowCompleted(target);
                    setQuizStatuses(s => target ? [...s, QuizStatus.Complete, QuizStatus.Overdue] : s.filter(status => ![QuizStatus.Complete, QuizStatus.Overdue].includes(status)));
                }}
            />
        </div>
    </div>;

    // +!! converts a string to 0 if null or empty and 1 otherwise
    const filterCount = +!!quizTitleFilter + +!!quizCreatorFilter + quizStatusFilter.length;

    const filtersToggle = <Col xs={3} sm={2} md={1} className="pb-3 ms-3">
        <Label className="w-100 d-flex flex-column align-items-center mb-0">
            <span className="text-nowrap">
                Filters
                {<FilterCount count={filterCount ?? 0} className="ms-2 mb-1" />}
            </span>
            <Button color="secondary" className={classNames("w-100 gameboards-filter-dropdown align-self-center", {"selected": showFilters})}
                onClick={() => setShowFilters(s => !s)} data-testid="filter-dropdown"/>
        </Label>
    </Col>;

    const tabTopContent = <>
        <div className="d-flex">
            {displayModeToggle}
            <Spacer/>
            {above["sm"](deviceSize) && pastTestsToggle}
            {filtersToggle}
        </div>
        <QuizFilters setShowCompleted={setShowCompleted} setQuizCreator={setQuizCreator} setQuizTitleFilter={setQuizTitleFilter} 
            quizStatuses={quizStatusFilter} setQuizStatuses={setQuizStatuses} showFilters={showFilters}/>
    </>;

    const emptyAssignedMessage = <span className="text-muted">{!quizAssignments || quizAssignments.length === 0
        ? "You have no tests in progress."
        : "No tests match your filters."
    }</span>;

    const emptyPracticeMessage = <span className="text-muted">{!freeAttempts || freeAttempts.length === 0
        ? <>You have no practice tests. Take some new tests <Link to="/practice_tests">here</Link>!</>
        : "No practice tests match your filters."
    }</span>;

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
                            {tabTopContent}
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
                            {tabTopContent}
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
