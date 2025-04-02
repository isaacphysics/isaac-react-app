import React, { ReactNode, useCallback, useEffect, useState } from "react";
import {
    useGetAttemptedFreelyByMeQuery,
    useGetQuizAssignmentsAssignedToMeQuery
} from "../../../state";
import {Link, RouteComponentProps, useHistory, withRouter} from "react-router-dom";

import {ShowLoading} from "../../handlers/ShowLoading";
import {RegisteredUserDTO} from "../../../../IsaacApiTypes";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {formatDate, getFriendlyDaysUntil} from "../../elements/DateString";
import {QuizzesBoardOrder} from "../../../../IsaacAppTypes";
import {
    above,
    convertAssignmentToQuiz,
    convertAttemptToQuiz,
    DisplayableQuiz,
    extractTeacherName,
    HUMAN_SUBJECTS,
    isAda,
    isDefined,
    isPhy,
    isTutorOrAbove,
    QuizStatus,
    selectOnChange,
    siteSpecific,
    Subject,
    tags,
    useDeviceSize
} from "../../../services";
import {Spacer} from "../../elements/Spacer";
import {Tabs} from "../../elements/Tabs";
import {PageFragment} from "../../elements/PageFragment";
import { SortItemHeader } from "../../elements/SortableItemHeader";
import { Card, CardBody, Button, Table, Container, Alert, Row, Col, Label, Input } from "reactstrap";
import orderBy from "lodash/orderBy";
import classNames from "classnames";
import StyledToggle from "../../elements/inputs/StyledToggle";
import { TrLink } from "../../elements/tables/TableLinks";
import { StyledSelect } from "../../elements/inputs/StyledSelect";
import { CollapsibleContainer } from "../../elements/CollapsibleContainer";
import { FilterCount } from "../../elements/svg/FilterCount";
import { MainContent, MyQuizzesSidebar, SidebarLayout } from "../../elements/layout/SidebarLayout";
import { PhyHexIcon } from "../../elements/svg/PhyHexIcon";
import { CardGrid } from "../../elements/CardGrid";

export interface QuizzesPageProps extends RouteComponentProps {
    user: RegisteredUserDTO;
}

interface QuizAssignmentProps {
    quiz: DisplayableQuiz;
}

const QuizButton = ({quiz}: QuizAssignmentProps) => {
    return <>{quiz.isAssigned ? <>
        {quiz.status === QuizStatus.NotStarted && <Button tag={Link} to={quiz.link}>
            {siteSpecific("Start Test", "Start test")}
        </Button>}
        {quiz.status === QuizStatus.Started && <Button tag={Link} to={quiz.link}>
            {siteSpecific("Continue Test", "Continue test")}
        </Button>}
        {quiz.status === QuizStatus.Overdue && <Button tag={Link} to={quiz.link} disabled={true}>
            {siteSpecific("Overdue", "Overdue")}
        </Button>}
        {quiz.status === QuizStatus.Complete && (
            <Button tag={Link} to={quiz.link} disabled={quiz.quizFeedbackMode === "NONE"}>
                {quiz.quizFeedbackMode === "NONE" ? siteSpecific("No Feedback", "No feedback") : siteSpecific("View Feedback", "View feedback")}
            </Button>
        )}
    </> : quiz.attempt && <>
        {quiz.status === QuizStatus.Started && <Button tag={Link} to={quiz.link}>
            {siteSpecific("Continue Test", "Continue test")}
        </Button>}
        {quiz.status === QuizStatus.Complete && <Button tag={Link} to={quiz.link} disabled={quiz.quizFeedbackMode === "NONE"}>
            {quiz.quizFeedbackMode === "NONE" ? siteSpecific("No Feedback", "No feedback") : siteSpecific("View Feedback", "View feedback")}
        </Button>
        }
    </>}</>;
};

