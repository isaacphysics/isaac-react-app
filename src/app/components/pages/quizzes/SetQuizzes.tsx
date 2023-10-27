import React, {useEffect, useMemo, useState} from "react";
import {
    showQuizSettingModal,
    useAppDispatch,
    useGetGroupsQuery,
    useGetQuizAssignmentsSetByMeQuery,
    useCancelQuizAssignmentMutation
} from "../../../state";
import {Link, RouteComponentProps, withRouter} from "react-router-dom";
import * as RS from "reactstrap";
import {ShowLoading} from "../../handlers/ShowLoading";
import {QuizAssignmentDTO, QuizSummaryDTO, RegisteredUserDTO} from "../../../../IsaacApiTypes";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {Spacer} from "../../elements/Spacer";
import {formatDate, formatISODateOnly} from "../../elements/DateString";
import {AppQuizAssignment} from "../../../../IsaacAppTypes";
import {
    above,
    below, confirmThen,
    isAda,
    isEventLeaderOrStaff,
    isPhy, isStaff, KEY,
    MANAGE_QUIZ_TAB,
    nthHourOf, persistence,
    siteSpecific,
    TODAY,
    useDeviceSize,
    useFilteredQuizzes
} from "../../../services";
import {Tabs} from "../../elements/Tabs";
import {IsaacSpinner} from "../../handlers/IsaacSpinner";
import {ShowLoadingQuery} from "../../handlers/ShowLoadingQuery";
import {PageFragment} from "../../elements/PageFragment";
import {RenderNothing} from "../../elements/RenderNothing";
import classNames from "classnames";

interface SetQuizzesPageProps extends RouteComponentProps {
    user: RegisteredUserDTO;
}

interface QuizAssignmentProps {
    user: RegisteredUserDTO;
    assignment: AppQuizAssignment;
}

function formatAssignmentOwner(user: RegisteredUserDTO, assignment: QuizAssignmentDTO) {
    if (user.id === assignment.ownerUserId) {
        return "Me";
    } else if (assignment.assignerSummary && assignment.assignerSummary.givenName && assignment.assignerSummary.familyName) {
        return assignment.assignerSummary.givenName + " " + assignment.assignerSummary.familyName;
    } else {
        return "Someone else";
    }
}

function QuizAssignment({user, assignment}: QuizAssignmentProps) {
    const [markQuizAsCancelled, {isLoading: isCancelling}] = useCancelQuizAssignmentMutation();
    const cancel = () => confirmThen(
        "Are you sure you want to cancel?\r\nStudents will no longer be able to take the test or see any feedback, and all previous attempts will be lost.",
        () => markQuizAsCancelled(assignment.id as number)
    );
    const assignmentNotYetStarted = assignment?.scheduledStartDate && nthHourOf(0, assignment?.scheduledStartDate) > TODAY();
    const quizTitle = (assignment.quizSummary?.title || assignment.quizId) + (assignmentNotYetStarted ? ` (starts ${formatDate(assignment?.scheduledStartDate)})` : "");
    return <div className="p-2">
        <RS.Card className="card-neat">
            <RS.CardBody>
                <h4 className="border-bottom pb-3 mb-3">{quizTitle}</h4>

                <p>Set to: <strong>{assignment.groupName ?? "Unknown"}</strong></p>
                <p>Set on: <strong>{formatDate(assignment.creationDate)}</strong> by <strong>{formatAssignmentOwner(user, assignment)}</strong></p>
                <RS.Row>
                    {assignment.scheduledStartDate && <RS.Col>
                        <p>Start date: <strong>{formatDate(assignment.scheduledStartDate)}</strong></p>
                    </RS.Col>}
                    <RS.Col>
                        <p>{assignment.dueDate ? <>Due date: <strong>{formatDate(assignment.dueDate)}</strong></> : <>No due date</>}</p>
                    </RS.Col>
                </RS.Row>

                <div className="mt-4 text-right">
                    <RS.Button color="tertiary" size="sm" outline onClick={cancel} disabled={isCancelling} className="mr-1 bg-light">
                        {isCancelling ? <><IsaacSpinner size="sm" /> Cancelling...</> : siteSpecific("Cancel Test", "Cancel test")}
                    </RS.Button>
                    <RS.Button tag={Link} to={`/test/assignment/${assignment.id}/feedback`} disabled={isCancelling} color={isCancelling ? "tertiary" : undefined} size="sm" className="ml-1">
                        View {assignmentNotYetStarted ? siteSpecific("Details", "details") : siteSpecific("Results", "results")}
                    </RS.Button>
                </div>
            </RS.CardBody>
        </RS.Card>
    </div>;
}