const PhyQuizItem = ({quiz}: QuizAssignmentProps) => {
    const assignmentStartDate = quiz.startDate ?? quiz.creationDate;
    const deviceSize = useDeviceSize();
    const determineQuizSubject = (quizSummary?: DisplayableQuiz) => {
        return quizSummary?.tags?.filter(tag => tags.allSubjectTags.map(t => t.id.valueOf()).includes(tag.toLowerCase())).reduce((acc, tag) => acc + `${tag.toLowerCase()}`, "");
    };
    const subject = determineQuizSubject(quiz); 
    return <div className="p-2">
        <Card className="h-100 rounded-card">
            <CardBody className="d-flex flex-column">
                <Row className="row-cols-1 row-cols-sm-2">
                    <Col className="d-flex flex-column align-items-start col-sm-8">
                        <div className="d-flex align-items-center">
                            <div className="d-flex justify-content-center board-subject-hexagon-size me-4 my-2">
                                <PhyHexIcon icon="icon-tests" subject={subject as Subject} className="assignment-hex ps-3"/>
                            </div>
                            <div className="d-flex flex-column flex-grow-1">
                                <h4>{quiz.title || quiz.id }</h4>
                                {above['sm'](deviceSize) && isDefined(subject) && <div className="d-flex align-items-center mb-2">
                                    <span className="badge rounded-pill bg-theme me-1" data-bs-theme={subject}>{HUMAN_SUBJECTS[subject]}</span>
                                </div>}
                            </div>
                        </div>
                    </Col>
                    <Col className="d-flex flex-column justify-content-between col-sm-4">
                        {quiz.isAssigned
                            ? quiz.dueDate && <p>Due date: <strong>{getFriendlyDaysUntil(quiz.dueDate)}</strong></p>
                            : quiz.attempt && <p>Freely {quiz.status === QuizStatus.Started ? "attempting" : "attempted"}</p>                           
                        }
                        {quiz.isAssigned && <p>
                            Set: <strong>{getFriendlyDaysUntil(assignmentStartDate as Date)}</strong>
                            {quiz.assignerSummary && <> by {extractTeacherName(quiz.assignerSummary)}</>}
                        </p>}
                        {quiz.attempt && <p>
                            {quiz.status === QuizStatus.Complete ?
                                <>Completed: <strong>{getFriendlyDaysUntil(quiz.attempt.completedDate as Date)}</strong></>
                                : <>Started: <strong>{getFriendlyDaysUntil(quiz.attempt.startDate as Date)}</strong></>
                            }
                        </p>}
                        <QuizButton quiz={quiz}/>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    </div>;
};

const AdaQuizItem = ({quiz}: QuizAssignmentProps) => {
    const assignmentStartDate = quiz.startDate ?? quiz.creationDate;
    return <div className="p-2">
        <Card className="card-neat my-quizzes-card">
            <CardBody className="d-flex flex-column">
                <h4 className="border-bottom pb-3 mb-3">{quiz.title || quiz.id }</h4>
                {quiz.isAssigned
                    ? quiz.dueDate && <p>Due date: <strong>{formatDate(quiz.dueDate)}</strong></p>
                    : quiz.attempt && <p>{quiz.status === QuizStatus.Started ? "Attempting" : "Attempted"} independently</p>
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
                    <QuizButton quiz={quiz}/>
                </div>
            </CardBody>
        </Card>
    </div>;
};

const QuizItem = siteSpecific(PhyQuizItem, AdaQuizItem);

interface AssignmentGridProps {
    quizzes: DisplayableQuiz[];
    emptyMessage: ReactNode;
}

function QuizGrid({quizzes, emptyMessage}: AssignmentGridProps) {
    return <>
        {quizzes.length === 0 && <p>{emptyMessage}</p>}
        {quizzes.length > 0 && siteSpecific(
            <>
                {quizzes.map(quiz => <QuizItem key={(quiz.isAssigned ? 'as' : 'at') + quiz.id} quiz={quiz}/>)}
            </>,
            <CardGrid>
                {quizzes.map(quiz => <QuizItem key={(quiz.isAssigned ? 'as' : 'at') + quiz.id} quiz={quiz}/>)}
            </CardGrid>)
        }
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

interface AdaQuizFiltersProps {
    setQuizTitleFilter: (title: string) => void;
    setQuizCreatorFilter: (creator: string) => void;
    quizStatusFilter: QuizStatus[];
    setQuizStatusFilter: React.Dispatch<React.SetStateAction<QuizStatus[]>>;
    setShowCompleted: (show: boolean) => void;
    showFilters: boolean;
}

const AdaQuizFilters = ({setShowCompleted, setQuizTitleFilter, setQuizCreatorFilter, quizStatusFilter, setQuizStatusFilter, showFilters}: AdaQuizFiltersProps) => {
    return <CollapsibleContainer expanded={showFilters}>
        <Row>
            <Col xs={6}>
                <Label className="w-100">
                    <span className={"text-nowrap"}>Filter by quiz title</span>
                    <Input type="text" data-testid="title-filter" onChange={(e) => setQuizTitleFilter(e.target.value)}/>
                </Label>
            </Col>
            <Col xs={6}>
                <Label className="w-100">
                    <span className={"text-nowrap"}>Filter by assigner</span>
                    <Input type="text" data-testid="title-filter" onChange={(e) => setQuizCreatorFilter(e.target.value)} />
                </Label>
            </Col>
        </Row>
        <Row className="pb-3">
            <Col xs={12}>
                <Label className="w-100">
                    <span className={"text-nowrap"}>Filter by status</span>
                    <StyledSelect 
                        isMulti
                        value={quizStatusFilter.map(status => ({value: status, label: status}))} 
                        options={Object.values(QuizStatus).map(status => ({value: status, label: status}))}
                        onChange={(newValues) => {
                            selectOnChange(setQuizStatusFilter, true)(newValues);
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
    
export const DisplayModeToggle = ({displayMode, setDisplayMode}: {displayMode: "table" | "cards", setDisplayMode: React.Dispatch<React.SetStateAction<"table" | "cards">>}) => {
    return <div className={classNames("d-flex flex-column align-items-start", {"pb-3 pe-3 col-8 col-sm-6 col-md-3": isAda})}>
        {isAda && <span>Display in</span>}
        <div className="d-flex flex-column align-items-center align-self-start w-max-content pb-3 pe-3">
            <StyledToggle
                checked={displayMode === "cards"}
                falseLabel="Table"
                trueLabel="Cards"
                onChange={() => setDisplayMode(d => d === "table" ? "cards" : "table")}
            />
        </div>
    </div>;
};

export const PastTestsToggle = ({showCompleted, setShowCompleted, setQuizStatusFilter}: {showCompleted: boolean, setShowCompleted: (show: boolean) => void, setQuizStatusFilter: React.Dispatch<React.SetStateAction<QuizStatus[]>>}) => {
    return <div className={classNames("d-flex flex-column align-items-start w-max-content", {"pb-3": isAda})}>
        <span>Past tests</span>
        <div className="h-100 align-content-center">
            <StyledToggle
                checked={showCompleted}
                falseLabel="Hidden"
                trueLabel="Shown"
                onChange={() => {
                    const target = !showCompleted;
                    setShowCompleted(target);
                    setQuizStatusFilter(s => target ? [...s, QuizStatus.Complete, QuizStatus.Overdue] : s.filter(status => ![QuizStatus.Complete, QuizStatus.Overdue].includes(status)));
                }}
            />
        </div>
    </div>;
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
    const [quizCreatorFilter, setQuizCreatorFilter] = useState("");
    const [quizStatusFilter, setQuizStatusFilter] = useState<QuizStatus[]>([QuizStatus.NotStarted, QuizStatus.Started]);

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
        const statusMatches = !quizStatusFilter || (!!quiz.status && quizStatusFilter.includes(quiz.status) || quizStatusFilter.includes(QuizStatus.All));
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

    // +!! converts a string to 0 if null or empty and 1 otherwise
    const filterCount = +!!quizTitleFilter + +!!quizCreatorFilter + quizStatusFilter.length;

    // Ada-only
    const filtersToggle = <Col xs={3} sm={2} md={1} className="pb-3 ms-3">
        <Label className="w-100 d-flex flex-column align-items-center mb-0">
            <span className="text-nowrap">
                Filters
                {<FilterCount count={filterCount ?? 0} widthPx={siteSpecific(25, 20)} className={classNames("ms-2", {"mb-1" : isPhy})}/>}
            </span>
            <Button color="secondary" className={classNames("w-100 gameboards-filter-dropdown align-self-center", {"selected": showFilters})}
                onClick={() => setShowFilters(s => !s)} data-testid="filter-dropdown"/>
        </Label>
    </Col>;

    const tabTopContent = <>
        {isAda && <>
            <div className="d-flex">
                {<DisplayModeToggle displayMode={displayMode} setDisplayMode={setDisplayMode}/>}
                <Spacer/>
                {above["sm"](deviceSize) && <PastTestsToggle showCompleted={showCompleted} setShowCompleted={setShowCompleted} setQuizStatusFilter={setQuizStatusFilter}/>}
                {filtersToggle}
            </div>
            <AdaQuizFilters setShowCompleted={setShowCompleted} setQuizCreatorFilter={setQuizCreatorFilter} setQuizTitleFilter={setQuizTitleFilter} 
                quizStatusFilter={quizStatusFilter} setQuizStatusFilter={setQuizStatusFilter} showFilters={showFilters}/>
        </>}
    </>;

    const emptyAssignedMessage = <span className="text-muted">{!quizAssignments || quizAssignments.length === 0
        ? "You have no tests in progress."
        : <>No tests match your filters. Are you looking for <button className="btn-link text-muted p-0 m-0 bg-transparent" onClick={() => setQuizStatusFilter([QuizStatus.All])}>past tests</button>?</>
    }</span>;

    const emptyPracticeMessage = <span className="text-muted">{!freeAttempts || freeAttempts.length === 0
        ? <>You have no practice tests. Take some new tests <Link to="/practice_tests">here</Link>!</>
        : "No practice tests match your filters."
    }</span>;

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={siteSpecific("My Tests", "My tests")} help={pageHelp} />
        <PageFragment fragmentId={`tests_help_${isTutorOrAbove(user) ? "teacher" : "student"}`} ifNotFound={<div className={"mt-5"}/>} />
        <SidebarLayout>
            <MyQuizzesSidebar setQuizTitleFilter={setQuizTitleFilter} setQuizCreatorFilter={setQuizCreatorFilter} quizStatusFilter={quizStatusFilter} 
                setQuizStatusFilter={setQuizStatusFilter} activeTab={tabOverride ?? 1} displayMode={displayMode} setDisplayMode={setDisplayMode}/>
            <MainContent>
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
            </MainContent>
        </SidebarLayout>
    </Container>;
};

export const MyQuizzes = withRouter(MyQuizzesPageComponent);