const SetQuizzesPageComponent = ({user, location}: SetQuizzesPageProps) => {
    const dispatch = useAppDispatch();
    const deviceSize = useDeviceSize();
    const hashAnchor = location.hash?.slice(1) ?? null;
    const [activeTab, setActiveTab] = useState(MANAGE_QUIZ_TAB.set);

    const { data: groups } = useGetGroupsQuery(false);
    const groupIdToName = useMemo<{[id: number]: string | undefined}>(() => groups?.reduce((acc, group) => group?.id ? {...acc, [group.id]: group.groupName} : acc, {} as {[id: number]: string | undefined}) ?? {}, [groups]);
    const quizAssignmentsQuery = useGetQuizAssignmentsSetByMeQuery();


    // Set active tab using hash anchor
    useEffect(() => {
        // @ts-ignore
        const tab: MANAGE_QUIZ_TAB =
            (hashAnchor && MANAGE_QUIZ_TAB[hashAnchor as any]) ||
            MANAGE_QUIZ_TAB.set;
        setActiveTab(tab);
    }, [hashAnchor]);

    const {titleFilter, setTitleFilter, filteredQuizzes} = useFilteredQuizzes(user);

    const [showFilters, setShowFilters] = useState(false);
    const [manageQuizzesTitleFilter, setManageQuizzesTitleFilter] = useState("");
    const [manageQuizzesGroupNameFilter, setManageQuizzesGroupNameFilter] = useState("");
    const [quizSetDateFilterType, setQuizSetDateFilterType] = useState('after');
    const [quizDueDateFilterType, setQuizDueDateFilterType] = useState('before');
    const [quizSetDate, setQuizSetDate] = useState<Date | undefined>(undefined);
    const [quizDueDate, setQuizDueDate] = useState<Date | undefined>(undefined);
    
    const pageTitle= siteSpecific("Set / Manage Tests", "Manage tests");
    const pageHelp = <span>
        Use this page to manage and set tests to your groups. You can assign any test the {siteSpecific("Isaac", "Ada")} team have built.
        <br />
        Students in the group will be emailed when you set a new test.
    </span>;

    // If the user is event admin or above, and the quiz is hidden from teachers, then show that
    // Otherwise, show if the quiz is visible to students
    const roleVisibilitySummary = (quiz: QuizSummaryDTO) => <>
        {isEventLeaderOrStaff(user) && quiz.hiddenFromRoles && quiz.hiddenFromRoles?.includes("TEACHER") && <div className="small text-muted d-block ml-2">hidden from teachers</div>}
        {((quiz.hiddenFromRoles && !quiz.hiddenFromRoles?.includes("STUDENT")) || quiz.visibleToStudents) && <div className="small text-muted d-block ml-2">visible to students</div>}
    </>;

    const filterByDate = (dateFilterType: string, assignmentDate: Date | number | undefined, comparisonDate: Date | number) => {
        if (!assignmentDate) return false;
        switch (dateFilterType) {
            case 'after':
                return assignmentDate >= nthHourOf(24, comparisonDate);
            case 'before':
                return assignmentDate <= nthHourOf(0, comparisonDate);
            case 'on':
                return assignmentDate >= nthHourOf(0, comparisonDate) && assignmentDate <= nthHourOf(24, comparisonDate);
        }
    };

    const rowFiltersView = ((isPhy && above["sm"](deviceSize)) || (isAda && above["md"](deviceSize)));

    const titleFilterInput = <RS.Row>
        <RS.Input
            id="manage-quizzes-title-filter" type="search" className={rowFiltersView ? "mb-4" : "mb-2"}
            value={manageQuizzesTitleFilter} onChange={event => setManageQuizzesTitleFilter(event.target.value)}
            placeholder="Filter by title" aria-label="Filter by title"
        />
    </RS.Row>;

    const groupFilterInput = <RS.Row>
        <RS.Input
            id="manage-quizzes-group-name-filter" type="search" className={rowFiltersView ? "mb-4" : "mb-2"}
            value={manageQuizzesGroupNameFilter} onChange={event => setManageQuizzesGroupNameFilter(event.target.value)}
            placeholder="Filter by group" aria-label="Filter by group"
        />
    </RS.Row>;

    const setDateFilterInput = <RS.Row className="d-flex align-items-baseline">
        <span className={classNames("p-1 quiz-filter-date-span", rowFiltersView ? "mb-4" : "mb-2")}>Set</span>
        <RS.UncontrolledDropdown className={classNames("quiz-date-filter-type", rowFiltersView ? "mb-4" : "mb-2")}>
            <RS.DropdownToggle className={"p-0 m-1"} color="tertiary" caret>{quizSetDateFilterType}</RS.DropdownToggle>
            <RS.DropdownMenu>
                <RS.DropdownItem onClick={() => setQuizSetDateFilterType('after')}>
                    after
                </RS.DropdownItem>
                <RS.DropdownItem onClick={() => setQuizSetDateFilterType('before')}>
                    before
                </RS.DropdownItem>
                <RS.DropdownItem onClick={() => setQuizSetDateFilterType('on')}>
                    on
                </RS.DropdownItem>
            </RS.DropdownMenu>
        </RS.UncontrolledDropdown>
        <RS.Input
            id="manage-quizzes-set-date-filter" type="date" className={classNames("quiz-filter-date-input p-1", rowFiltersView ? "mb-4" : "mb-2")}
            value={quizSetDate && !isNaN(quizSetDate.valueOf()) ? formatISODateOnly(quizSetDate) : undefined} onChange={event => setQuizSetDate(new Date(event.target.value))}
            placeholder="Filter by set date" aria-label="Filter by set date"
        />
    </RS.Row>;

    const dueDateFilterInput = <RS.Row className="d-flex align-items-baseline">
        <span className={classNames("p-1 quiz-filter-date-span", rowFiltersView ? "mb-4" : "mb-2")}>Due</span>
        <RS.UncontrolledDropdown className={classNames("quiz-date-filter-type", rowFiltersView ? "mb-4" : "mb-2")}>
            <RS.DropdownToggle className="p-0 m-1" color="tertiary" caret>{quizDueDateFilterType}</RS.DropdownToggle>
            <RS.DropdownMenu>
                <RS.DropdownItem onClick={() => setQuizDueDateFilterType('after')}>
                    after
                </RS.DropdownItem>
                <RS.DropdownItem onClick={() => setQuizDueDateFilterType('before')}>
                    before
                </RS.DropdownItem>
                <RS.DropdownItem onClick={() => setQuizDueDateFilterType('on')}>
                    on
                </RS.DropdownItem>
            </RS.DropdownMenu>
        </RS.UncontrolledDropdown>
        <RS.Input
            id="manage-quizzes-due-date-filter" type="date" className={classNames("quiz-filter-date-input p-1", rowFiltersView ? "mb-4" : "mb-2")}
            value={quizDueDate && !isNaN(quizDueDate.valueOf()) ? formatISODateOnly(quizDueDate) : undefined} onChange={event => setQuizDueDate(new Date(event.target.value))}
            placeholder="Filter by due date" aria-label="Filter by due date"
        />
    </RS.Row>;

    return <RS.Container>
        <TitleAndBreadcrumb currentPageTitle={pageTitle} help={pageHelp} modalId={isPhy ? "set_tests_help" : undefined} />
        <PageFragment fragmentId={"set_tests_help"} ifNotFound={RenderNothing} />
        <Tabs className="my-4 mb-5" tabContentClass="mt-4" activeTabOverride={activeTab}>
            {{
                [siteSpecific("Set Tests", "Available tests")]:
                <ShowLoading until={filteredQuizzes}>
                    {filteredQuizzes && <>
                        <p>The following tests are available to set to your groups.</p>
                        <RS.Input
                            id="available-quizzes-title-filter" type="search" className="mb-4"
                            value={titleFilter} onChange={event => setTitleFilter(event.target.value)}
                            placeholder="Search by title" aria-label="Search by title"
                        />
                        {filteredQuizzes.length === 0 && <p><em>There are no tests you can set which match your search term.</em></p>}
                        <RS.ListGroup className="mb-2 quiz-list">
                            {filteredQuizzes.map(quiz =>  <RS.ListGroupItem className="p-0 bg-transparent" key={quiz.id}>
                                <div className="d-flex flex-grow-1 flex-row align-items-center p-3">
                                    <div className="d-flex flex-column">
                                        <span className="mb-2 mb-sm-0 pr-2">{quiz.title}</span>
                                        {roleVisibilitySummary(quiz)}
                                    </div>
                                    {quiz.summary && <div className="small text-muted d-none d-md-block">{quiz.summary}</div>}
                                    <Spacer />
                                    <RS.Button className={`d-none d-md-block h-4 ${below["md"](deviceSize) ? "btn-sm" : ""}`} style={{minWidth: `${below["md"](deviceSize) ? "90px" : "140px"}`}} onClick={() => dispatch(showQuizSettingModal(quiz, isStaff(user)))}>
                                        {siteSpecific("Set Test", "Set test")}
                                    </RS.Button>
                                </div>
                                <RS.UncontrolledButtonDropdown className="d-flex d-md-none">
                                    <RS.DropdownToggle caret className="text-nowrap" size="sm" color="link">
                                        Actions
                                    </RS.DropdownToggle>
                                    <RS.DropdownMenu>
                                            <RS.DropdownItem onClick={() => dispatch(showQuizSettingModal(quiz, isStaff(user)))} style={{zIndex: '1'}}>
                                                {siteSpecific("Set Test", "Set test")}
                                            </RS.DropdownItem>
                                            <RS.DropdownItem divider />
                                            <Link className="w-100" style={{textDecoration: 'none'}} to={{pathname: `/test/preview/${quiz.id}`}}>
                                                <RS.DropdownItem>
                                                    Preview
                                                </RS.DropdownItem>
                                            </Link>
                                        </RS.DropdownMenu>
                                </RS.UncontrolledButtonDropdown> 
                                <div className="d-none d-md-flex align-items-center">
                                    <Link className="my-3 mr-2 pl-3 pr-4 quiz-list-separator" to={{pathname: `/test/preview/${quiz.id}`}}>
                                        <span>Preview</span>
                                    </Link>
                                </div>
                            </RS.ListGroupItem>)}
                        </RS.ListGroup>
                    </>}
                </ShowLoading>,

                [siteSpecific("Manage Tests", "Previously set tests")]:
                <>
                    <div className="d-flex justify-content-center mb-4">
                        <RS.Button color="tertiary" size="sm" onClick={() => setShowFilters(s => !s)}>
                            {showFilters ? "Hide filters" : "Show filters"}
                        </RS.Button>
                    </div>
                    {showFilters && (rowFiltersView
                        ? <RS.Row>
                            <RS.Col xs={6} className="d-flex flex-column align-items-center">
                                {titleFilterInput}
                                {setDateFilterInput}
                            </RS.Col>
                            <RS.Col xs={6} className="d-flex flex-column align-items-center">
                                {groupFilterInput}
                                {dueDateFilterInput}
                            </RS.Col>
                        </RS.Row>
                        : <RS.Col className="d-flex flex-column align-items-center">
                            {titleFilterInput}
                            {groupFilterInput}
                            {setDateFilterInput}
                            {dueDateFilterInput}
                        </RS.Col>)
                    }
                    <ShowLoadingQuery
                        query={quizAssignmentsQuery}
                        ifError={() => <RS.Alert color="warning">Tests you have assigned have failed to load, please try refreshing the page.</RS.Alert>}
                        thenRender={quizAssignments => {
                            let quizAssignmentsWithGroupNames: AppQuizAssignment[] = quizAssignments.map(assignment => {
                                const groupName = persistence.load(KEY.ANONYMISE_GROUPS) === "YES"
                                ? `Demo Group ${assignment.groupId}`
                                : groupIdToName[assignment.groupId as number] ?? "Unknown Group";
                                return {...assignment, groupName};
                            });
                            if (showFilters) {
                                const filters = [];
                                if (manageQuizzesTitleFilter !== "") {
                                    filters.push((assignment : AppQuizAssignment) => assignment.quizSummary?.title?.toLowerCase().includes(manageQuizzesTitleFilter.toLowerCase()));
                                }
                                if (manageQuizzesGroupNameFilter !== "") {
                                    filters.push((assignment : AppQuizAssignment) => assignment.groupName?.toLowerCase().includes(manageQuizzesGroupNameFilter.toLowerCase()));
                                }
                                if (quizSetDate && !isNaN(quizSetDate.valueOf())) {
                                    filters.push((assignment : AppQuizAssignment) => {
                                        return filterByDate(quizSetDateFilterType, assignment.creationDate, quizSetDate);
                                    });
                                }
                                if (quizDueDate && !isNaN(quizDueDate.valueOf())) {
                                    filters.push((assignment : AppQuizAssignment) => {
                                        return filterByDate(quizDueDateFilterType, assignment.dueDate, quizDueDate);
                                    });
                                }
                                quizAssignmentsWithGroupNames = quizAssignmentsWithGroupNames.filter(filters.reduce((acc, filter) => (assignment) => acc(assignment) && filter(assignment), () => true));
                            }
                            return <>
                                {quizAssignments.length === 0 && <p>You have not set any tests to your groups yet.</p>}
                                {quizAssignments.length > 0 && <div className="block-grid-xs-1 block-grid-md-2 block-grid-xl-3 my-2">
                                    {quizAssignmentsWithGroupNames.map(assignment => <QuizAssignment key={assignment.id} user={user} assignment={assignment} />)}
                                </div>}
                            </>;
                        }}
                    />
                </>
            }}
        </Tabs>
    </RS.Container>;
};

export const SetQuizzes = withRouter(SetQuizzesPageComponent);
